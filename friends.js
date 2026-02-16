// friends.js - Friends management page
/* =========================================================
   Friends Feature - Add, Remove, and Manage Friends
   ========================================================= */

/* ------------------------ Helpers ------------------------ */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function toast(msg, duration = 2000) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

/* ------------------------ Firebase Reference ------------------------ */
const FB = window.FB;
let currentUser = null;
let friendsCache = [];
let requestsCache = [];

/* ------------------------ Authentication Check ------------------------ */
async function checkAuth() {
  if (!FB || !FB.auth) {
    toast("Firebase not initialized", 3000);
    setTimeout(() => (window.location.href = "index.html"), 1500);
    return null;
  }

  return new Promise((resolve) => {
    FB.onAuthStateChanged(FB.auth, (user) => {
      if (!user) {
        toast("Please log in to view friends", 3000);
        setTimeout(() => (window.location.href = "index.html"), 1500);
        resolve(null);
      } else {
        currentUser = user;
        resolve(user);
      }
    });
  });
}

/* ------------------------ Tab Management ------------------------ */
function setupTabs() {
  const tabs = $$(".friends-tab");
  const panels = $$(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Update active panel
      panels.forEach((p) => p.classList.remove("active"));
      $(`#${targetTab}-panel`)?.classList.add("active");
    });
  });
}

/* ------------------------ Get User's Friends ------------------------ */
async function getFriends(userId) {
  try {
    const userRef = FB.doc(FB.db, "users", userId);
    const userSnap = await FB.getDoc(userRef);

    if (!userSnap.exists()) return [];

    const userData = userSnap.data();
    const friendIds = userData.friends || [];

    if (friendIds.length === 0) return [];

    // Get friend user data (batch in chunks of 10 for Firestore 'in' query limit)
    const friends = [];
    for (let i = 0; i < friendIds.length; i += 10) {
      const chunk = friendIds.slice(i, i + 10);
      const q = FB.query(
        FB.collection(FB.db, "users"),
        FB.where("uid", "in", chunk),
      );
      const snapshot = await FB.getDocs(q);
      snapshot.forEach((doc) => friends.push(doc.data()));
    }

    return friends;
  } catch (error) {
    console.error("[friends] Error getting friends:", error);
    return [];
  }
}

/* ------------------------ Get Friend Requests ------------------------ */
async function getFriendRequests(userId) {
  try {
    const q = FB.query(
      FB.collection(FB.db, "friendRequests"),
      FB.where("to", "==", userId),
      FB.where("status", "==", "pending"),
    );

    const snapshot = await FB.getDocs(q);
    const requests = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      // Get sender's user data
      const senderRef = FB.doc(FB.db, "users", data.from);
      const senderSnap = await FB.getDoc(senderRef);

      if (senderSnap.exists()) {
        requests.push({
          requestId: doc.id,
          from: data.from,
          userData: senderSnap.data(),
          createdAt: data.createdAt,
        });
      }
    }

    return requests;
  } catch (error) {
    console.error("[friends] Error getting requests:", error);
    return [];
  }
}

/* ------------------------ Send Friend Request ------------------------ */
async function sendFriendRequest(toUsername) {
  try {
    // Find user by username
    const q = FB.query(
      FB.collection(FB.db, "users"),
      FB.where("username", "==", toUsername),
    );

    const snapshot = await FB.getDocs(q);

    if (snapshot.empty) {
      toast("User not found");
      return false;
    }

    const targetUser = snapshot.docs[0].data();

    if (targetUser.uid === currentUser.uid) {
      toast("You can't add yourself as a friend");
      return false;
    }

    // Check if already friends
    const myFriends = await getFriends(currentUser.uid);
    if (myFriends.some((f) => f.uid === targetUser.uid)) {
      toast("Already friends with this user");
      return false;
    }

    // Check if request already exists
    const existingRequest = FB.query(
      FB.collection(FB.db, "friendRequests"),
      FB.where("from", "==", currentUser.uid),
      FB.where("to", "==", targetUser.uid),
      FB.where("status", "==", "pending"),
    );

    const existingSnap = await FB.getDocs(existingRequest);
    if (!existingSnap.empty) {
      toast("Friend request already sent");
      return false;
    }

    // Create friend request
    await FB.addDoc(FB.collection(FB.db, "friendRequests"), {
      from: currentUser.uid,
      to: targetUser.uid,
      status: "pending",
      createdAt: FB.serverTimestamp(),
    });

    toast("✅ Friend request sent!");
    return true;
  } catch (error) {
    console.error("[friends] Error sending request:", error);
    toast("Failed to send friend request");
    return false;
  }
}

/* ------------------------ Accept Friend Request ------------------------ */
async function acceptFriendRequest(requestId, fromUserId) {
  try {
    // Update request status
    const requestRef = FB.doc(FB.db, "friendRequests", requestId);
    await FB.updateDoc(requestRef, { status: "accepted" });

    // Add to both users' friends arrays
    const myRef = FB.doc(FB.db, "users", currentUser.uid);
    const friendRef = FB.doc(FB.db, "users", fromUserId);

    await FB.updateDoc(myRef, {
      friends: FB.arrayUnion(fromUserId),
    });

    await FB.updateDoc(friendRef, {
      friends: FB.arrayUnion(currentUser.uid),
    });

    toast("✅ Friend request accepted!");

    // Refresh data
    await loadFriendRequests();
    await loadMyFriends();

    return true;
  } catch (error) {
    console.error("[friends] Error accepting request:", error);
    toast("Failed to accept friend request");
    return false;
  }
}

/* ------------------------ Decline Friend Request ------------------------ */
async function declineFriendRequest(requestId) {
  try {
    const requestRef = FB.doc(FB.db, "friendRequests", requestId);
    await FB.updateDoc(requestRef, { status: "declined" });

    toast("Friend request declined");
    await loadFriendRequests();
    return true;
  } catch (error) {
    console.error("[friends] Error declining request:", error);
    toast("Failed to decline friend request");
    return false;
  }
}

/* ------------------------ Remove Friend ------------------------ */
async function removeFriend(friendId) {
  try {
    // Remove from both users' friends arrays
    const myRef = FB.doc(FB.db, "users", currentUser.uid);
    const friendRef = FB.doc(FB.db, "users", friendId);

    await FB.updateDoc(myRef, {
      friends: FB.arrayRemove(friendId),
    });

    await FB.updateDoc(friendRef, {
      friends: FB.arrayRemove(currentUser.uid),
    });

    toast("Friend removed");
    await loadMyFriends();
    return true;
  } catch (error) {
    console.error("[friends] Error removing friend:", error);
    toast("Failed to remove friend");
    return false;
  }
}

/* ------------------------ Search Users ------------------------ */
async function searchUsers(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2) {
    renderSearchResults([]);
    return;
  }

  try {
    const searchLower = searchTerm.toLowerCase().trim();

    // Get all users and filter client-side
    // (Firestore doesn't support case-insensitive partial matching natively)
    const usersRef = FB.collection(FB.db, "users");
    const snapshot = await FB.getDocs(usersRef);

    const users = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const usernameLower = (data.username || "").toLowerCase();

      // Match if username contains search term and is not current user
      if (usernameLower.includes(searchLower) && data.uid !== currentUser.uid) {
        users.push(data);
      }
    });

    // Limit to 20 results
    const limitedUsers = users.slice(0, 20);

    renderSearchResults(limitedUsers);
  } catch (error) {
    console.error("[friends] Error searching users:", error);
    renderSearchResults([]);
  }
}

/* ------------------------ Render Functions ------------------------ */
function renderMyFriends(friends) {
  const container = $("#my-friends-list");
  if (!container) return;

  friendsCache = friends;

  if (friends.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <div class="empty-state-text">No friends yet</div>
        <div class="empty-state-subtext">
          Search for friends to start building your network!
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = friends
    .map(
      (friend) => `
    <div class="friend-card">
      <div class="friend-info">
        <div class="friend-avatar">👤</div>
        <div class="friend-details">
          <div class="friend-name">${friend.username || "User"}</div>
          <div class="friend-stats">
            <span>🏆 ${friend.xp || 0} XP</span>
            <span>🔥 ${friend.currentStreak || 0} streak</span>
          </div>
        </div>
      </div>
      <div class="friend-actions">
        <button class="btn-friend btn-remove" data-friend-id="${friend.uid}">
          Remove
        </button>
      </div>
    </div>
  `,
    )
    .join("");

  // Add event listeners
  $$(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const friendId = btn.dataset.friendId;
      if (confirm("Are you sure you want to remove this friend?")) {
        await removeFriend(friendId);
      }
    });
  });
}

function renderFriendRequests(requests) {
  const container = $("#requests-list");
  const badge = $("#requests-badge");

  if (!container) return;

  requestsCache = requests;

  // Update badge
  if (badge) {
    if (requests.length > 0) {
      badge.textContent = requests.length;
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }

  if (requests.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📬</div>
        <div class="empty-state-text">No pending requests</div>
        <div class="empty-state-subtext">
          Friend requests will appear here
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = requests
    .map(
      (request) => `
    <div class="friend-card">
      <div class="friend-info">
        <div class="friend-avatar">👤</div>
        <div class="friend-details">
          <div class="friend-name">${request.userData.username || "User"}</div>
          <div class="friend-stats">
            <span>🏆 ${request.userData.xp || 0} XP</span>
          </div>
        </div>
      </div>
      <div class="friend-actions">
        <button class="btn-friend btn-accept" data-request-id="${request.requestId}" data-from-id="${request.from}">
          Accept
        </button>
        <button class="btn-friend btn-decline" data-request-id="${request.requestId}">
          Decline
        </button>
      </div>
    </div>
  `,
    )
    .join("");

  // Add event listeners
  $$(".btn-accept").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const requestId = btn.dataset.requestId;
      const fromId = btn.dataset.fromId;
      await acceptFriendRequest(requestId, fromId);
    });
  });

  $$(".btn-decline").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const requestId = btn.dataset.requestId;
      await declineFriendRequest(requestId);
    });
  });
}

function renderSearchResults(users) {
  const container = $("#search-results");
  if (!container) return;

  if (users.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">No users found</div>
        <div class="empty-state-subtext">
          Try a different username
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = users
    .map(
      (user) => `
    <div class="friend-card">
      <div class="friend-info">
        <div class="friend-avatar">👤</div>
        <div class="friend-details">
          <div class="friend-name">${user.username || "User"}</div>
          <div class="friend-stats">
            <span>🏆 ${user.xp || 0} XP</span>
            <span>🔥 ${user.currentStreak || 0} streak</span>
          </div>
        </div>
      </div>
      <div class="friend-actions">
        <button class="btn-friend btn-add" data-username="${user.username}">
          Add Friend
        </button>
      </div>
    </div>
  `,
    )
    .join("");

  // Add event listeners
  $$(".btn-add").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const username = btn.dataset.username;
      const success = await sendFriendRequest(username);
      if (success) {
        btn.textContent = "Request Sent";
        btn.disabled = true;
        btn.style.opacity = "0.6";
      }
    });
  });
}

/* ------------------------ Load Data Functions ------------------------ */
async function loadMyFriends() {
  const friends = await getFriends(currentUser.uid);
  renderMyFriends(friends);
}

async function loadFriendRequests() {
  const requests = await getFriendRequests(currentUser.uid);
  renderFriendRequests(requests);
}

/* ------------------------ Event Listeners ------------------------ */
function setupEventListeners() {
  // Search functionality
  const searchInput = $("#friend-search");
  let searchTimeout;

  searchInput?.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchUsers(e.target.value);
    }, 500); // Debounce search
  });
}

/* ------------------------ Initialize ------------------------ */
async function init() {
  const user = await checkAuth();
  if (!user) return;

  setupTabs();
  setupEventListeners();

  // Load initial data
  await loadMyFriends();
  await loadFriendRequests();

  // Setup friend link
  await setupFriendLink();

  // Check for friend request in URL
  checkFriendLinkInURL();
}

/* ------------------------ Friend Link Functions ------------------------ */
async function setupFriendLink() {
  if (!currentUser) return;

  try {
    // Get user's username
    const userDoc = await FB.getDoc(FB.doc(FB.db, "users", currentUser.uid));
    const username = userDoc.data()?.username || currentUser.uid;

    // Create shareable link
    const friendLink = `${window.location.origin}/friends.html?add=${encodeURIComponent(username)}`;

    const linkInput = $("#friend-link");
    if (linkInput) {
      linkInput.value = friendLink;
    }

    // Copy button
    const copyBtn = $("#copy-friend-link");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(friendLink);
          toast("✅ Link copied to clipboard!");
        } catch (error) {
          // Fallback for older browsers
          linkInput.select();
          document.execCommand("copy");
          toast("✅ Link copied!");
        }
      });
    }

    // Share button (uses Web Share API if available)
    const shareBtn = $("#share-friend-link");
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Add me on The Trivial Club!",
              text: `Hey! Add me as a friend on The Trivial Club trivia app!`,
              url: friendLink,
            });
          } catch (error) {
            // User cancelled share or share not supported
            if (error.name !== "AbortError") {
              await navigator.clipboard.writeText(friendLink);
              toast("✅ Link copied! Share it with your friends!");
            }
          }
        } else {
          // Fallback: just copy
          await navigator.clipboard.writeText(friendLink);
          toast("✅ Link copied! Share it with your friends!");
        }
      });
    }
  } catch (error) {
    console.error("[friends] Error setting up friend link:", error);
  }
}

function checkFriendLinkInURL() {
  const params = new URLSearchParams(window.location.search);
  const friendUsername = params.get("add");

  if (friendUsername) {
    // Show confirmation dialog
    const confirmed = confirm(
      `Do you want to add @${friendUsername} as a friend?`,
    );

    if (confirmed) {
      lookupAndAddFriend(friendUsername);
    }

    // Clean URL
    window.history.replaceState({}, "", window.location.pathname);
  }
}

async function lookupAndAddFriend(username) {
  try {
    // Search for user by username
    const usersRef = FB.collection(FB.db, "users");
    const snapshot = await FB.getDocs(usersRef);

    let foundUser = null;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.username &&
        data.username.toLowerCase() === username.toLowerCase()
      ) {
        foundUser = data;
      }
    });

    if (!foundUser) {
      toast("❌ User @" + username + " not found");
      return;
    }

    if (foundUser.uid === currentUser.uid) {
      toast("❌ You can't add yourself as a friend!");
      return;
    }

    // Send friend request
    await sendFriendRequest(foundUser.uid, foundUser.username);

    toast("✅ Friend request sent to @" + username + "!");

    // Switch to requests tab
    const requestsTab = document.querySelector('[data-tab="requests"]');
    if (requestsTab) {
      requestsTab.click();
    }
  } catch (error) {
    console.error("[friends] Add friend error:", error);
    toast("❌ Failed to add friend. Please try again.");
  }
}

// Start the app
init();
