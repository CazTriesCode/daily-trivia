// leaderboard.js (ES Module)
const statusEl = document.getElementById("lb-status");
const rowsEl = document.getElementById("lb-rows");
const refreshBtn = document.getElementById("refresh");
const subtitleEl = document.getElementById("lb-subtitle");

// Defensive: window.FB is provided by firebase-init.js
const FB = window.FB;
let currentTab = "global";

function setStatus(msg, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = isError ? "error" : "muted";
}

function row(rank, name, xp, you = false) {
  const div = document.createElement("div");
  div.className = "lb-row";
  div.innerHTML = `
    <div class="rank">#${rank}</div>
    <div class="name">${name || "<span class='muted'>—</span>"}${
      you ? " <span class='muted'>(you)</span>" : ""
    }</div>
    <div class="xp">⭐ ${xp ?? 0}</div>
  `;
  return div;
}

/* ------------------------ Get User's Friends ------------------------ */
async function getFriends(userId) {
  try {
    const userRef = FB.doc(FB.db, "users", userId);
    const userSnap = await FB.getDoc(userRef);

    if (!userSnap.exists()) return [];

    const userData = userSnap.data();
    const friendIds = userData.friends || [];

    return friendIds;
  } catch (error) {
    console.error("[leaderboard] Error getting friends:", error);
    return [];
  }
}

/* ------------------------ Load Global Leaderboard ------------------------ */
async function loadGlobalLeaderboard() {
  try {
    if (!FB || !FB.db) {
      setStatus(
        "Cloud not configured. (Missing firebase-init.js or invalid config.)",
        true,
      );
      return;
    }

    // Check if user is authenticated
    if (!FB.auth?.currentUser) {
      setStatus("Please log in to view the leaderboard.", true);
      rowsEl.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <p class="muted">You must be logged in to access the leaderboard.</p>
          <a href="index.html" class="chip" style="display: inline-block; margin-top: 12px;">← Back to Login</a>
        </div>
      `;
      return;
    }

    if (subtitleEl) subtitleEl.textContent = "Sorted by total XP";

    const { db, collection, query, orderBy, limit, getDocs } = FB;

    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50));
    const snap = await getDocs(q);

    rowsEl.innerHTML = "";
    let i = 1;
    let hasRows = false;
    snap.forEach((doc) => {
      hasRows = true;
      const d = doc.data();
      const name = d?.username || "anon";
      const xp = Number(d?.xp || 0);
      const you = FB.auth?.currentUser?.uid === d?.uid;
      rowsEl.appendChild(row(i++, name, xp, you));
    });

    if (!hasRows) {
      setStatus("No players yet. Play a quiz to earn XP!");
    } else {
      setStatus(""); // clear
    }
  } catch (e) {
    console.error("[leaderboard] failed", e);
    setStatus("Could not load leaderboard.", true);
  }
}

/* ------------------------ Load Friends Leaderboard ------------------------ */
async function loadFriendsLeaderboard() {
  try {
    if (!FB || !FB.db || !FB.auth?.currentUser) {
      setStatus("Please log in to view friends leaderboard.", true);
      return;
    }

    if (subtitleEl) subtitleEl.textContent = "Your friends sorted by XP";

    const currentUserId = FB.auth.currentUser.uid;

    // Get friends list
    const friendIds = await getFriends(currentUserId);

    if (friendIds.length === 0) {
      rowsEl.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">👥</div>
          <p class="muted" style="margin-bottom: 12px;">You don't have any friends yet</p>
          <a href="friends.html" class="chip" style="display: inline-block;">Find Friends</a>
        </div>
      `;
      setStatus("");
      return;
    }

    // Add current user to the list to show their position
    const allUserIds = [...friendIds, currentUserId];

    // Fetch friend data in batches (Firestore 'in' query limit is 10)
    const friends = [];
    for (let i = 0; i < allUserIds.length; i += 10) {
      const chunk = allUserIds.slice(i, i + 10);
      const q = FB.query(
        FB.collection(FB.db, "users"),
        FB.where("uid", "in", chunk),
      );
      const snapshot = await FB.getDocs(q);
      snapshot.forEach((doc) => friends.push(doc.data()));
    }

    // Sort by XP
    friends.sort((a, b) => (b.xp || 0) - (a.xp || 0));

    // Render
    rowsEl.innerHTML = "";
    friends.forEach((friend, index) => {
      const name = friend.username || "anon";
      const xp = Number(friend.xp || 0);
      const you = friend.uid === currentUserId;
      rowsEl.appendChild(row(index + 1, name, xp, you));
    });

    setStatus("");
  } catch (e) {
    console.error("[leaderboard] friends failed", e);
    setStatus("Could not load friends leaderboard.", true);
  }
}

/* ------------------------ Tab Management ------------------------ */
function setupTabs() {
  const tabs = document.querySelectorAll(".lb-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabType = tab.dataset.tab;

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Load appropriate leaderboard
      currentTab = tabType;
      if (tabType === "global") {
        loadGlobalLeaderboard();
      } else if (tabType === "friends") {
        loadFriendsLeaderboard();
      }
    });
  });
}

/* ------------------------ Initialize ------------------------ */
// Check authentication status on page load
if (FB && FB.auth) {
  FB.onAuthStateChanged(FB.auth, (user) => {
    if (!user) {
      // Not authenticated - redirect to index
      setStatus("Redirecting to login...", true);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      // Authenticated - setup tabs and load leaderboard
      setupTabs();
      loadGlobalLeaderboard();
    }
  });
} else {
  setStatus("Firebase not initialized.", true);
}

refreshBtn?.addEventListener("click", () => {
  if (FB?.auth?.currentUser) {
    if (currentTab === "global") {
      loadGlobalLeaderboard();
    } else if (currentTab === "friends") {
      loadFriendsLeaderboard();
    }
  } else {
    setStatus("Please log in to view the leaderboard.", true);
  }
});
