/* =========================================================
   Multi-Category Daily Trivia — clean app.js
   (works with or without Firebase; single mobile-menu wiring)
   ========================================================= */

/* ------------------------ Tiny DOM helpers ------------------------ */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function toast(msg, ms = 1400) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

/* ------------------------ Mobile Menu ------------------------ */
function closeMenu() {
  const DRAWER = document.getElementById("mobile-menu");
  const BACKDROP = document.getElementById("menu-backdrop");
  const HAM = document.getElementById("hamburger");

  if (!DRAWER) return;

  DRAWER.classList.remove("open");
  DRAWER.setAttribute("aria-hidden", "true");
  if (BACKDROP) BACKDROP.classList.add("hidden");
  if (HAM) HAM.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

/* ------------------------ Firebase shim ------------------------ */
/* Expect firebase-init.js to set window.FB if available */
const Cloud = {
  ready: false,
  uid: null,
  isGuest: false,
  get FB() {
    return window.FB;
  },
};
window.currentUID = null;
window.currentUsername = null;

/* Email/Password Authentication Bootstrap */
(async function bootstrapAuth() {
  try {
    if (!window.FB || !window.FB.auth) {
      console.warn("[cloud] Firebase not present - enabling guest mode");
      // Enable guest mode if Firebase isn't available
      enableGuestMode();
      removeAuthOverlay();
      return;
    }
    const {
      auth,
      db,
      onAuthStateChanged,
      doc,
      getDoc,
      setDoc,
      serverTimestamp,
    } = window.FB;

    // Show auth screen initially until we know the auth state
    // showAuthScreen(); // Commented out to allow guest mode initially

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User is not logged in - enable guest mode
        console.log("[auth] No user logged in - enabling guest mode");
        enableGuestMode();
        removeAuthOverlay();
        return;
      }

      // User is logged in - disable guest mode
      disableGuestMode();
      Cloud.ready = true;
      Cloud.uid = user.uid;
      Cloud.isGuest = false;
      window.currentUID = user.uid;

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            uid: user.uid,
            email: user.email,
            xp: 0,
            username: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastSeen: serverTimestamp(),
          });
        } else {
          await setDoc(ref, { lastSeen: serverTimestamp() }, { merge: true });
        }

        const again = await getDoc(ref);
        window.currentUsername = again.exists()
          ? again.data().username || null
          : null;

        hideAuthScreen();
      } catch (e) {
        console.warn("[cloud] user doc init failed:", e);
      }
    });
  } catch (e) {
    console.warn("[cloud] bootstrap skipped:", e);
    enableGuestMode();
  }
})();

/* Guest Mode Functions */
function enableGuestMode() {
  console.log("[guest] Enabling guest mode");
  Cloud.isGuest = true;
  Cloud.ready = false;
  Cloud.uid = null;
  window.currentUID = null;
  window.currentUsername = "Guest";

  // Show guest banner
  const guestBanner = document.getElementById("guest-banner");
  if (guestBanner) {
    guestBanner.classList.remove("hidden");
  }

  // Hide leaderboard link for guests
  const leaderboardLinks = document.querySelectorAll(
    '[href="leaderboard.html"]',
  );
  leaderboardLinks.forEach((link) => {
    link.style.display = "none";
  });

  // Hide auth screen and show game
  hideAuthScreen();

  // Toast to inform user they're in guest mode
  setTimeout(() => {
    toast("👤 Playing as guest - Sign up to save your progress!");
  }, 500);
}

function disableGuestMode() {
  console.log("[guest] Disabling guest mode");
  Cloud.isGuest = false;

  // Hide guest banner
  const guestBanner = document.getElementById("guest-banner");
  if (guestBanner) {
    guestBanner.classList.add("hidden");
  }

  // Show leaderboard link
  const leaderboardLinks = document.querySelectorAll(
    '[href="leaderboard.html"]',
  );
  leaderboardLinks.forEach((link) => {
    link.style.display = "";
  });
}

/* Authentication UI Functions */
function removeAuthOverlay() {
  const overlay = document.getElementById("auth-overlay");
  if (overlay) {
    overlay.style.transition = "opacity 0.3s ease";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 300);
  }
}

function showAuthScreen() {
  const authScreen = $("#auth-screen");
  const homeScreen = $("#home-screen");
  const quizScreen = $("#quiz-screen");
  const statsScreen = $("#stats-screen");
  const topbar = document.querySelector(".topbar");

  if (authScreen) authScreen.classList.remove("hidden");
  if (homeScreen) homeScreen.classList.add("hidden");
  if (quizScreen) quizScreen.classList.add("hidden");
  if (statsScreen) statsScreen.classList.add("hidden");
  if (topbar) topbar.style.display = "none";
}

function hideAuthScreen() {
  const authScreen = $("#auth-screen");
  const homeScreen = $("#home-screen");
  const topbar = document.querySelector(".topbar");

  if (authScreen) authScreen.classList.add("hidden");
  if (homeScreen) homeScreen.classList.remove("hidden");
  if (topbar) topbar.style.display = "";

  // Remove auth overlay with smooth fade
  removeAuthOverlay();
}

/* ------------------------ Local storage helpers ------------------------ */
const STORAGE_PREFIX = "MULTI_";
const PROFILE_KEY = STORAGE_PREFIX + "profile_v1";
const DAILY_KEY = STORAGE_PREFIX + "daily_v1";
const RESUME_KEY = STORAGE_PREFIX + "resume_v1";

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

/* ------------------------ Categories ------------------------ */
const CATEGORIES = [
  { id: "entertainment", label: "🎬 Entertainment" },
  { id: "music", label: "🎵 Music" },
  { id: "gaming", label: "🎮 Gaming" },
  { id: "science", label: "🔬 Science" },
  { id: "animals", label: "🐾 Animals" },
  { id: "sports", label: "⚽ Sports" },
  { id: "history", label: "📜 History" },
  { id: "geography", label: "🌍 Geography" },
];
const CAT_IDS = CATEGORIES.map((c) => c.id);
const LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

/* ------------------------ Game constants ------------------------ */
const BASE_DAILY_HEARTS = 3;
const MAX_HEARTS = 5;
const PUBLIC_SALT = "dt-multi-v1";
const ROTATION_START = "2025-08-22";
const STICKER_COUNT = 18;
const TOTAL_SLOTS = 18;

/* ------------------------ DOM refs ------------------------ */
const homeScreen = $("#home-screen");
const quizScreen = $("#quiz-screen");
const statsScreen = $("#stats-screen");

const qCatEl = $("#question-category");
const qTextEl = $("#question-text");
const optionsEl = $("#answer-options");
const progressBar = $("#progress-bar");

const pointsEl = $("#points");
const livesEl = $("#lives");
const streakEl = $("#streak");

const hudGlobal = $("#hud-global");
const homeActions = $("#home-actions");

const btnOpenCollection = $("#btn-open-collection");
const btnJumpStats = $("#btn-jump-stats");
const btnFeedback = $("#btn-feedback");
const btnLeaderboard = $("#btn-leaderboard");

const collectionModal = $("#collection-modal");
const collectionGrid = $("#collection-grid");
const miniCollection = $("#mini-collection");
const closeCollection = $("#close-collection");
const openCollection2 = $("#open-collection-2");
const openCollection3 = $("#open-collection-3");

const startRow = $("#start-row");
const lockRow = $("#lock-row");
const countdownEl = $("#countdown");

const shareBtn = $("#share-results");
const backHomeBtn = $("#back-home");
const buyLifeBtn = $("#buy-life");
const exitQuizBtn = $("#exit-quiz");

/* ------------------------ Date helpers (Europe/London) ------------------------ */
function todayYMD_London() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}
function ymdToUTC(ymd) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
function dayDiffLondon(aY, bY) {
  const a = ymdToUTC(aY),
    b = ymdToUTC(bY);
  if (a == null || b == null) return null;
  return Math.floor((b - a) / 86400000);
}
function msUntilTomorrowLondon() {
  const [y, m, d] = todayYMD_London().split("-").map(Number);
  const next = Date.UTC(y, m - 1, d) + 86400000;
  return next - Date.now();
}
function fmtHMS(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
function startCountdown() {
  if (!countdownEl) return;
  const step = () => {
    countdownEl.textContent = fmtHMS(msUntilTomorrowLondon());
    setTimeout(step, 500);
  };
  step();
}

/* ------------------------ Random helpers ------------------------ */
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function safeShuffle(arr) {
  const a = Array.isArray(arr) ? arr.slice() : [];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------ Local profile ------------------------ */
let profile = loadJSON(PROFILE_KEY, {
  points: 0,
  streak: 0,
  lastPlayLocal: null,
  categoryStreaks: CAT_IDS.reduce((a, c) => ((a[c] = 0), a), {}),
  categoryStats: CAT_IDS.reduce(
    (a, c) => ((a[c] = { correct: 0, total: 0 }), a),
    {},
  ),
  inventory: [],
});
(function ensureProfileShape() {
  if (typeof profile.points !== "number") profile.points = 0;
  if (typeof profile.streak !== "number") profile.streak = 0;

  if (!profile.categoryStreaks || typeof profile.categoryStreaks !== "object")
    profile.categoryStreaks = {};
  CAT_IDS.forEach((id) => {
    if (typeof profile.categoryStreaks[id] !== "number")
      profile.categoryStreaks[id] = 0;
  });

  if (!profile.categoryStats || typeof profile.categoryStats !== "object")
    profile.categoryStats = {};
  CAT_IDS.forEach((id) => {
    if (!profile.categoryStats[id])
      profile.categoryStats[id] = { correct: 0, total: 0 };
  });

  if (!Array.isArray(profile.inventory)) profile.inventory = [];
  saveJSON(PROFILE_KEY, profile);
})();

/* ------------------------ Mobile menu (handled by header-component.js) ------------------------ */
// Mobile menu open/close is now handled by header-component.js
// Only wire up the extra home-page-specific buttons (Collection, Stats)

// Wire the extra home page buttons in mobile menu
(function wireHomePageButtons() {
  // Wire Collection button (both desktop and mobile)
  const btnCollection = document.getElementById("btn-open-collection");
  const mCollection = document.getElementById("m-collection");

  // Wire Stats button (both desktop and mobile)
  const btnStats = document.getElementById("btn-jump-stats");
  const mStats = document.getElementById("m-stats");

  // Mobile collection button should trigger desktop collection button
  if (mCollection && btnCollection) {
    mCollection.addEventListener("click", () => {
      btnCollection.click();
      // Close mobile menu (handled by header component)
      const closeBtn = document.getElementById("menu-close");
      if (closeBtn) closeBtn.click();
    });
  }

  // Mobile stats button should trigger desktop stats button
  if (mStats && btnStats) {
    mStats.addEventListener("click", () => {
      btnStats.click();
      // Close mobile menu (handled by header component)
      const closeBtn = document.getElementById("menu-close");
      if (closeBtn) closeBtn.click();
    });
  }
})();

/* Note: HAM, DRAWER, BACKDROP, and menu open/close functions removed */
/* These are now handled by header-component.js */

/* ------------------------ XP sync (local + Firestore) ------------------------ */
async function syncXPToCloud() {
  try {
    if (!Cloud.ready || !Cloud.uid || !Cloud.FB) return;
    const { db, doc, updateDoc, serverTimestamp } = Cloud.FB;
    await updateDoc(doc(db, "users", Cloud.uid), {
      xp: profile.points,
      updatedAt: serverTimestamp(),
    });
  } catch {}
}
function addXP(delta) {
  profile.points = (profile.points || 0) + delta;
  saveJSON(PROFILE_KEY, profile);
  syncXPToCloud();
}
function spendXP(cost) {
  if ((profile.points || 0) < cost) return false;
  profile.points -= cost;
  saveJSON(PROFILE_KEY, profile);
  syncXPToCloud();
  return true;
}

/* ------------------------ Daily state ------------------------ */
let daily = loadJSON(DAILY_KEY, {
  lastPlayedByCat: {},
  perfectByCat: {},
  lastResults: null,
});
if (!daily.lastPlayedByCat || typeof daily.lastPlayedByCat !== "object")
  daily.lastPlayedByCat = {};
if (!daily.perfectByCat || typeof daily.perfectByCat !== "object")
  daily.perfectByCat = {};
saveJSON(DAILY_KEY, daily);

/* ------------------------ Daily picking ------------------------ */
function daysSinceLondon(startYMD = ROTATION_START) {
  const diff = dayDiffLondon(startYMD, todayYMD_London());
  return Math.max(0, diff ?? 0);
}
function pickDailySet(catId, pool, n = 6) {
  if (!Array.isArray(pool) || pool.length === 0) return [];
  const day = daysSinceLondon();
  const base = hashStr(`${PUBLIC_SALT}|${catId}`) % pool.length;
  const start = (base + day * n) % pool.length;
  const out = [];
  for (let i = 0; i < Math.min(n, pool.length); i++)
    out.push(pool[(start + i) % pool.length]);
  return out;
}

/* ------------------------ Questions ------------------------ */
const DATA_PATH = "data";
const QUESTIONS_BY_CATEGORY = {};
let QUESTIONS_READY = false;

async function loadCategoryJSON(catId) {
  const url = `${DATA_PATH}/${catId}.json`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arr = await res.json();
    if (!Array.isArray(arr)) throw new Error("Not an array");
    return arr.filter(
      (x) =>
        x &&
        typeof x.q === "string" &&
        Array.isArray(x.options) &&
        x.options.length >= 2 &&
        typeof x.answer === "string",
    );
  } catch (e) {
    console.warn("[questions] failed", url, e);
    return [];
  }
}
async function loadAllQuestions() {
  for (const { id } of CATEGORIES) {
    QUESTIONS_BY_CATEGORY[id] = await loadCategoryJSON(id);
  }
}
function waitForQuestionsReady() {
  if (QUESTIONS_READY) return Promise.resolve();
  return new Promise((resolve) => {
    let tries = 0;
    const id = setInterval(() => {
      if (QUESTIONS_READY || tries++ > 300) {
        clearInterval(id);
        resolve();
      }
    }, 100);
  });
}

/* ------------------------ Session ------------------------ */
let currentCategory = null;
let session = null;

function inRun() {
  return quizScreen && !quizScreen.classList.contains("hidden");
}
function newSession() {
  const pool = QUESTIONS_BY_CATEGORY[currentCategory] || [];
  if (pool.length === 0) toast("No questions available for this category yet.");
  const todays6 = pickDailySet(currentCategory, pool, 6);
  return {
    category: currentCategory,
    index: 0,
    hearts: BASE_DAILY_HEARTS,
    correctCount: 0,
    xpToday: 0,
    results: [],
    questions: todays6,
  };
}

/* ------------------------ Resume snapshot ------------------------ */
function getResumeSnapshot() {
  try {
    return JSON.parse(localStorage.getItem(RESUME_KEY));
  } catch {
    return null;
  }
}
function saveResumeSnapshot() {
  if (!session) return;
  const snap = {
    category: session.category,
    index: session.index,
    hearts: session.hearts,
    correctCount: session.correctCount,
    xpToday: session.xpToday,
    results: session.results.slice(),
    questions: session.questions.map((q) => ({
      q: q.q,
      options: q.options,
      answer: q.answer,
    })),
    date: todayYMD_London(),
    finished: false,
  };
  saveJSON(RESUME_KEY, snap);
}
function clearResumeSnapshot() {
  localStorage.removeItem(RESUME_KEY);
}
function snapToSession(snap) {
  return {
    category: snap.category,
    index: Math.max(
      0,
      Math.min(Number(snap.index) || 0, (snap.questions?.length || 1) - 1),
    ),
    hearts: Math.max(0, Math.min(Number(snap.hearts) || 0, MAX_HEARTS)),
    correctCount: Math.max(0, Number(snap.correctCount) || 0),
    xpToday: Math.max(0, Number(snap.xpToday) || 0),
    results: Array.isArray(snap.results) ? snap.results.slice() : [],
    questions: Array.isArray(snap.questions) ? snap.questions.slice(0, 6) : [],
  };
}

/* ------------------------ UI switching / HUD ------------------------ */
function switchScreen(which) {
  // Always close the drawer when navigating
  closeMenu?.();

  // hide all
  quizScreen && quizScreen.classList.add("hidden");
  statsScreen && statsScreen.classList.add("hidden");
  homeScreen && homeScreen.classList.add("hidden");

  // show target
  if (which === "quiz") {
    quizScreen && quizScreen.classList.remove("hidden");
    document.body.classList.add("immersive");
  } else if (which === "stats") {
    statsScreen && statsScreen.classList.remove("hidden");
    document.body.classList.remove("immersive");
  } else {
    homeScreen && homeScreen.classList.remove("hidden");
    document.body.classList.remove("immersive");
  }

  const onHome = which === "home";
  if (hudGlobal) hudGlobal.style.display = onHome ? "none" : "flex";
  if (homeActions) homeActions.style.display = onHome ? "flex" : "none";
}

function renderHUD() {
  if (pointsEl) pointsEl.textContent = `⭐ ${profile.points || 0}`;
  if (livesEl)
    livesEl.textContent = `❤️ ${
      inRun() ? (session?.hearts ?? BASE_DAILY_HEARTS) : BASE_DAILY_HEARTS
    }`;
  if (streakEl) streakEl.textContent = `🔥 ${profile.streak || 0}`;
}
function updateProgress() {
  const total = session?.questions?.length || 1;
  const pct = ((session?.index || 0) / total) * 100;
  if (progressBar) progressBar.style.width = `${pct}%`;
}

/* ------------------------ Category lock & tags ------------------------ */
function refreshCategoryLocks() {
  const today = todayYMD_London();
  const items = document.querySelectorAll("#category-list li");
  let playedCount = 0;

  items.forEach((li) => {
    const cat = li.getAttribute("data-cat");
    if (!cat) return;
    const played = daily.lastPlayedByCat?.[cat] === today;
    const perfect = daily.perfectByCat?.[cat] === today;
    const streakN = Number(profile.categoryStreaks?.[cat] || 0);
    if (played) playedCount++;

    let tag = li.querySelector(".tag");
    if (!tag) {
      tag = document.createElement("small");
      tag.className = "tag";
      li.appendChild(tag);
    }

    const bits = [];
    if (perfect) bits.push("💯");
    if (streakN > 0) bits.push(`🔥 ${streakN}`);
    if (played) bits.push("✅");
    tag.textContent = bits.join(" | ");

    li.classList.toggle("disabled", !!played);
  });

  if (startRow && lockRow) {
    const allPlayed = playedCount >= items.length && items.length > 0;
    if (allPlayed) {
      startRow.classList.add("hidden");
      lockRow.classList.remove("hidden");
    } else {
      lockRow.classList.add("hidden");
      startRow.classList.remove("hidden");
    }
  }
}

/* ------------------------ Profile modal ------------------------ */
(function profileUI() {
  const modal = document.getElementById("profile-modal");
  const btnOpen = document.getElementById("open-profile");
  const btnClose = document.getElementById("profile-close");
  const btnSave = document.getElementById("profile-save");
  const input = document.getElementById("username-input");

  if (!modal || !btnOpen) return;

  const BAD = [
    "fuck",
    "shit",
    "cunt",
    "nigger",
    "fag",
    "bitch",
    "asshole",
    "dick",
    "pussy",
  ];
  const normalize = (raw) =>
    String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20);
  const isClean = (n) => !BAD.some((b) => n.includes(b));

  function open() {
    input.value = window.currentUsername || "";
    btnSave.textContent = window.currentUsername
      ? "Change username"
      : "Save username";
    modal.classList.remove("hidden");
  }
  function close() {
    modal.classList.add("hidden");
  }

  async function saveOrChangeUsername() {
    const FB = window.FB;
    if (!FB || !Cloud.ready || !window.currentUID) {
      toast("Sign-in not ready — check Firebase config");
      return;
    }

    const name = normalize(input?.value);
    if (!name || name.length < 3) return toast("Username too short");
    if (!isClean(name)) return toast("That name isn’t allowed");

    const { db, doc, getDoc, setDoc, deleteDoc, serverTimestamp } = FB;
    const uid = window.currentUID;
    const oldName = window.currentUsername;

    if (oldName && name === oldName) {
      close();
      return;
    }

    try {
      const newRef = doc(db, "usernames", name);
      const taken = await getDoc(newRef);
      if (taken.exists()) return toast("That name is taken");

      await setDoc(newRef, { owner: uid, createdAt: serverTimestamp() });

      await setDoc(
        doc(db, "users", uid),
        { username: name, updatedAt: serverTimestamp() },
        { merge: true },
      );

      if (oldName) {
        try {
          await deleteDoc(doc(db, "usernames", oldName));
        } catch {}
      }

      window.currentUsername = name;
      updateHeaderProfileChip();
      toast("Username saved");
      close();
    } catch (e) {
      console.error("[profile] save/change failed:", e);
      toast("Could not save username");
    }
  }

  btnOpen.addEventListener("click", open);
  btnClose?.addEventListener("click", close);
  btnSave?.addEventListener("click", saveOrChangeUsername);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("hidden") && e.key === "Escape") close();
  });
})();

/* ------------------------ Header profile chip (removed modal - now links to account.html) ------------------------ */
// Profile modal functionality removed - users now go to account.html
// updateHeaderProfileChip() no longer needed as we use a simple link

/* ------------------------ Start a run ------------------------ */
function startRunForCategory(catId) {
  const snap = getResumeSnapshot();
  if (snap && snap.category === catId && !snap.finished) {
    currentCategory = catId;
    session = snapToSession(snap);
    renderHUD();
    switchScreen("quiz");
    showCurrentQuestion();
    return;
  }
  const today = todayYMD_London();
  if (daily.lastPlayedByCat?.[catId] === today) {
    toast("You've already played this category today. Try a different one!");
    return;
  }
  currentCategory = catId;
  session = newSession();
  renderHUD();
  switchScreen("quiz");
  showCurrentQuestion();
}

/* ------------------------ Question rendering ------------------------ */
function showCurrentQuestion() {
  updateProgress();
  const q = session?.questions?.[session?.index];
  if (!q || typeof q.q !== "string") {
    clearResumeSnapshot();
    finishRun(false);
    return;
  }
  if (qCatEl && session.category) {
    const stk = profile.categoryStreaks?.[session.category] ?? 0;
    qCatEl.textContent =
      stk > 0
        ? `${LABELS[session.category]}   🔥 ${stk}`
        : `${LABELS[session.category]}`;
  }
  if (qTextEl) qTextEl.textContent = q.q || "";

  const choices = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
  const shuffled = safeShuffle(choices);

  if (optionsEl) {
    optionsEl.innerHTML = "";
    if (shuffled.length === 0) {
      goNextQuestion();
      return;
    }
    shuffled.forEach((choice) => {
      const b = document.createElement("button");
      b.className = "option";
      b.textContent = String(choice);
      b.addEventListener("click", () => onAnswer(q, choice, b));
      optionsEl.appendChild(b);
    });
  }
}
function goNextQuestion() {
  session.index += 1;
  saveResumeSnapshot();
  if (session.index >= session.questions.length) {
    clearResumeSnapshot();
    finishRun(session.correctCount === session.questions.length);
  } else {
    showCurrentQuestion();
  }
}

/* ------------------------ Answer handling ------------------------ */
function onAnswer(q, choice, clicked) {
  $$("#answer-options button, #answer-options .option").forEach(
    (b) => (b.disabled = true),
  );

  const correctAns = q.answer;
  const correct = choice === correctAns;
  session.results.push(correct);

  $$("#answer-options button, #answer-options .option").forEach((b) => {
    if (b.textContent === String(correctAns)) b.classList.add("correct");
  });
  if (!correct && clicked) clicked.classList.add("wrong");

  profile.categoryStats[session.category] ??= { correct: 0, total: 0 };
  profile.categoryStats[session.category].total += 1;

  if (correct) {
    profile.categoryStats[session.category].correct += 1;
    addXP(10);
    session.xpToday += 10;
    session.correctCount += 1;
    saveJSON(PROFILE_KEY, profile);
    renderHUD();
    saveResumeSnapshot();
    setTimeout(goNextQuestion, 650);
  } else {
    session.hearts = Math.max(0, (session.hearts || 0) - 1);
    saveJSON(PROFILE_KEY, profile);
    renderHUD();
    saveResumeSnapshot();

    if (session.hearts <= 0) {
      setTimeout(() => openGameOver(), 650);
      return;
    }

    if (session.hearts === 1 && (profile.points || 0) >= 100) {
      openExtraLifePrompt(
        () => {
          saveResumeSnapshot();
          setTimeout(goNextQuestion, 650);
        },
        () => {
          setTimeout(goNextQuestion, 650);
        },
      );
    } else {
      setTimeout(goNextQuestion, 650);
    }
  }
}

/* ------------------------ Finish & results ------------------------ */
function finishRun(isPerfect) {
  clearResumeSnapshot();

  const perfect = isPerfect === true;
  const today = todayYMD_London();
  const cat = session.category;

  addXP(5);
  session.xpToday += 5;

  const prevDate = daily.lastPlayedByCat?.[cat] || null;
  daily.lastPlayedByCat[cat] = today;
  const diff = prevDate ? dayDiffLondon(prevDate, today) : null;
  if (diff === 1)
    profile.categoryStreaks[cat] = (profile.categoryStreaks[cat] || 0) + 1;
  else profile.categoryStreaks[cat] = 1;

  if (perfect) {
    addXP(20);
    session.xpToday += 20;
    daily.perfectByCat[cat] = today;

    // Award a sticker and show the reward modal
    const sticker = awardStickerIfNeeded();
    renderMiniCollection(); // refresh mini row
    renderCollection(); // refresh full grid (if open)
    openRewardModal(sticker);
  }

  saveJSON(PROFILE_KEY, profile);

  daily.lastResults = {
    category: cat,
    date: today,
    correctCount: session.correctCount,
    total: session.questions.length,
    xpToday: session.xpToday,
    heartsLeft: session.hearts,
    perfect,
    results: session.results.slice(),
  };
  saveJSON(DAILY_KEY, daily);

  openResultsModal(daily.lastResults);
  renderHUD();
  refreshCategoryLocks();
}

/* ------------------------ Exit mid-run ------------------------ */
exitQuizBtn?.addEventListener("click", () => {
  if (!session) {
    switchScreen("home");
    return;
  }
  saveResumeSnapshot();
  switchScreen("home");
  renderHUD();
  toast("Progress saved — resume from the category.");
});

/* ------------------------ Results modal ------------------------ */
function openResultsModal(snapshot) {
  if (!snapshot) return;
  const modal = $("#results-modal");
  if (!modal) return;

  const total = snapshot.total ?? (session?.questions?.length || 6);
  const base = (snapshot.correctCount || 0) * 10;
  const finish = 5;
  const bonus = snapshot.perfect ? 20 : 0;

  $("#m-total") && ($("#m-total").textContent = total);
  $("#m-correct") && ($("#m-correct").textContent = snapshot.correctCount ?? 0);
  $("#m-xp") && ($("#m-xp").textContent = snapshot.xpToday ?? 0);
  $("#m-xp-break") &&
    ($("#m-xp-break").textContent =
      `+${base} (answers) +${finish} (finish)` +
      (snapshot.perfect ? ` +${bonus} (perfect)` : ""));
  $("#m-streak") && ($("#m-streak").textContent = `${profile.streak || 0} 🔥`);
  $("#m-hearts") &&
    ($("#m-hearts").textContent = `${
      snapshot.heartsLeft ?? session?.hearts ?? BASE_DAILY_HEARTS
    } ❤️`);
  $("#m-perfect") &&
    ($("#m-perfect").textContent = snapshot.perfect ? "Perfect! 🎯" : "");

  const mGrid = $("#m-grid");
  if (mGrid) {
    mGrid.innerHTML = "";
    const results = Array.isArray(snapshot.results) ? snapshot.results : [];
    for (let i = 0; i < total; i++) {
      const d = document.createElement("div");
      d.className = "box " + (results[i] ? "ok" : "bad");
      mGrid.appendChild(d);
    }
  }

  modal.classList.remove("hidden");
}
function closeResultsModal(goHome = true) {
  const modal = $("#results-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  if (goHome) {
    switchScreen("home");
    renderHUD();
    refreshCategoryLocks();
  }
}
$("#close-results")?.addEventListener("click", () => closeResultsModal(true));
$("#results-modal")?.addEventListener("click", (e) => {
  if (e.target.id === "results-modal") closeResultsModal(true);
});
document.addEventListener("keydown", (e) => {
  const modal = $("#results-modal");
  if (modal && !modal.classList.contains("hidden") && e.key === "Escape")
    closeResultsModal(true);
});
$("#modal-share")?.addEventListener("click", async () => {
  const r = daily.lastResults;
  if (!r) return;
  const text = `Daily Trivia — ${LABELS[r.category]}
${r.correctCount}/${r.total} correct
🔥 Streak: ${profile.streak}
⭐ XP today: ${r.xpToday}`;
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Daily Trivia",
        text,
        url: location.href,
      });
      return;
    }
  } catch {}
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(`${text}\n${location.href}`);
      toast("Copied to clipboard");
      return;
    }
  } catch {}
  alert(text);
});

/* ------------------------ Stickers / Collection ------------------------ */
function awardStickerIfNeeded() {
  // Build full set of possible stickers
  const all = Array.from(
    { length: STICKER_COUNT },
    (_, i) => `assets/stickers/sticker_${i + 1}.webp`,
  );
  // Prefer giving a sticker the player doesn't own yet
  const missing = all.filter((src) => !profile.inventory.includes(src));
  const pool = missing.length ? missing : all;
  const src = pool[Math.floor(Math.random() * pool.length)];

  if (!profile.inventory.includes(src)) {
    profile.inventory.push(src);
    saveJSON(PROFILE_KEY, profile);
  }
  return src; // return the awarded (or selected) sticker path
}

function renderCollection() {
  if (!collectionGrid) return;
  collectionGrid.innerHTML = "";
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const slot = document.createElement("div");
    slot.className = "bag-slot" + (!profile.inventory[i] ? " locked" : "");
    if (profile.inventory[i]) {
      const img = document.createElement("img");
      img.src = profile.inventory[i];
      img.alt = "Sticker";
      slot.appendChild(img);
    }
    collectionGrid.appendChild(slot);
  }
}
function renderMiniCollection() {
  if (!miniCollection) return;
  miniCollection.innerHTML = "";
  (profile.inventory || []).slice(-8).forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Sticker";
    img.className = "thumb";
    miniCollection.appendChild(img);
  });
}

function openRewardModal(src) {
  const modal = document.getElementById("reward-modal");
  if (!modal) return;
  const img = document.getElementById("reward-image");
  const name = document.getElementById("reward-name");

  if (img) img.src = src;
  if (name) name.textContent = "New sticker unlocked!";

  modal.classList.remove("hidden");

  const closeBtn = document.getElementById("close-reward");
  const onClose = () => {
    modal.classList.add("hidden");
    closeBtn?.removeEventListener("click", onClose);
    modal.removeEventListener("click", onBackdrop);
  };
  const onBackdrop = (e) => {
    if (e.target === modal) onClose();
  };

  closeBtn?.addEventListener("click", onClose);
  modal.addEventListener("click", onBackdrop);
}

/* ------------------------ Buy life ------------------------ */
function buyLife() {
  if (!inRun()) return toast("Start a quiz to buy a life");
  openExtraLifePrompt(
    () => {},
    () => {},
  );
}
function openExtraLifePrompt(onBuy, onCancel) {
  let modal = document.getElementById("life-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "life-modal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-head">
          <h3>Need one more life?</h3>
          <button id="life-cancel" class="chip">✖</button>
        </div>
        <p class="muted">Buy <strong>+1 life</strong> for <strong>100 XP</strong>.<br>
           You have <strong id="xp-balance">0</strong> XP.</p>
        <div class="row" style="margin-top:10px">
          <button id="life-buy" class="btn btn-primary">❤️ Buy life (100 XP)</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  const buyBtn = modal.querySelector("#life-buy");
  const cancelBtn = modal.querySelector("#life-cancel");
  const bal = modal.querySelector("#xp-balance");

  if (bal) bal.textContent = profile.points ?? 0;
  buyBtn.disabled = (profile.points || 0) < 100;
  buyBtn.textContent = buyBtn.disabled ? "Need 100 XP" : "❤️ Buy life (100 XP)";

  function close() {
    modal.classList.add("hidden");
    cleanup();
  }
  function cleanup() {
    buyBtn.removeEventListener("click", onBuyClick);
    cancelBtn.removeEventListener("click", onCancelClick);
    modal.removeEventListener("click", onBackdrop);
    document.removeEventListener("keydown", onEsc);
  }
  function onBuyClick() {
    if (!spendXP(100)) return toast("Need 100 XP");
    session.hearts = Math.min((session.hearts || 0) + 1, MAX_HEARTS);
    renderHUD();
    saveResumeSnapshot();
    close();
    onBuy && onBuy();
  }
  function onCancelClick() {
    close();
    onCancel && onCancel();
  }
  function onBackdrop(e) {
    if (e.target === modal) onCancelClick();
  }
  function onEsc(e) {
    if (e.key === "Escape") onCancelClick();
  }

  buyBtn.addEventListener("click", onBuyClick);
  cancelBtn.addEventListener("click", onCancelClick);
  modal.addEventListener("click", onBackdrop);
  document.addEventListener("keydown", onEsc);

  modal.classList.remove("hidden");
}

/* ------------------------ Game Over ------------------------ */
function openGameOver() {
  let modal = document.getElementById("gameover-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "gameover-modal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <h3>💔 Game Over</h3>
        <p class="muted">You ran out of lives. Try again tomorrow!</p>
        <div class="row" style="margin-top:10px">
          <button id="restart-game" class="btn">Home</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  modal.querySelector("#restart-game").onclick = () => {
    modal.classList.add("hidden");
    clearResumeSnapshot();
    finishRun(false);
    switchScreen("home");
    renderHUD();
  };
  modal.classList.remove("hidden");
}

/* ------------------------ Button wiring ------------------------ */
document.querySelectorAll("#category-list li").forEach((item) => {
  item.addEventListener("click", () => {
    if (!QUESTIONS_READY) {
      toast("Loading questions… one moment");
      return;
    }
    if (item.classList.contains("disabled")) return;
    const cat = item.getAttribute("data-cat");
    if (!cat) return;
    startRunForCategory(cat);
  });
});
btnOpenCollection?.addEventListener("click", () => {
  renderCollection();
  collectionModal?.classList.remove("hidden");
});
openCollection2?.addEventListener("click", () => {
  renderCollection();
  collectionModal?.classList.remove("hidden");
});
openCollection3?.addEventListener("click", () => {
  renderCollection();
  collectionModal?.classList.remove("hidden");
});
closeCollection?.addEventListener("click", () => {
  collectionModal?.classList.add("hidden");
});
btnJumpStats?.addEventListener("click", () => {
  document
    .getElementById("home-locked")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
});
btnFeedback?.addEventListener("click", () => {
  location.href = "feedback.html";
});
buyLifeBtn?.addEventListener("click", buyLife);
shareBtn?.addEventListener("click", async () => {
  const r = daily.lastResults;
  if (!r) {
    toast("No results yet");
    return;
  }
  const text = `Daily Trivia — ${LABELS[r.category]}
${r.correctCount}/${r.total} correct
🔥 Streak: ${profile.streak}
⭐ XP today: ${r.xpToday}`;
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Daily Trivia",
        text,
        url: location.href,
      });
      return;
    }
  } catch {}
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(`${text}\n${location.href}`);
      toast("Copied to clipboard");
      return;
    }
  } catch {}
  alert(text);
});
backHomeBtn?.addEventListener("click", () => switchScreen("home"));

/* Leaderboard button */
if (btnLeaderboard) {
  btnLeaderboard.addEventListener("click", () => {
    if (!window.currentUsername) {
      toast("Pick a username to enter the leaderboard");
      // Redirect to account page instead of opening modal
      window.location.href = "account.html";
      return;
    }
    window.location.href = "leaderboard.html";
  });
}

/* ------------------------ Initial render ------------------------ */
switchScreen("home");
renderHUD();
renderMiniCollection();
refreshCategoryLocks();
startCountdown();

// Show a small banner offering resume instead of auto-entering the quiz
function showResumePromptIfAny() {
  const snap = getResumeSnapshot();
  const banner = document.getElementById("resume-banner");
  if (!snap || !banner) return;

  const today = todayYMD_London();
  if (snap.date !== today || !snap.category || snap.finished) {
    clearResumeSnapshot();
    return;
  }

  banner.classList.remove("hidden");

  document
    .getElementById("resume-continue")
    ?.addEventListener("click", async () => {
      await waitForQuestionsReady();
      currentCategory = snap.category;
      session = snapToSession(snap);
      renderHUD();
      switchScreen("quiz"); // user chooses to enter quiz
      showCurrentQuestion();
      banner.classList.add("hidden");
    });

  document.getElementById("resume-discard")?.addEventListener("click", () => {
    clearResumeSnapshot();
    banner.classList.add("hidden");
  });
}

/* Load questions, then offer resume (home stays visible) */
loadAllQuestions().then(() => {
  QUESTIONS_READY = true;
  showResumePromptIfAny();
});

/* ------------------------ Stats grid (optional) ------------------------ */
function renderCatStats() {
  const grid = $("#cat-stats");
  if (!grid) return;
  grid.innerHTML = "";
  const today = todayYMD_London();
  const data = CAT_IDS.map((cat) => {
    const st = profile.categoryStats?.[cat] || { correct: 0, total: 0 };
    const acc = st.total ? Math.round((st.correct / st.total) * 100) : 0;
    const pStk = profile.categoryStreaks?.[cat] || 0;
    const playedToday = daily.lastPlayedByCat?.[cat] === today;
    return { cat, label: LABELS[cat], st, acc, pStk, playedToday };
  }).sort((a, b) => b.st.total - a.st.total || b.acc - a.acc);

  data.forEach(({ label, st, acc, pStk, playedToday }) => {
    const band = acc >= 80 ? "ok" : acc >= 50 ? "warn" : "bad";
    const card = document.createElement("div");
    card.className = "stat-card stat";
    card.innerHTML = `
      <div class="top">
        <div class="title">${label}</div>
        <div class="acc">${acc}%</div>
      </div>
      <div class="bar"><div class="fill ${band}" style="width:${acc}%;"></div></div>
      <div class="meta">
        <span>${st.correct}/${st.total} correct</span>
        <span>🔥 Streak: ${pStk}</span>
      </div>
      ${playedToday ? `<div class="muted small">Played today</div>` : ``}
    `;
    grid.appendChild(card);
  });
}
renderCatStats();

/* ------------------------ Dev helper: reset daily locks ------------------------ */
document.addEventListener("keydown", (e) => {
  if (e.shiftKey && (e.key === "R" || e.key === "r")) {
    daily.lastPlayedByCat = {};
    daily.perfectByCat = {};
    saveJSON(DAILY_KEY, daily);
    clearResumeSnapshot();
    refreshCategoryLocks();
    toast("Daily locks reset for testing");
  }
});

/* ------------------------ Authentication Handlers ------------------------ */
// Tab switching
const tabLogin = $("#tab-login");
const tabSignup = $("#tab-signup");
const loginForm = $("#login-form");
const signupForm = $("#signup-form");

tabLogin?.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabSignup?.classList.remove("active");
  loginForm?.classList.remove("hidden");
  signupForm?.classList.add("hidden");
  clearAuthErrors();
});

tabSignup?.addEventListener("click", () => {
  tabSignup.classList.add("active");
  tabLogin?.classList.remove("active");
  signupForm?.classList.remove("hidden");
  loginForm?.classList.add("hidden");
  clearAuthErrors();
});

function clearAuthErrors() {
  const loginError = $("#login-error");
  const signupError = $("#signup-error");
  if (loginError) {
    loginError.classList.add("hidden");
    loginError.textContent = "";
  }
  if (signupError) {
    signupError.classList.add("hidden");
    signupError.textContent = "";
  }
}

function showAuthError(formType, message) {
  const errorEl = formType === "login" ? $("#login-error") : $("#signup-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }
}

// Login handler
$("#btn-login")?.addEventListener("click", async () => {
  const email = $("#login-email")?.value.trim();
  const password = $("#login-password")?.value;

  if (!email || !password) {
    showAuthError("login", "Please enter both email and password");
    return;
  }

  try {
    const { signInWithEmailAndPassword, auth } = window.FB;
    await signInWithEmailAndPassword(auth, email, password);
    toast("Welcome back!");
  } catch (error) {
    console.error("[auth] login error:", error);
    let message = "Login failed. Please check your credentials.";
    if (error.code === "auth/user-not-found") {
      message = "No account found with this email.";
    } else if (error.code === "auth/wrong-password") {
      message = "Incorrect password.";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email address.";
    } else if (error.code === "auth/invalid-credential") {
      message = "Invalid credentials. Please check your email and password.";
    }
    showAuthError("login", message);
  }
});

// Signup handler
$("#btn-signup")?.addEventListener("click", async () => {
  const email = $("#signup-email")?.value.trim();
  const password = $("#signup-password")?.value;
  const confirmPassword = $("#signup-password-confirm")?.value;

  if (!email || !password || !confirmPassword) {
    showAuthError("signup", "Please fill in all fields");
    return;
  }

  if (password.length < 6) {
    showAuthError("signup", "Password must be at least 6 characters");
    return;
  }

  if (password !== confirmPassword) {
    showAuthError("signup", "Passwords do not match");
    return;
  }

  try {
    const { createUserWithEmailAndPassword, auth } = window.FB;
    await createUserWithEmailAndPassword(auth, email, password);
    toast("Account created successfully!");
  } catch (error) {
    console.error("[auth] signup error:", error);
    let message = "Signup failed. Please try again.";
    if (error.code === "auth/email-already-in-use") {
      message = "An account with this email already exists.";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email address.";
    } else if (error.code === "auth/weak-password") {
      message = "Password is too weak. Use at least 6 characters.";
    }
    showAuthError("signup", message);
  }
});

// Logout handler
function handleLogout() {
  if (!window.FB || !window.FB.auth) return;

  const { signOut, auth } = window.FB;
  signOut(auth)
    .then(() => {
      toast("Logged out successfully");
      // Clear form inputs
      const loginEmail = $("#login-email");
      const loginPassword = $("#login-password");
      const signupEmail = $("#signup-email");
      const signupPassword = $("#signup-password");
      const signupPasswordConfirm = $("#signup-password-confirm");

      if (loginEmail) loginEmail.value = "";
      if (loginPassword) loginPassword.value = "";
      if (signupEmail) signupEmail.value = "";
      if (signupPassword) signupPassword.value = "";
      if (signupPasswordConfirm) signupPasswordConfirm.value = "";

      clearAuthErrors();
    })
    .catch((error) => {
      console.error("[auth] logout error:", error);
      toast("Logout failed. Please try again.");
    });
}

// Logout handlers are now in header-component.js
// $("#btn-logout")?.addEventListener("click", handleLogout);
// $("#m-logout")?.addEventListener("click", () => {
//   handleLogout();
//   closeMenu();
// });

// Enter key support for login/signup forms
$("#login-password")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    $("#btn-login")?.click();
  }
});

$("#signup-password-confirm")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    $("#btn-signup")?.click();
  }
});

// Check URL parameters for opening collection from account page
(function checkURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("openCollection") === "true") {
    // Wait a bit for the page to load, then open collection
    setTimeout(() => {
      renderCollection();
      collectionModal?.classList.remove("hidden");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 500);
  }
})();

// Guest banner event listeners
const closeGuestBanner = $("#close-guest-banner");
const guestSignupLink = $("#guest-signup-link");

closeGuestBanner?.addEventListener("click", () => {
  const guestBanner = $("#guest-banner");
  if (guestBanner) {
    guestBanner.style.display = "none";
    // Remember user dismissed banner
    localStorage.setItem(STORAGE_PREFIX + "guest_banner_dismissed", "true");
  }
});

guestSignupLink?.addEventListener("click", (e) => {
  e.preventDefault();
  // Show auth screen
  const authScreen = $("#auth-screen");
  const homeScreen = $("#home-screen");
  const topbar = document.querySelector(".topbar");

  if (authScreen) authScreen.classList.remove("hidden");
  if (homeScreen) homeScreen.classList.add("hidden");
  if (topbar) topbar.style.display = "none";

  // Switch to signup tab
  const signupTab = $("#tab-signup");
  signupTab?.click();
});

// Check if guest dismissed banner before
if (
  Cloud.isGuest &&
  localStorage.getItem(STORAGE_PREFIX + "guest_banner_dismissed") === "true"
) {
  const guestBanner = $("#guest-banner");
  if (guestBanner) {
    guestBanner.style.display = "none";
  }
}

// EOF
