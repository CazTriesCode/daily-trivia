/**
 * Shared Header Component for The Trivial Club
 * Creates consistent navigation across all pages
 */

// Import Firebase auth functions
import "./firebase-init.js";

/**
 * Creates the header HTML for a given page
 * @param {string} activePage - The current active page ('home', 'leaderboard', 'account', etc.)
 * @param {string} extraButtons - Optional HTML for additional buttons (for home page)
 * @returns {string} HTML string for the header
 */
export function createHeaderHTML(activePage = "", extraButtons = "") {
  return `
    <header class="app-header topbar" id="app-header">
      <div class="header-content">
        <!-- Logo / App Title -->
        <a href="index.html" class="logo" style="text-decoration: none; color: inherit;">
          🧠 The Trivial Club
        </a>

        <!-- Hamburger menu for mobile -->
        <button
          id="hamburger"
          class="hamburger"
          aria-label="Menu"
          aria-expanded="false"
        >
          ☰
        </button>

        <!-- Desktop Navigation -->
        <nav class="main-nav" id="main-nav">
          ${extraButtons}
          <a href="friends.html" class="nav-link ${activePage === "friends" ? "active" : ""}" title="Friends">
            👥 Friends
          </a>
          <a href="leaderboard.html" class="nav-link ${activePage === "leaderboard" ? "active" : ""}" title="Leaderboard">
            🏆 Leaderboard
          </a>
        </nav>

        <!-- User Dropdown Section -->
        <div class="user-dropdown-container" id="user-dropdown-container">
          <button class="user-dropdown-btn" id="user-dropdown-btn" aria-expanded="false">
            <span id="current-user-email" class="user-email">Loading...</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="user-dropdown-menu hidden" id="user-dropdown-menu">
            <a href="account.html" class="dropdown-item">
              <span class="dropdown-icon">👤</span>
              My Account
            </a>
            <button class="dropdown-item" id="btn-logout">
              <span class="dropdown-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Menu Backdrop -->
    <div
      id="menu-backdrop"
      class="menu-backdrop hidden"
      aria-hidden="true"
    ></div>

    <!-- Mobile Menu Drawer -->
    <aside id="mobile-menu" class="mobile-menu" aria-hidden="true">
      <div class="menu-head">
        <strong>Menu</strong>
        <button id="menu-close" class="chip" aria-label="Close menu">✖</button>
      </div>
      <div class="menu-items" id="mobile-menu-items">
        ${extraButtons}
        <a href="friends.html" class="chip ${activePage === "friends" ? "active" : ""}">👥 Friends</a>
        <a href="leaderboard.html" class="chip ${activePage === "leaderboard" ? "active" : ""}">🏆 Leaderboard</a>
        <a href="account.html" class="chip ${activePage === "account" ? "active" : ""}">👤 Account</a>
        <div class="chip user-info" style="pointer-events: none;">
          <span id="mobile-username">Loading...</span>
        </div>
        <button id="m-logout" class="chip">🚪 Logout</button>
      </div>
    </aside>
  `;
}

/**
 * Initializes the header component
 * Call this after the header HTML has been inserted into the page
 */
export function initializeHeader() {
  // Mobile menu elements
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuBackdrop = document.getElementById("menu-backdrop");
  const menuClose = document.getElementById("menu-close");

  // User dropdown elements
  const userDropdownBtn = document.getElementById("user-dropdown-btn");
  const userDropdownMenu = document.getElementById("user-dropdown-menu");

  // Logout buttons
  const logoutBtn = document.getElementById("btn-logout");
  const mobileLogoutBtn = document.getElementById("m-logout");

  // Mobile menu toggle functions
  function openMobileMenu() {
    mobileMenu.classList.add("open");
    menuBackdrop.classList.remove("hidden");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("open");
    menuBackdrop.classList.add("hidden");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  // User dropdown toggle functions
  function openUserDropdown() {
    if (userDropdownMenu) {
      userDropdownMenu.classList.remove("hidden");
      userDropdownBtn.setAttribute("aria-expanded", "true");
    }
  }

  function closeUserDropdown() {
    if (userDropdownMenu) {
      userDropdownMenu.classList.add("hidden");
      userDropdownBtn.setAttribute("aria-expanded", "false");
    }
  }

  // Mobile menu event listeners
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      if (mobileMenu.classList.contains("open")) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", closeMobileMenu);
  }

  if (menuBackdrop) {
    menuBackdrop.addEventListener("click", closeMobileMenu);
  }

  // User dropdown event listeners
  if (userDropdownBtn) {
    userDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (userDropdownMenu.classList.contains("hidden")) {
        openUserDropdown();
      } else {
        closeUserDropdown();
      }
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (userDropdownMenu && !userDropdownMenu.classList.contains("hidden")) {
      if (
        !userDropdownBtn.contains(e.target) &&
        !userDropdownMenu.contains(e.target)
      ) {
        closeUserDropdown();
      }
    }
  });

  // Close dropdown on ESC key
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      userDropdownMenu &&
      !userDropdownMenu.classList.contains("hidden")
    ) {
      closeUserDropdown();
    }
  });

  // Logout functionality
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

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener("click", () => {
      closeMobileMenu();
      handleLogout();
    });
  }

  // Close mobile menu when clicking any link inside it
  if (mobileMenu) {
    const menuLinks = mobileMenu.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  // Close mobile menu on ESC key
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      mobileMenu &&
      mobileMenu.classList.contains("open")
    ) {
      closeMobileMenu();
    }
  });

  // Update user info
  updateUserInfo();

  // Listen for auth state changes
  if (window.FB && window.FB.onAuthStateChanged) {
    window.FB.onAuthStateChanged(window.FB.auth, (user) => {
      updateUserInfo();
    });
  }
}

/**
 * Updates the displayed username in the header
 */
export async function updateUserInfo() {
  const currentUserEmail = document.getElementById("current-user-email");
  const mobileUsername = document.getElementById("mobile-username");

  if (!currentUserEmail && !mobileUsername) return;

  try {
    // Check if user is logged in
    if (window.FB && window.FB.auth && window.FB.auth.currentUser) {
      const user = window.FB.auth.currentUser;

      // Try to get username from Firestore
      let displayName = user.email.split("@")[0]; // Default to email prefix

      try {
        const userDoc = await window.FB.getDoc(
          window.FB.doc(window.FB.db, "users", user.uid),
        );

        if (userDoc.exists()) {
          const userData = userDoc.data();
          displayName = userData.username || userData.email.split("@")[0];
        }
      } catch (error) {
        console.warn("Could not fetch username:", error);
      }

      if (currentUserEmail) currentUserEmail.textContent = displayName;
      if (mobileUsername) mobileUsername.textContent = displayName;
    } else {
      if (currentUserEmail) currentUserEmail.textContent = "Guest";
      if (mobileUsername) mobileUsername.textContent = "Guest";
    }
  } catch (error) {
    console.error("Error updating user info:", error);
    if (currentUserEmail) currentUserEmail.textContent = "User";
    if (mobileUsername) mobileUsername.textContent = "User";
  }
}

/**
 * Convenience function to insert header and initialize in one call
 * @param {string} activePage - The current active page
 * @param {string} extraButtons - Optional HTML for additional buttons
 * @param {string} containerId - Optional container ID to insert header into (default: body prepend)
 */
export function setupHeader(
  activePage = "",
  extraButtons = "",
  containerId = null,
) {
  const headerHTML = createHeaderHTML(activePage, extraButtons);

  if (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = headerHTML;
      console.log("[Header] Inserted into container:", containerId);
    } else {
      console.error("[Header] Container not found:", containerId);
      return;
    }
  } else {
    // Insert at the beginning of body
    document.body.insertAdjacentHTML("afterbegin", headerHTML);
    console.log("[Header] Inserted at body start");
  }

  // Initialize immediately since DOM is ready
  setTimeout(() => {
    initializeHeader();
  }, 0);
}
