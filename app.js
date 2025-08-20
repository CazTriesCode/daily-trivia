/* =========================================================
   Daily Trivia — full app.js (safe + data-preserving)
   ========================================================= */

/* ---------- Category setup ---------- */
const CATS = ["animals", "gaming", "marvel", "lotr", "cars", "hp"];
const LABELS = {
  animals: "🐾 Animals",
  gaming: "🎮 Gaming",
  marvel: "🦸‍♂️ Marvel",
  lotr: "💍 Lord of the Rings",
  cars: "🚗 Cars",
  hp: "🪄 Harry Potter",
};

/* ---------- Game constants ---------- */
const PUBLIC_SALT = "dt-v1"; // deterministic daily pick
const MAX_HEARTS = 5; // cap with purchases
const BASE_DAILY_HEARTS = 3; // daily minimum top-up
const STICKER_COUNT = 18; // sticker_1..sticker_18
const TOTAL_SLOTS = 18; // bag capacity

/* ---------- Question bank (10 / category) ---------- */
const BANK = [
  /* Animals */

  {
    category: "animals",
    q: "Which animal has the longest gestation period?",
    a: "African elephant",
    distractors: ["Giraffe", "Blue whale", "Hippopotamus"],
  },

  {
    category: "animals",
    q: "Which bear species is generally the largest?",
    a: "Polar bear",
    distractors: ["Grizzly bear", "Panda", "Black bear"],
  },


  /* Gaming */
  {
    category: "gaming",
    q: "Minecraft: which block is required to build a Nether portal?",
    a: "Obsidian",
    distractors: ["Basalt", "Granite", "Bedrock"],
  },

  {
    category: "gaming",
    q: "Mario Kart: which item grants brief invincibility?",
    a: "Super Star",
    distractors: ["Golden Mushroom", "Bullet Bill", "Boo"],
  },
  {
    category: "gaming",
    q: "Pokémon: which type is super effective against Fire?",
    a: "Water",
    distractors: ["Grass", "Electric", "Fighting"],
  },
  {
    category: "gaming",
    q: "Among Us (10-player default): how many Impostors?",
    a: "2",
    distractors: ["1", "3", "4"],
  },


  /* Marvel */

  {
    category: "marvel",
    q: "Scarlet Witch’s twin brother is…",
    a: "Quicksilver",
    distractors: ["Hawkeye", "Vision", "Polaris"],
  },

  {
    category: "marvel",
    q: "The leader of the Dora Milaje is…",
    a: "Okoye",
    distractors: ["Nakia", "Shuri", "Queen Ramonda"],
  },

  /* LOTR */

  {
    category: "lotr",
    q: "Narsil is reforged into…",
    a: "Andúril",
    distractors: ["Glamdring", "Sting", "Orcrist"],
  },
  {
    category: "lotr",
    q: "Steward of Gondor during the War of the Ring?",
    a: "Denethor II",
    distractors: ["Boromir", "Faramir", "Théoden"],
  },
  {
    category: "lotr",
    q: "Merry and Pippin meet Treebeard in…",
    a: "Fangorn Forest",
    distractors: ["Mirkwood", "Lothlórien", "The Old Forest"],
  },
  {
    category: "lotr",
    q: "Galadriel gives Frodo the…",
    a: "Phial of Galadriel",
    distractors: ["Elven cloak", "Elven rope", "Lembas bread"],
  },
   
  {
    category: "lotr",
    q: "The giant spider in Cirith Ungol is…",
    a: "Shelob",
    distractors: ["Ungoliant", "Aranea", "Shelga"],
  },

  /* Cars */

  {
    category: "cars",
    q: "Toyota’s pioneering 1997 hybrid model is the…",
    a: "Prius",
    distractors: ["Insight", "Leaf", "Mirai"],
  },
 
  {
    category: "cars",
    q: "Which company makes the 911?",
    a: "Porsche",
    distractors: ["BMW", "Audi", "Mercedes-Benz"],
  },

  {
    category: "cars",
    q: "A turbocharger’s main purpose is to…",
    a: "Force more air into the engine",
    distractors: [
      "Reduce emissions only",
      "Cool engine coolant",
      "Increase tire pressure",
    ],
  },
  {
    category: "cars",
    q: "In a car, the ECU primarily controls…",
    a: "Engine functions",
    distractors: ["Exhaust system", "Electric seats", "Infotainment"],
  },

  {
    category: "cars",
    q: "What safety feature became mandatory on U.S. cars in 1998?",
    a: "Front airbags",
    distractors: ["ABS", "Backup cameras", "Traction control"],
  },

  /* Harry Potter */

  {
    category: "hp",
    q: "The pub entrance to Diagon Alley is the…",
    a: "Leaky Cauldron",
    distractors: ["Three Broomsticks", "Hog’s Head", "Hanged Man"],
  },
   
  {
    category: "hp",
    q: "Which potion compels truth?",
    a: "Veritaserum",
    distractors: ["Polyjuice Potion", "Felix Felicis", "Amortentia"],
  },
  {
    category: "hp",
    q: "The Killing Curse is…",
    a: "Avada Kedavra",
    distractors: ["Crucio", "Expelliarmus", "Sectumsempra"],
  },
  {
    category: "hp",
    q: "The Half-Blood Prince is…",
    a: "Severus Snape",
    distractors: ["Tom Riddle", "Draco Malfoy", "Sirius Black"],
  },
  {
    category: "hp",
    q: "Nearly Headless Nick is the ghost of which house?",
    a: "Gryffindor",
    distractors: ["Ravenclaw", "Hufflepuff", "Slytherin"],
  },
   

   

];

/* ---------- DOM helpers ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* HUD */
const pointsEl = $("#points");
const livesEl = $("#lives");
const streakEl = $("#streak");

/* Home / lock UI */
const startBtn = $("#start-game");
const startRow = $("#start-row");
const lockRow = $("#lock-row");
const countdownEl = $("#countdown");
const todayCard = $("#today-results-card");

/* Quiz UI */
const quizLayer = $("#quiz-screen");
const progressBar = $("#progress-bar");
const qCatEl = $("#question-category");
const qTextEl = $("#question-text");
const optionsEl = $("#answer-options");

/* Stats (for results card on the page) */
const statsScreen = $("#stats-screen");
const resCorrect = $("#result-correct");
const resXP = $("#result-xp");
const resXPBreak = $("#result-xp-breakdown");
const resStreak = $("#result-streak");
const resHearts = $("#result-hearts");
const resPerfect = $("#result-perfect");
const resultScoreTotal = $("#result-total");
const backHomeBtn = $("#back-home");
const shareResultsBtn = $("#share-results");

/* Collection modal */
const collectionModal = $("#collection-modal");
const openCollection1 = $("#open-collection");
const openCollection2 = $("#open-collection-2");
const openCollection3 = $("#open-collection-3");
const closeCollection = $("#close-collection");
const collectionGrid = $("#collection-grid");
const miniCollection = $("#mini-collection");

/* Reward / Game over */
const rewardModal = $("#reward-modal");
const rewardImg = $("#reward-image");
const rewardName = $("#reward-name");
const closeReward = $("#close-reward");
const gameoverModal = $("#gameover-modal");
const restartBtn = $("#restart-game");

/* Results modal (NYT-style) */
const resultsModal = $("#results-modal");
const closeResults = $("#close-results");
const mCorrect = $("#m-correct");
const mTotal = $("#m-total");
const mPerfect = $("#m-perfect");
const mXP = $("#m-xp");
const mXPBreak = $("#m-xp-break");
const mStreak = $("#m-streak");
const mHearts = $("#m-hearts");
const mGrid = $("#m-grid");
const modalShareBtn = $("#modal-share");

/* ---------- Storage (with migration) ---------- */
const PROFILE_KEY = "dt_profile_v6";
const DAILY_KEY = "dt_daily_v2";
const OLD_PROFILE_KEY = "dt_profile_v5";
const OLD_DAILY_KEY = "dt_daily_state_v1";

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

function loadProfile() {
  return loadJSON(PROFILE_KEY, {
    points: 0,
    streak: 0,
    hearts: BASE_DAILY_HEARTS,
    lastPlayLocal: null,
    inventory: [],
    categoryStats: CATS.reduce(
      (a, c) => ((a[c] = { correct: 0, total: 0 }), a),
      {}
    ),
    lastResults: null,
  });
}
function saveProfile(p) {
  saveJSON(PROFILE_KEY, p);
}

function loadDaily() {
  return loadJSON(DAILY_KEY, {});
}
function saveDaily(d) {
  saveJSON(DAILY_KEY, d);
}

/* migrate once */
(function migrateIfNeeded() {
  if (
    !localStorage.getItem(PROFILE_KEY) &&
    localStorage.getItem(OLD_PROFILE_KEY)
  ) {
    const old = loadJSON(OLD_PROFILE_KEY, {});
    const mapped = {
      points: old.points ?? 0,
      streak: old.streak ?? 0,
      hearts: typeof old.hearts === "number" ? old.hearts : BASE_DAILY_HEARTS,
      lastPlayLocal: old.lastPlayDate ?? null,
      inventory: Array.isArray(old.inventory) ? old.inventory : [],
      categoryStats:
        old.categoryStats ||
        CATS.reduce((a, c) => ((a[c] = { correct: 0, total: 0 }), a), {}),
      lastResults: old.lastResults || null,
    };
    saveProfile(mapped);
  }
  if (!localStorage.getItem(DAILY_KEY) && localStorage.getItem(OLD_DAILY_KEY)) {
    const old = loadJSON(OLD_DAILY_KEY, {});
    const mapped = {
      lastPlayed: old.lastPlayed || old.date || undefined,
      lastResults: old.lastResults || null,
    };
    saveDaily(mapped);
  }
})();

/* ---------- Dates ---------- */
const todayUTCKey = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getUTCDate()).padStart(2, "0")}`;
};
const msUntilTomorrowUTC = () => {
  const d = new Date();
  const t = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );
  return t - d.getTime();
};
const DEV =
  location.hostname === "localhost" || /[?&](dev|test)=1/.test(location.search);

/* ---------- Profile / daily init ---------- */
let profile = loadProfile();
let daily = loadDaily();

/* reset hearts on new local day (top up to 3; keep extras if higher) */
const todayLocal = new Date().toISOString().split("T")[0];
if (profile.lastPlayLocal !== todayLocal) {
  profile.hearts = Math.max(profile.hearts ?? 0, BASE_DAILY_HEARTS);
  profile.lastPlayLocal = todayLocal;
  saveProfile(profile);
}

/* ---------- Session ---------- */
let session = newSession();

function newSession() {
  return {
    index: 0,
    hearts: Math.min(profile.hearts ?? BASE_DAILY_HEARTS, MAX_HEARTS),
    correctCount: 0,
    xpToday: 0,
    results: [],
    usedFinishBonus: false,
    rewardedToday: false,
    questions: buildDailyQuestions(),
  };
}

function buildDailyQuestions() {
  const dayKey = todayUTCKey();
  return CATS.map((cat) => {
    const pool = BANK.filter((q) => q.category === cat);
    if (!pool.length) return null;
    const offset = hashStr(`${PUBLIC_SALT}|${dayKey}|${cat}`) % pool.length;
    return pool[offset];
  }).filter(Boolean);
}

/* ---------- Utils ---------- */
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function safeShuffle(arr) {
  const a = Array.isArray(arr) ? [...arr] : [];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function buildChoices(q) {
  const ds = Array.isArray(q?.distractors) ? q.distractors.filter(Boolean) : [];
  while (ds.length < 3) ds.push("None of these");
  return [q.a, ...ds.slice(0, 3)];
}

/* ---------- UI helpers ---------- */
function inRun() {
  return !quizLayer?.classList.contains("hidden");
}

function renderHUD() {
  const heartsNow = inRun()
    ? session.hearts
    : profile.hearts ?? BASE_DAILY_HEARTS;
  if (pointsEl) pointsEl.textContent = `⭐ ${profile.points}`;
  if (livesEl) livesEl.textContent = `❤️ ${heartsNow}`;
  if (streakEl) streakEl.textContent = `🔥 ${profile.streak || 0}`;
}
function switchScreen(which) {
  if (which === "quiz") {
    $("#home-screen")?.classList.add("hidden");
    statsScreen?.classList.add("hidden");
    quizLayer?.classList.remove("hidden");
  } else if (which === "stats") {
    $("#home-screen")?.classList.add("hidden");
    quizLayer?.classList.add("hidden");
    statsScreen?.classList.remove("hidden");
  } else {
    quizLayer?.classList.add("hidden");
    statsScreen?.classList.add("hidden");
    $("#home-screen")?.classList.remove("hidden");
  }
}
function updateProgress() {
  const pct = (session.index / (session.questions.length || 1)) * 100;
  if (progressBar) progressBar.style.width = `${pct}%`;
}

/* ---------- Flow ---------- */
function startRun() {
  session = newSession();
  renderHUD();
  switchScreen("quiz");
  showCurrentQuestion();
}
function showCurrentQuestion() {
  updateProgress();
  const q = session.questions[session.index];
  if (!q) {
    finishRun(false);
    return;
  }

  if (qCatEl) qCatEl.textContent = LABELS[q.category] || "Trivia";
  if (qTextEl) qTextEl.textContent = q.q;

  const choices = safeShuffle(buildChoices(q));
  if (optionsEl) {
    optionsEl.innerHTML = "";
    choices.forEach((choice) => {
      const b = document.createElement("button");
      b.className = "option";
      b.textContent = choice;
      b.addEventListener("click", () => onAnswer(q, choice, b));
      optionsEl.appendChild(b);
    });
  }
}
function onAnswer(q, choice, clicked) {
  $$("#answer-options button, #answer-options .option").forEach(
    (b) => (b.disabled = true)
  );

  const correct = choice === q.a;
  session.results.push(correct);

  profile.categoryStats[q.category] ??= { correct: 0, total: 0 };
  profile.categoryStats[q.category].total += 1;
  if (correct) profile.categoryStats[q.category].correct += 1;

  $$("#answer-options button, #answer-options .option").forEach((b) => {
    if (b.textContent === q.a) b.classList.add("correct");
  });
  if (!correct && clicked) clicked.classList.add("wrong");

  if (correct) {
    const prevXP = profile.points;
    profile.points += 10;
    session.xpToday += 10;
    session.correctCount += 1;
    if (Math.floor(profile.points / 100) > Math.floor(prevXP / 100)) {
      if (session.hearts < MAX_HEARTS) session.hearts += 1;
    }
  } else {
    profile.streak = 0;
    session.hearts = Math.max(0, session.hearts - 1);

    if (session.hearts <= 0) {
      openExtraLifePrompt(
        () => {
          // bought: resume
          setTimeout(() => {
            session.index += 1;
            if (session.index >= session.questions.length) {
              finishRun(session.correctCount === session.questions.length);
            } else {
              showCurrentQuestion();
            }
          }, 150);
        },
        () => {
          // declined
          finishRun(false);
        }
      );
      saveProfile(profile);
      renderHUD();
      return; // pause flow
    }
  }

  saveProfile(profile);
  renderHUD();

  setTimeout(() => {
    session.index += 1;
    if (session.index >= session.questions.length) {
      finishRun(session.correctCount === session.questions.length);
    } else {
      showCurrentQuestion();
    }
  }, 550);
}

function renderResults(perfect) {
  if (progressBar) progressBar.style.width = "100%";
  const total = session.questions.length;

  if (resultScoreTotal) resultScoreTotal.textContent = total;
  if (resCorrect) resCorrect.textContent = session.correctCount;
  if (resXP) resXP.textContent = session.xpToday;
  if (resStreak) resStreak.textContent = `${profile.streak || 0} 🔥`;
  if (resHearts) resHearts.textContent = `${session.hearts} ❤️`;
  if (resPerfect) resPerfect.textContent = perfect ? "Perfect! 🎯" : "";

  const base = session.correctCount * 10,
    finish = 5,
    bonus = perfect ? 20 : 0;
  if (resXPBreak)
    resXPBreak.textContent =
      `+${base} (answers) +${finish} (finish)` +
      (perfect ? ` +${bonus} (perfect)` : "");

  // result grid on stats screen (even if we don't show it immediately)
  const wrap = $("#result-grid");
  if (wrap) {
    wrap.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const box = document.createElement("div");
      box.className = "box";
      if (session.results[i] === true) box.classList.add("ok");
      if (session.results[i] === false) box.classList.add("bad");
      wrap.appendChild(box);
    }
  }
}

function finishRun(perfect) {
  if (!session.usedFinishBonus) {
    profile.points += 5;
    session.xpToday += 5;
    session.usedFinishBonus = true;
  }
  if (perfect) {
    profile.points += 20;
    session.xpToday += 20;
    profile.streak = (profile.streak || 0) + 1;
  }

  profile.hearts = Math.max(0, session.hearts);
  saveProfile(profile);

  daily.lastPlayed = todayUTCKey();
  daily.lastResults = {
    date: daily.lastPlayed,
    correctCount: session.correctCount,
    xpToday: session.xpToday,
    hearts: session.hearts,
    perfect,
    results: session.results.slice(),
  };
  saveDaily(daily);

  renderHUD();
  renderResults(perfect);
  renderHomeState(); // updates dashboard + countdown

  if (perfect) {
    const got = awardStickerIfNeeded(); // returns src or null
    if (got) {
      showRewardThenResults(daily.lastResults); // sticker first, then results
      return;
    }
  }
  openResultsModal(daily.lastResults);
}

/* ---------- Home / lock ---------- */
function renderHomeTodayCard(snapshot) {
  if (!todayCard) return;
  if (!snapshot) {
    todayCard.classList.add("hidden");
    todayCard.innerHTML = "";
    return;
  }

  const total = snapshot.results?.length || CATS.length;
  const boxes = (snapshot.results || [])
    .map((ok) => `<span class="box ${ok ? "ok" : "bad"}"></span>`)
    .join("");

  todayCard.innerHTML = `
    <h3>Today’s Results</h3>
    <div class="stats-cards">
      <div class="stat-card"><div class="title">Score</div><div class="big">${
        snapshot.correctCount
      }/${total}</div></div>
      <div class="stat-card"><div class="title">XP earned</div><div class="big">${
        snapshot.xpToday
      }</div><div class="muted small">+${
    snapshot.correctCount * 10
  } (answers) +5 (finish)${snapshot.perfect ? " +20 (perfect)" : ""}</div></div>
      <div class="stat-card"><div class="title">Hearts left</div><div class="big">${
        snapshot.hearts
      } ❤️</div><div class="muted small">Out of ${BASE_DAILY_HEARTS}</div></div>
      <div class="stat-card"><div class="title">Streak</div><div class="big">${
        profile.streak || 0
      } 🔥</div><div class="muted small">Daily streak</div></div>
    </div>
    <div class="result-grid">${boxes}</div>
    <div class="row"><button id="home-share" class="chip">📣 Share</button></div>
  `;
  todayCard.classList.remove("hidden");
  $("#home-share")?.addEventListener("click", handleShare);
}

function enforceDailyLock() {
  const played = !DEV && daily.lastPlayed === todayUTCKey();
  if (played) {
    startRow?.classList.add("hidden");
    lockRow?.classList.remove("hidden");
    renderHomeTodayCard(daily.lastResults);
    tickCountdown();
  } else {
    lockRow?.classList.add("hidden");
    startRow?.classList.remove("hidden");
    renderHomeTodayCard(null);
  }
}

function renderHomeState() {
  enforceDailyLock();
  renderMiniCollection();
  renderCatStats();
  // ensure collection sits above stats
  placeCollectionAboveStats();
}

// --- Mobile reorder fallback: Collection above Stats ---
function reorderHomeCardsForMobile() {
  if (window.innerWidth > 600) return;

  const container =
    document.querySelector("#home-screen .container") ||
    document.querySelector("main .container");
  if (!container) return;

  const statsCard = document.querySelector("#cat-stats")?.closest(".card");
  const collCard = document.querySelector("#mini-collection")?.closest(".card");

  if (container && statsCard && collCard) {
    // If collection isn't already above stats, move it
    if (
      collCard.compareDocumentPosition(statsCard) &
      Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      container.insertBefore(collCard, statsCard);
    }
  }
}

window.addEventListener("resize", reorderHomeCardsForMobile);
document.addEventListener("DOMContentLoaded", reorderHomeCardsForMobile);
// also run after we draw the home UI
const _renderHomeState = renderHomeState;
renderHomeState = function () {
  _renderHomeState();
  reorderHomeCardsForMobile();
};

function tickCountdown() {
  function fmt(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  function step() {
    const ms = msUntilTomorrowUTC();
    if (countdownEl) countdownEl.textContent = fmt(ms);
    if (ms <= 0) {
      // unlock daily
      daily.lastPlayed = undefined;
      saveDaily(daily);

      // top-up hearts for new local day
      const currentLocal = new Date().toISOString().split("T")[0];
      if (
        profile.lastPlayLocal !== currentLocal ||
        (profile.hearts ?? 0) < BASE_DAILY_HEARTS
      ) {
        profile.hearts = Math.max(profile.hearts ?? 0, BASE_DAILY_HEARTS);
        profile.lastPlayLocal = currentLocal;
        saveProfile(profile);
        renderHUD();
      }

      enforceDailyLock();
      return;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- Stats by category (lifetime) ---------- */
function renderCatStats() {
  const grid = $("#cat-stats");
  if (!grid) return;
  grid.innerHTML = "";
  const data = CATS.map((cat) => {
    const st = profile.categoryStats?.[cat] || { correct: 0, total: 0 };
    const acc = st.total ? Math.round((st.correct / st.total) * 100) : 0;
    return { cat, st, acc, label: LABELS[cat] };
  }).sort((a, b) => b.st.total - a.st.total || b.acc - a.acc);

  data.forEach(({ st, acc, label }) => {
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
        <span>${st.total} attempts</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ---------- Stickers / collection ---------- */
function awardStickerIfNeeded() {
  if (session.rewardedToday) return null;
  session.rewardedToday = true;

  const idx = Math.floor(Math.random() * STICKER_COUNT) + 1;
  const src = `assets/stickers/sticker_${idx}.png`;

  if (!profile.inventory.includes(src)) {
    profile.inventory.push(src);
    saveProfile(profile);
  }
  if (rewardImg) rewardImg.src = src;
  if (rewardName)
    rewardName.textContent = "Perfect day! New sticker unlocked 🎉";
  return src;
}
function showRewardThenResults(snapshot) {
  const proceed = () => {
    rewardModal?.classList.add("hidden");
    openResultsModal(snapshot);
    cleanup();
  };
  const onBackdrop = (e) => {
    if (e.target === rewardModal) proceed();
  };
  const onEsc = (e) => {
    if (e.key === "Escape") proceed();
  };
  function cleanup() {
    closeReward?.removeEventListener("click", proceed);
    rewardModal?.removeEventListener("click", onBackdrop);
    document.removeEventListener("keydown", onEsc);
  }
  rewardModal?.classList.remove("hidden");
  closeReward?.addEventListener("click", proceed);
  rewardModal?.addEventListener("click", onBackdrop);
  document.addEventListener("keydown", onEsc);
}

function renderCollection() {
  if (!collectionGrid) return;
  collectionGrid.innerHTML = "";
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const slot = document.createElement("div");
    slot.className = "bag-slot";
    const src = profile.inventory[i];
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Sticker";
      slot.appendChild(img);
    } else {
      slot.classList.add("locked");
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

/* ---------- Buy life (header & popup) ---------- */
function ensureBuyLifeButton() {
  let btn = document.getElementById("buy-life");
  if (btn) return btn;
  const hud = document.querySelector(".hud");
  if (!hud) return null;
  btn = document.createElement("button");
  btn.id = "buy-life";
  btn.className = "chip";
  btn.textContent = "❤️ +1 (100 XP)";
  hud.appendChild(btn);
  return btn;
}

function buyLife() {
  const current = inRun()
    ? session.hearts
    : profile.hearts ?? BASE_DAILY_HEARTS;
  if (current >= MAX_HEARTS) {
    toast("Hearts are already full");
    return;
  }
  if ((profile.points || 0) < 100) {
    toast("Need 100 XP to buy a life");
    return;
  }

  profile.points -= 100;
  if (inRun()) {
    session.hearts = Math.min(session.hearts + 1, MAX_HEARTS);
    profile.hearts = Math.max(
      profile.hearts ?? BASE_DAILY_HEARTS,
      session.hearts
    );
  } else {
    profile.hearts = Math.min(
      (profile.hearts ?? BASE_DAILY_HEARTS) + 1,
      MAX_HEARTS
    );
  }
  saveProfile(profile);
  renderHUD();
  toast("❤️ +1 life purchased");
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
    if ((profile.points || 0) < 100) return toast("Need 100 XP");
    profile.points -= 100;
    session.hearts = Math.min((session.hearts || 0) + 1, MAX_HEARTS);
    profile.hearts = Math.max(
      profile.hearts ?? BASE_DAILY_HEARTS,
      session.hearts
    );
    saveProfile(profile);
    renderHUD();
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

/* ---------- Share ---------- */
function getShareSnapshot() {
  const today = todayUTCKey();
  if (daily.lastResults && daily.lastResults.date === today) {
    const r = daily.lastResults;
    return {
      correct: r.correctCount || 0,
      total: (r.results && r.results.length) || CATS.length,
      streak: profile.streak || 0,
      points: profile.points || 0,
    };
  }
  if (inRun() && session?.questions) {
    return {
      correct: session.correctCount || 0,
      total: session.questions.length || CATS.length,
      streak: profile.streak || 0,
      points: profile.points || 0,
    };
  }
  if (daily.lastResults) {
    const r = daily.lastResults;
    return {
      correct: r.correctCount || 0,
      total: (r.results && r.results.length) || CATS.length,
      streak: profile.streak || 0,
      points: profile.points || 0,
    };
  }
  return {
    correct: 0,
    total: CATS.length,
    streak: profile.streak || 0,
    points: profile.points || 0,
  };
}

async function handleShare() {
  const snap = getShareSnapshot();
  const text = `Daily Trivia — ${snap.correct}/${snap.total} correct!
🔥 Streak: ${snap.streak}
⭐ Total XP: ${snap.points}`;
  const url = location.origin + location.pathname;

  try {
    if (navigator.share) {
      await navigator.share({ title: "Daily Trivia", text, url });
      return;
    }
  } catch (_) {
    /* fallthrough */
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast("Copied to clipboard");
      return;
    }
  } catch (_) {
    /* fallthrough */
  }

  const ta = document.createElement("textarea");
  ta.value = `${text}\n${url}`;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
    toast("Copied to clipboard");
  } catch {
    alert(`${text}\n${url}`);
  } finally {
    document.body.removeChild(ta);
  }
}

/* ---------- Results modal ---------- */
function openResultsModal(snapshot) {
  if (!resultsModal || !snapshot) return;
  // if reward is visible, let the reward flow open results after
  if (!rewardModal?.classList.contains("hidden")) return;

  const total =
    snapshot.results?.length || session.questions?.length || CATS.length;
  mTotal.textContent = total;
  mCorrect.textContent = snapshot.correctCount || 0;
  mXP.textContent = snapshot.xpToday || 0;
  mStreak.textContent = `${profile.streak || 0} 🔥`;
  mHearts.textContent = `${snapshot.hearts ?? session.hearts} ❤️`;
  mPerfect.textContent = snapshot.perfect ? "Perfect! 🎯" : "";

  const base = (snapshot.correctCount || 0) * 10,
    finish = 5,
    bonus = snapshot.perfect ? 20 : 0;
  mXPBreak.textContent =
    `+${base} (answers) +${finish} (finish)` +
    (snapshot.perfect ? ` +${bonus} (perfect)` : "");

  mGrid.innerHTML = "";
  (snapshot.results || []).forEach((ok) => {
    const d = document.createElement("div");
    d.className = "box " + (ok ? "ok" : "bad");
    mGrid.appendChild(d);
  });

  resultsModal.classList.remove("hidden");
}
function closeResultsModal(goHome = true) {
  resultsModal?.classList.add("hidden");
  if (goHome) {
    switchScreen("home");
    renderHomeState();
  }
}

/* ---------- Toast ---------- */
function toast(msg, ms = 900) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

/* ---------- Events ---------- */
startBtn?.addEventListener("click", startRun);
backHomeBtn?.addEventListener("click", () => switchScreen("home"));
shareResultsBtn?.addEventListener("click", handleShare);
modalShareBtn?.addEventListener("click", handleShare);

const buyLifeBtn = ensureBuyLifeButton();
buyLifeBtn?.addEventListener("click", buyLife);

openCollection1?.addEventListener("click", () => {
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
closeCollection?.addEventListener("click", () =>
  collectionModal?.classList.add("hidden")
);

closeReward?.addEventListener("click", () =>
  rewardModal?.classList.add("hidden")
);
restartBtn?.addEventListener("click", () => {
  gameoverModal?.classList.add("hidden");
  switchScreen("home");
});

closeResults?.addEventListener("click", () => closeResultsModal(true));
resultsModal?.addEventListener("click", (e) => {
  if (e.target === resultsModal) closeResultsModal(true);
});
document.addEventListener("keydown", (e) => {
  if (!resultsModal?.classList.contains("hidden") && e.key === "Escape")
    closeResultsModal(true);
});

// --- Reorder: put Collection card above Stats on all devices ---
function placeCollectionAboveStats() {
  const statsCard = document.querySelector("#cat-stats")?.closest(".card");
  const collCard = document.querySelector("#mini-collection")?.closest(".card");
  if (!statsCard || !collCard) return;

  const container = statsCard.parentElement; // move collection into same parent as stats
  if (!container) return;

  // If collection isn’t already right above stats, insert it there
  if (collCard.nextElementSibling !== statsCard) {
    container.insertBefore(collCard, statsCard);
  }
}

/* ---------- Init ---------- */
renderHUD();
switchScreen("home");
renderHomeState();

/* Dev shortcut: Shift + D to replay today */
document.addEventListener("keydown", (e) => {
  if (!(DEV && e.shiftKey && e.key.toLowerCase() === "d")) return;
  localStorage.removeItem(DAILY_KEY);
  daily = loadDaily();
  session = newSession();
  renderHUD();
  renderHomeState();
  switchScreen("quiz");
  showCurrentQuestion();
  console.log("[DEV] Daily lock cleared and run started");
});
