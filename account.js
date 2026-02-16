// account.js - Account management page
/* =========================================================
   Account Settings Page Script
   ========================================================= */

/* ------------------------ Helpers ------------------------ */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function toast(msg, duration = 2000) {
  const container = $("#toast-container") || document.body;
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  t.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(17, 26, 43, 0.95);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    animation: slideUp 0.3s ease;
  `;
  container.appendChild(t);
  setTimeout(() => {
    t.style.animation = "slideDown 0.3s ease";
    setTimeout(() => t.remove(), 300);
  }, duration);
}

/* Add animation styles */
if (!document.querySelector("#toast-animations")) {
  const style = document.createElement("style");
  style.id = "toast-animations";
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(20px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
      from { transform: translateX(-50%) translateY(0); opacity: 1; }
      to { transform: translateX(-50%) translateY(20px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

/* ------------------------ Local Storage ------------------------ */
const STORAGE_PREFIX = "MULTI_";
const PROFILE_KEY = STORAGE_PREFIX + "profile_v1";
const TOTAL_SLOTS = 18; // Total sticker slots

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/* ------------------------ Firebase Reference ------------------------ */
const FB = window.FB;

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
        toast("Please log in to view account", 3000);
        setTimeout(() => (window.location.href = "index.html"), 1500);
        resolve(null);
      } else {
        resolve(user);
      }
    });
  });
}

/* ------------------------ Load User Data ------------------------ */
async function loadUserData(user) {
  try {
    // Get Firestore data
    const { db, doc, getDoc } = FB;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    // Get local profile data
    const localProfile = loadJSON(PROFILE_KEY, {
      points: 0,
      streak: 0,
      categoryStats: {},
    });

    // Display email
    $("#user-email").textContent = user.email || "Not set";

    // Display username
    const usernameInput = $("#username-input");
    if (usernameInput) {
      usernameInput.value = userData.username || "";
      usernameInput.placeholder = userData.username
        ? userData.username
        : "Set your username";
    }

    // Display member since
    const createdAt = userData.createdAt?.toDate
      ? userData.createdAt.toDate()
      : new Date();
    $("#member-since").textContent = createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Display XP
    $("#total-xp").textContent = userData.xp || 0;

    // Display streak
    $("#current-streak").textContent = localProfile.streak || 0;

    // Calculate statistics
    const stats = calculateStats(localProfile);
    $("#games-played").textContent = stats.gamesPlayed;
    $("#total-correct").textContent = stats.totalCorrect;
    $("#accuracy").textContent = stats.accuracy + "%";
    $("#best-streak").textContent = stats.bestStreak;
    $("#total-questions").textContent = stats.totalQuestions;

    // Populate quick stats section
    $("#quick-total-xp").textContent = userData.xp || 0;
    $("#quick-games-played").textContent = stats.gamesPlayed;
    $("#quick-current-streak").textContent =
      (localProfile.streak || 0) + " days";
    $("#quick-best-streak").textContent = stats.bestStreak + " days";
    $("#quick-accuracy").textContent = stats.accuracy + "%";

    // Populate collection preview
    const collectionCount = localProfile.inventory?.length || 0;
    const totalStickers = 18;
    $("#collection-count").textContent = `${collectionCount}/${totalStickers}`;

    // Render collection grid
    renderCollectionGrid(localProfile.inventory || []);

    return { userData, localProfile };
  } catch (error) {
    console.error("[account] Error loading user data:", error);
    toast("Error loading account data", 3000);
    return { userData: {}, localProfile: {} };
  }
}

/* ------------------------ Calculate Statistics ------------------------ */
function calculateStats(profile) {
  const categoryStats = profile.categoryStats || {};

  let totalCorrect = 0;
  let totalQuestions = 0;
  let gamesPlayed = 0;

  // Calculate from category stats
  Object.values(categoryStats).forEach((stat) => {
    if (stat && typeof stat === "object") {
      totalCorrect += stat.correct || 0;
      totalQuestions += stat.total || 0;
      if (stat.total > 0) {
        gamesPlayed += Math.floor(stat.total / 6); // Assuming 6 questions per game
      }
    }
  });

  // Calculate accuracy
  const accuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Best streak is current streak (could be enhanced with historical data)
  const bestStreak = profile.streak || 0;

  return {
    gamesPlayed: Math.max(gamesPlayed, 0),
    totalCorrect,
    totalQuestions,
    accuracy,
    bestStreak,
  };
}

/* ------------------------ Render Collection Grid ------------------------ */
function renderCollectionGrid(unlockedStickers) {
  const grid = $("#account-collection-grid");
  if (!grid) return;

  const totalStickers = 18;
  grid.innerHTML = ""; // Clear existing

  for (let i = 1; i <= totalStickers; i++) {
    const stickerPath = `assets/stickers/sticker_${i}.webp`;
    const slot = document.createElement("div");
    slot.className = "sticker-slot";
    slot.dataset.stickerIndex = i; // Add data attribute for toggling

    if (unlockedStickers.includes(stickerPath)) {
      // Unlocked sticker
      slot.classList.add("unlocked");
      const img = document.createElement("img");
      img.src = stickerPath;
      img.alt = `Sticker ${i}`;
      slot.appendChild(img);
    } else {
      // Locked sticker
      slot.classList.add("locked");
      const lockDiv = document.createElement("div");
      lockDiv.style.cssText =
        "width: 100%; height: 100%; background: #000; display: flex; align-items: center; justify-content: center;";
      const lock = document.createElement("span");
      lock.className = "lock-icon";
      lock.textContent = "🔒";
      lockDiv.appendChild(lock);
      slot.appendChild(lockDiv);
    }

    grid.appendChild(slot);
  }

  // Initially hide stickers beyond the first 12
  hideStickersAfter(12);

  function hideStickersAfter(count) {
    const stickers = grid.querySelectorAll(".sticker-slot");
    stickers.forEach((sticker, index) => {
      if (index >= count) {
        sticker.style.display = "none";
      } else {
        sticker.style.display = "flex";
      }
    });
  }
}

/* ------------------------ Render Collection ------------------------ */
function renderCollection() {
  const collectionGrid = $("#collection-grid");
  if (!collectionGrid) return;

  const localProfile = loadJSON(PROFILE_KEY, { inventory: [] });
  collectionGrid.innerHTML = "";

  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const slot = document.createElement("div");
    slot.className = "bag-slot" + (!localProfile.inventory[i] ? " locked" : "");
    if (localProfile.inventory[i]) {
      const img = document.createElement("img");
      img.src = localProfile.inventory[i];
      img.alt = "Sticker";
      slot.appendChild(img);
    }
    collectionGrid.appendChild(slot);
  }
}

/* ------------------------ Update Username ------------------------ */
async function updateUsername(currentUser) {
  const usernameInput = $("#username-input");
  const newUsername = usernameInput.value.trim();

  // Validation
  if (!newUsername) {
    toast("Username cannot be empty", 2000);
    return;
  }

  if (newUsername.length < 3) {
    toast("Username must be at least 3 characters", 2000);
    return;
  }

  if (newUsername.length > 20) {
    toast("Username must be 20 characters or less", 2000);
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
    toast("Username can only contain letters, numbers, and underscores", 3000);
    return;
  }

  // Simple profanity check (can be enhanced)
  const profanityList = ["fuck", "shit", "damn", "bitch", "ass", "dick"];
  const lowerUsername = newUsername.toLowerCase();
  if (profanityList.some((word) => lowerUsername.includes(word))) {
    toast("Please choose a different username", 2000);
    return;
  }

  try {
    const { db, doc, setDoc, serverTimestamp } = FB;
    const userRef = doc(db, "users", currentUser.uid);

    await setDoc(
      userRef,
      {
        username: newUsername,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    // Update global variable if it exists
    if (window.currentUsername !== undefined) {
      window.currentUsername = newUsername;
    }

    toast("Username updated successfully! ✅", 2000);
  } catch (error) {
    console.error("[account] Error updating username:", error);
    toast("Failed to update username", 2000);
  }
}

/* ------------------------ Change Password ------------------------ */
function openPasswordModal() {
  const modal = $("#password-modal");
  if (modal) {
    modal.classList.remove("hidden");
    $("#new-password").value = "";
    $("#confirm-new-password").value = "";
    $("#password-error").classList.add("hidden");
  }
}

function closePasswordModal() {
  const modal = $("#password-modal");
  if (modal) modal.classList.add("hidden");
}

async function changePassword() {
  const newPassword = $("#new-password").value;
  const confirmPassword = $("#confirm-new-password").value;
  const errorEl = $("#password-error");

  // Clear previous errors
  errorEl.classList.add("hidden");

  // Validation
  if (!newPassword || !confirmPassword) {
    errorEl.textContent = "Please fill in both fields";
    errorEl.classList.remove("hidden");
    return;
  }

  if (newPassword.length < 6) {
    errorEl.textContent = "Password must be at least 6 characters";
    errorEl.classList.remove("hidden");
    return;
  }

  if (newPassword !== confirmPassword) {
    errorEl.textContent = "Passwords do not match";
    errorEl.classList.remove("hidden");
    return;
  }

  try {
    const auth = window.FB.auth;
    const user = auth.currentUser;

    if (!user) {
      errorEl.textContent = "No user logged in";
      errorEl.classList.remove("hidden");
      return;
    }

    // Use Firebase's updatePassword function correctly
    await window.FB.updatePassword(user, newPassword);

    // Success! Clear the form
    $("#new-password").value = "";
    $("#confirm-new-password").value = "";
    $("#password-match-indicator")?.classList.add("hidden");

    closePasswordModal();
    toast("Password updated successfully! ✅", 2000);
  } catch (error) {
    console.error("[account] Error changing password:", error);

    let message = "Failed to change password";
    if (error.code === "auth/requires-recent-login") {
      message =
        "For security, please log out and log back in before changing your password";
    } else if (error.code === "auth/weak-password") {
      message = "Password is too weak";
    } else {
      message = "Error: " + error.message;
    }

    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }
}

/* ------------------------ Delete Account ------------------------ */
function openDeleteModal() {
  const modal = $("#delete-modal");
  if (modal) {
    modal.classList.remove("hidden");
    $("#delete-confirm").value = "";
    $("#delete-error").classList.add("hidden");
  }
}

function closeDeleteModal() {
  const modal = $("#delete-modal");
  if (modal) modal.classList.add("hidden");
}

async function deleteAccount() {
  const confirmInput = $("#delete-confirm");
  const errorEl = $("#delete-error");

  if (confirmInput.value !== "DELETE") {
    errorEl.textContent = 'You must type "DELETE" to confirm';
    errorEl.classList.remove("hidden");
    return;
  }

  try {
    const user = FB.auth.currentUser;
    if (!user) {
      toast("Please log in again", 2000);
      return;
    }

    // Delete user document from Firestore
    const { db, doc, deleteDoc } = FB;
    const userRef = doc(db, "users", user.uid);
    await deleteDoc(userRef);

    // Delete Firebase Auth account
    await user.delete();

    // Clear local storage
    localStorage.clear();

    toast("Account deleted successfully", 2000);
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  } catch (error) {
    console.error("[account] Error deleting account:", error);

    let message = "Failed to delete account";
    if (error.code === "auth/requires-recent-login") {
      message =
        "Please log out and log in again, then try deleting your account";
    }

    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }
}

/* ------------------------ Logout ------------------------ */
async function handleLogout() {
  try {
    if (!window.FB || !window.FB.auth) {
      console.error("Firebase not initialized");
      window.location.href = "index.html";
      return;
    }

    await window.FB.auth.signOut();
    console.log("Logged out successfully");

    // Clear all local data
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to home page (which will show auth screen)
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
    // Force logout anyway - clear local state
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

/* ------------------------ Event Listeners ------------------------ */
function setupEventListeners(currentUser) {
  // Save username
  $("#save-username")?.addEventListener("click", () =>
    updateUsername(currentUser),
  );

  // Enter key for username
  $("#username-input")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      updateUsername(currentUser);
    }
  });

  // Change password
  $("#change-password-btn")?.addEventListener("click", openPasswordModal);
  $("#password-close")?.addEventListener("click", closePasswordModal);
  $("#save-password")?.addEventListener("click", changePassword);

  // Enter key for password
  $("#confirm-new-password")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      changePassword();
    }
  });

  // Delete account
  $("#delete-account-btn")?.addEventListener("click", openDeleteModal);
  $("#delete-close")?.addEventListener("click", closeDeleteModal);
  $("#cancel-delete")?.addEventListener("click", closeDeleteModal);
  $("#confirm-delete")?.addEventListener("click", deleteAccount);

  // Logout
  $("#logout-btn")?.addEventListener("click", handleLogout);

  // Toggle collection expand/collapse
  let isExpanded = false;
  $("#toggle-collection")?.addEventListener("click", () => {
    const grid = $("#account-collection-grid");
    const toggleBtn = $("#toggle-collection");

    if (grid && toggleBtn) {
      isExpanded = !isExpanded;
      const stickers = grid.querySelectorAll(".sticker-slot");

      if (isExpanded) {
        // Show all stickers
        stickers.forEach((sticker) => {
          sticker.style.display = "flex";
        });
        toggleBtn.textContent = "▲ Show Less";
      } else {
        // Hide stickers beyond the first 12
        stickers.forEach((sticker, index) => {
          if (index >= 12) {
            sticker.style.display = "none";
          } else {
            sticker.style.display = "flex";
          }
        });
        toggleBtn.textContent = "▼ Show All (18 stickers)";
      }
    }
  });

  // Close collection modal
  $("#close-collection")?.addEventListener("click", () => {
    const collectionModal = $("#collection-modal");
    if (collectionModal) {
      collectionModal.classList.add("hidden");
    }
  });

  // Click outside modal to close
  $("#collection-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "collection-modal") {
      $("#collection-modal").classList.add("hidden");
    }
  });

  // Password visibility toggles
  $("#toggle-new-password")?.addEventListener("click", function () {
    const input = $("#new-password");
    const type = input.type === "password" ? "text" : "password";
    input.type = type;
    this.textContent = type === "password" ? "👁️" : "👁️‍🗨️";
  });

  $("#toggle-confirm-password")?.addEventListener("click", function () {
    const input = $("#confirm-new-password");
    const type = input.type === "password" ? "text" : "password";
    input.type = type;
    this.textContent = type === "password" ? "👁️" : "👁️‍🗨️";
  });

  // Real-time password match checking
  $("#confirm-new-password")?.addEventListener("input", function () {
    const newPassword = $("#new-password").value;
    const confirmPassword = this.value;
    const indicator = $("#password-match-indicator");

    if (confirmPassword.length === 0) {
      indicator.classList.add("hidden");
      return;
    }

    indicator.classList.remove("hidden");

    if (newPassword === confirmPassword) {
      indicator.textContent = "✅ Passwords match";
      indicator.style.color = "#22c55e";
    } else {
      indicator.textContent = "❌ Passwords do not match";
      indicator.style.color = "#ef4444";
    }
  });

  // Also check when typing in new password field
  $("#new-password")?.addEventListener("input", function () {
    const confirmInput = $("#confirm-new-password");
    if (confirmInput.value.length > 0) {
      confirmInput.dispatchEvent(new Event("input"));
    }
  });

  // Detailed stats button
  $("#view-detailed-stats-btn")?.addEventListener("click", () => {
    // Scroll to the detailed stats section
    const statsCard = document.querySelector(".account-card h2")
      ? Array.from(document.querySelectorAll(".account-card h2"))
          .find((h2) => h2.textContent.includes("Game Statistics"))
          ?.closest(".account-card")
      : null;

    if (statsCard) {
      statsCard.scrollIntoView({ behavior: "smooth", block: "start" });
      statsCard.style.animation = "highlight 1s ease";
    }
  });

  // Close modals on backdrop click
  $$(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    });
  });

  // ESC key to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePasswordModal();
      closeDeleteModal();
      closeEmailModal();
    }
  });

  // Email change functionality
  setupEmailChange(currentUser);
}

/* ------------------------ Email Change Functions ------------------------ */
function closeEmailModal() {
  const modal = $("#email-modal");
  const errorMsg = $("#email-error");
  const newEmailInput = $("#new-email");
  const passwordInput = $("#email-password");

  if (modal) modal.classList.add("hidden");
  if (errorMsg) {
    errorMsg.classList.add("hidden");
    errorMsg.textContent = "";
  }
  if (newEmailInput) newEmailInput.value = "";
  if (passwordInput) passwordInput.value = "";
}

function showEmailError(message) {
  const errorMsg = $("#email-error");
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.classList.remove("hidden");
  }
}

async function updateUserEmail(user) {
  const newEmail = $("#new-email")?.value.trim();
  const password = $("#email-password")?.value;

  // Validation
  if (!newEmail || !password) {
    showEmailError("Please fill in all fields");
    return;
  }

  if (!newEmail.includes("@")) {
    showEmailError("Please enter a valid email address");
    return;
  }

  if (newEmail === user.email) {
    showEmailError("New email is the same as current email");
    return;
  }

  try {
    const saveBtn = $("#save-email");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="loading-spinner"></span> Updating...';
    }

    // Re-authenticate user first (Firebase requires this for sensitive operations)
    const credential = window.FB.EmailAuthProvider.credential(
      user.email,
      password,
    );

    await window.FB.reauthenticateWithCredential(user, credential);

    // Update email INSTANTLY (no verification required)
    await window.FB.updateEmail(user, newEmail);

    // Update Firestore user document
    const userRef = window.FB.doc(window.FB.db, "users", user.uid);
    await window.FB.setDoc(userRef, { email: newEmail }, { merge: true });

    toast("✅ Email updated successfully to " + newEmail + "!");

    closeEmailModal();

    // Update displayed email
    const emailDisplay = $("#user-email");
    if (emailDisplay) {
      emailDisplay.textContent = newEmail;
    }

    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Update Email";
    }
  } catch (error) {
    console.error("[email] update error:", error);

    let message = "Failed to update email. Please try again.";

    if (error.code === "auth/wrong-password") {
      message = "Incorrect password. Please try again.";
    } else if (error.code === "auth/email-already-in-use") {
      message = "This email is already registered to another account.";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email address format.";
    } else if (error.code === "auth/requires-recent-login") {
      message = "Please log out and log in again before changing your email.";
    }

    showEmailError(message);

    const saveBtn = $("#save-email");
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Update Email";
    }
  }
}

function setupEmailChange(user) {
  const changeEmailBtn = $("#change-email-btn");
  const emailModal = $("#email-modal");
  const closeEmailBtn = $("#close-email-modal");
  const cancelEmailBtn = $("#cancel-email-change");
  const saveEmailBtn = $("#save-email");

  // Debug logging
  console.log("Setting up email change functionality...");
  console.log("Change email button:", changeEmailBtn);
  console.log("Email modal:", emailModal);

  if (!changeEmailBtn) {
    console.error("ERROR: #change-email-btn not found in DOM!");
    return;
  }

  if (!emailModal) {
    console.error("ERROR: #email-modal not found in DOM!");
    return;
  }

  // Open email change modal
  changeEmailBtn.addEventListener("click", (e) => {
    console.log("Email change button clicked!");
    e.preventDefault();
    emailModal.classList.remove("hidden");
  });

  // Close modal buttons
  closeEmailBtn?.addEventListener("click", closeEmailModal);
  cancelEmailBtn?.addEventListener("click", closeEmailModal);

  // Save email button
  saveEmailBtn?.addEventListener("click", () => updateUserEmail(user));

  // Enter key support
  $("#email-password")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      updateUserEmail(user);
    }
  });

  // Click outside modal to close
  emailModal?.addEventListener("click", (e) => {
    if (e.target === emailModal) {
      closeEmailModal();
    }
  });
}

/* ------------------------ Initialize ------------------------ */
async function init() {
  const user = await checkAuth();
  if (!user) return;

  await loadUserData(user);
  setupEventListeners(user);
}

// Start the app
init();
