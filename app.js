/* =========================================================
   Daily Trivia — full app.js (safe + data-preserving)
   (Fresh questions + non-repeating daily rotation)
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
const PUBLIC_SALT = "dt-v2"; // new seed to remix order
const MAX_HEARTS = 5; // cap with purchases
const BASE_DAILY_HEARTS = 3; // daily minimum top-up
const STICKER_COUNT = 18; // sticker_1..sticker_18
const TOTAL_SLOTS = 18; // bag capacity

/* Start of the new rotation cycle (UTC-based). Everyone sees the same pick. */
const ROTATION_START = "2025-08-22";

/* ---------- Question bank (10 / category, fresh) ---------- */
const BANK = [
  /* Animals */
  {
    category: "animals",
    q: "Which mammal has the thickest fur?",
    a: "Sea otter",
    distractors: ["Polar bear", "Beaver", "Walrus"],
  },
  {
    category: "animals",
    q: "What is a baby kangaroo called?",
    a: "Joey",
    distractors: ["Pup", "Cub", "Calf"],
  },
  {
    category: "animals",
    q: "Which bird has the largest wingspan?",
    a: "Wandering albatross",
    distractors: ["Andean condor", "Whooper swan", "Marabou stork"],
  },
  {
    category: "animals",
    q: "Which reptile can run on water short distances?",
    a: "Basilisk lizard",
    distractors: ["Iguana", "Komodo dragon", "Monitor lizard"],
  },
  {
    category: "animals",
    q: "Which animal has a blue tongue by default?",
    a: "Blue-tongued skink",
    distractors: ["Chameleon", "Gecko", "Anole"],
  },
  {
    category: "animals",
    q: "The largest species of ray is the…",
    a: "Giant oceanic manta ray",
    distractors: ["Devil ray", "Eagle ray", "Stingray"],
  },
  {
    category: "animals",
    q: "What is the only continent without native bears?",
    a: "Australia",
    distractors: ["Africa", "Europe", "South America"],
  },
  {
    category: "animals",
    q: "Which animal can rotate its head up to 270°?",
    a: "Owl",
    distractors: ["Falcon", "Vulture", "Heron"],
  },
  {
    category: "animals",
    q: "Which fish is famous for migrating upstream to spawn?",
    a: "Salmon",
    distractors: ["Tuna", "Sardine", "Mackerel"],
  },
  {
    category: "animals",
    q: "What is the largest species of deer?",
    a: "Moose",
    distractors: ["Red deer", "Elk", "Reindeer"],
  },

  /* Gaming */
  {
    category: "gaming",
    q: "In The Legend of Zelda: Breath of the Wild, what restores stamina instantly in cooking?",
    a: "Endura dishes",
    distractors: ["Hearty dishes", "Spicy dishes", "Chilly dishes"],
  },
  {
    category: "gaming",
    q: "In Dark Souls, what is used to strengthen Estus recovery?",
    a: "Fire Keeper Soul",
    distractors: ["Humanity", "Titanite Slab", "Prism Stone"],
  },
  {
    category: "gaming",
    q: "In Apex Legends, what is Wraith’s tactical ability called?",
    a: "Into the Void",
    distractors: ["Phase Breach", "Dimensional Rift", "Blink"],
  },
  {
    category: "gaming",
    q: "In Stardew Valley, who runs the general store?",
    a: "Pierre",
    distractors: ["Joja Manager Morris", "Gus", "Robin"],
  },
  {
    category: "gaming",
    q: "In Hollow Knight, geo is the game’s…",
    a: "Currency",
    distractors: ["Health", "Magic", "Crafting material"],
  },
  {
    category: "gaming",
    q: "In Pokémon, which item evolves Pikachu?",
    a: "Thunder Stone",
    distractors: ["Sun Stone", "Shiny Stone", "Dawn Stone"],
  },
  {
    category: "gaming",
    q: "In Rocket League, how many players per side in standard playlists?",
    a: "3",
    distractors: ["2", "4", "5"],
  },
  {
    category: "gaming",
    q: "In Fortnite, building uses which three materials?",
    a: "Wood, stone, metal",
    distractors: [
      "Wood, brick, steel",
      "Clay, brick, metal",
      "Wood, concrete, steel",
    ],
  },
  {
    category: "gaming",
    q: "In Portal 2, who is the personality core companion?",
    a: "Wheatley",
    distractors: ["Atlas", "P-body", "Nigel"],
  },
  {
    category: "gaming",
    q: "In Animal Crossing, what type of animal is Isabelle?",
    a: "Shih Tzu dog",
    distractors: ["Cat", "Rabbit", "Hedgehog"],
  },

  /* Marvel */
  {
    category: "marvel",
    q: "What is the name of Thor’s axe introduced in Infinity War?",
    a: "Stormbreaker",
    distractors: ["Jarnbjorn", "Thunderstrike", "Gungnir"],
  },
  {
    category: "marvel",
    q: "Which alien race does Ronan the Accuser belong to?",
    a: "Kree",
    distractors: ["Skrull", "Chitauri", "Xandarian"],
  },
  {
    category: "marvel",
    q: "What is the real name of the Black Widow?",
    a: "Natasha Romanoff",
    distractors: ["Yelena Belova", "Melina Vostokoff", "Sharon Carter"],
  },
  {
    category: "marvel",
    q: "Doctor Strange trained at…",
    a: "Kamar-Taj",
    distractors: ["Kun-Lun", "Attilan", "Wundagore"],
  },
  {
    category: "marvel",
    q: "Which Avenger can lift 100 tons due to gamma mutation?",
    a: "Hulk",
    distractors: ["Captain America", "Hawkeye", "War Machine"],
  },
  {
    category: "marvel",
    q: "The leader of the Eternals in the comics is often…",
    a: "Zuras",
    distractors: ["Ikaris", "Ajak", "Sersi"],
  },
  {
    category: "marvel",
    q: "What metal forms the claws of X‑23 in most continuities?",
    a: "Adamantium",
    distractors: ["Vibranium", "Carbonadium", "Uru"],
  },
  {
    category: "marvel",
    q: "Which character says, “I can do this all day”?",
    a: "Captain America",
    distractors: ["Spider‑Man", "Ant‑Man", "Star‑Lord"],
  },
  {
    category: "marvel",
    q: "Who is the ruler of Latveria?",
    a: "Doctor Doom",
    distractors: ["Namor", "Magneto", "Red Skull"],
  },
  {
    category: "marvel",
    q: "Which group is Rocket a member of?",
    a: "Guardians of the Galaxy",
    distractors: ["Avengers", "X‑Men", "Inhumans"],
  },

  /* LOTR */
  {
    category: "lotr",
    q: "What is the Elvish name for Rivendell?",
    a: "Imladris",
    distractors: ["Lothlórien", "Eregion", "Doriath"],
  },
  {
    category: "lotr",
    q: "What creature guards the gate of Moria in the lake?",
    a: "Watcher in the Water",
    distractors: ["Cave troll", "Balrog", "Were-worm"],
  },
  {
    category: "lotr",
    q: "Who is known as Strider in Bree?",
    a: "Aragorn",
    distractors: ["Boromir", "Faramir", "Halbarad"],
  },
  {
    category: "lotr",
    q: "Which city is also called Minas Anor?",
    a: "Minas Tirith",
    distractors: ["Osgiliath", "Minas Morgul", "Dol Amroth"],
  },
  {
    category: "lotr",
    q: "What food do the Elves give the Fellowship for the road?",
    a: "Lembas",
    distractors: ["Miruvor", "Cram", "Waybread"],
  },
  {
    category: "lotr",
    q: "Who is the Lady of Lothlórien?",
    a: "Galadriel",
    distractors: ["Arwen", "Éowyn", "Melian"],
  },
  {
    category: "lotr",
    q: "Which Ent carries Merry and Pippin?",
    a: "Treebeard",
    distractors: ["Quickbeam", "Beechbone", "Skinbark"],
  },
  {
    category: "lotr",
    q: "What is the Elvish word for Sun in Sindarin?",
    a: "Anor",
    distractors: ["Isil", "Calen", "Gwaith"],
  },
  {
    category: "lotr",
    q: "Who reforged Narsil into Andúril?",
    a: "Elves of Rivendell",
    distractors: ["Dwarves of Erebor", "Men of Gondor", "Elves of Lórien"],
  },
  {
    category: "lotr",
    q: "What is the Black Speech inscription on the One Ring about?",
    a: "Dominion over the other Rings",
    distractors: [
      "A curse on Sauron",
      "A map to Mordor",
      "The lineage of Isildur",
    ],
  },

  /* Cars */
  {
    category: "cars",
    q: "What does SUV stand for?",
    a: "Sport Utility Vehicle",
    distractors: [
      "Street Utility Vehicle",
      "Sports Urban Vehicle",
      "Special Utility Van",
    ],
  },
  {
    category: "cars",
    q: "Which company produces the Civic Type R?",
    a: "Honda",
    distractors: ["Toyota", "Mazda", "Nissan"],
  },
  {
    category: "cars",
    q: "What component mixes fuel and air in older engines?",
    a: "Carburetor",
    distractors: ["Catalytic converter", "Radiator", "Differential"],
  },
  {
    category: "cars",
    q: "Which country is home to the Nürburgring Nordschleife?",
    a: "Germany",
    distractors: ["Italy", "UK", "France"],
  },
  {
    category: "cars",
    q: "What drivetrain sends power only to the rear wheels?",
    a: "RWD",
    distractors: ["FWD", "AWD", "4WD Auto"],
  },
  {
    category: "cars",
    q: "Which brand makes the Supra (A90/A91)?",
    a: "Toyota",
    distractors: ["Subaru", "Lexus", "Mitsubishi"],
  },
  {
    category: "cars",
    q: "Turbo lag refers to a delay in…",
    a: "Boost response",
    distractors: ["Steering response", "Brake pressure", "Fuel delivery"],
  },
  {
    category: "cars",
    q: "What is the typical voltage of a modern car battery?",
    a: "12V",
    distractors: ["6V", "24V", "48V"],
  },
  {
    category: "cars",
    q: "What does ECU stand for?",
    a: "Engine Control Unit",
    distractors: [
      "Electronic Coolant Unit",
      "Exhaust Control Unit",
      "Engine Calibration Utility",
    ],
  },
  {
    category: "cars",
    q: "Which safety tech helps prevent wheel lock during braking?",
    a: "ABS",
    distractors: ["EBD", "ESC", "TCS"],
  },

  /* Harry Potter */
  {
    category: "hp",
    q: "What position does Harry play in Quidditch?",
    a: "Seeker",
    distractors: ["Chaser", "Keeper", "Beater"],
  },
  {
    category: "hp",
    q: "What is the name of the Weasley family home?",
    a: "The Burrow",
    distractors: ["Shell Cottage", "Ottery St Catchpole", "Grimmauld Place"],
  },
  {
    category: "hp",
    q: "What creature pulls the Hogwarts carriages?",
    a: "Thestrals",
    distractors: ["Hippogriffs", "Centaurs", "Abraxans"],
  },
  {
    category: "hp",
    q: "What form does Hermione’s Patronus take?",
    a: "Otter",
    distractors: ["Cat", "Swan", "Hare"],
  },
  {
    category: "hp",
    q: "What is the name of the map that shows people at Hogwarts?",
    a: "Marauder’s Map",
    distractors: ["Foe‑Glass", "Seer’s Map", "Hogwarts Atlas"],
  },
  {
    category: "hp",
    q: "What vault number held the Philosopher’s Stone at Gringotts?",
    a: "713",
    distractors: ["394", "687", "217"],
  },
  {
    category: "hp",
    q: "What is the spell to open locked doors?",
    a: "Alohomora",
    distractors: ["Colloportus", "Finite", "Depulso"],
  },
  {
    category: "hp",
    q: "What is the wizarding prison called?",
    a: "Azkaban",
    distractors: ["Nurmengard", "Ilvermorny", "Gringotts"],
  },
  {
    category: "hp",
    q: "Who is the Half‑Giant gamekeeper at Hogwarts?",
    a: "Rubeus Hagrid",
    distractors: ["Argus Filch", "Severus Snape", "Horace Slughorn"],
  },
  {
    category: "hp",
    q: "What is Draco Malfoy’s signature sport at Hogwarts?",
    a: "Quidditch (Seeker)",
    distractors: ["Gobstones", "Wizard Chess", "Exploding Snap"],
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

/* ---------- Non-repeating daily rotation (UTC, global) ---------- */
function daysSince(startYMD = ROTATION_START) {
  const now = new Date();
  const todayUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const [y, m, d] = startYMD.split("-").map(Number);
  const startUTC = Date.UTC(y, m - 1, d);
  return Math.max(0, Math.floor((todayUTC - startUTC) / 86400000));
}
function nonRepeatingIndex(cat, poolLen) {
  if (poolLen <= 0) return 0;
  const startOffset = hashStr(`${PUBLIC_SALT}|${cat}`) % poolLen; // stable per category
  const day = daysSince(); // advances each day
  return (startOffset + day) % poolLen; // full cycle before repeat
}

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
  return CATS.map((cat) => {
    const pool = BANK.filter((q) => q.category === cat);
    if (!pool.length) return null;
    const idx = nonRepeatingIndex(cat, pool.length);
    return pool[idx];
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
const modalShareBtn = $("#modal-share");
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
