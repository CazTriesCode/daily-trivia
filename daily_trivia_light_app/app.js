// ==== Firebase Imports ====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ==== Firebase Config ====
const firebaseConfig = {
  apiKey: "AIzaSyAvE8P0YQWe9biqsNmqtF_JEFGp0ii76SY",
  authDomain: "daily-trivia-556d2.firebaseapp.com",
  projectId: "daily-trivia-556d2",
  storageBucket: "daily-trivia-556d2.firebasestorage.app",
  messagingSenderId: "230120612834",
  appId: "1:230120612834:web:f250262629ec473576cfbb",
  measurementId: "G-GSSSDQ54F7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
signInAnonymously(auth).catch(console.error);
onAuthStateChanged(auth, (user) => {
  if (user) currentUser = user;
});

// ==== Question Bank ====
const questions = [
  {
    category: "Animals",
    question: "Which mammal is known to have the most powerful bite?",
    answer: "Hippopotamus",
  },
  {
    category: "Gaming",
    question: "In OSRS, what skill is trained by chopping down trees?",
    answer: "Woodcutting",
  },
  {
    category: "Marvel",
    question: "What is the name of Thor’s hammer?",
    answer: "Mjolnir",
  },
  {
    category: "Lord of the Rings (Movies)",
    question: "Who destroys the One Ring?",
    answer: "Frodo and Gollum",
  },
  {
    category: "Cars",
    question: "Which car manufacturer produces the Mustang?",
    answer: "Ford",
  },
];

// ==== Helpers ====
function todayKey() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function pickQuestion() {
  const index = new Date().getDate() % questions.length;
  return questions[index];
}

function renderQuestion(q) {
  document.getElementById("badgeDate").textContent = todayKey();
  document.getElementById("themeChip").textContent = q.category;
  document.getElementById("question").textContent = q.question;

  const choices = [q.answer, "Option A", "Option B", "Option C"].sort(
    () => Math.random() - 0.5
  );
  const container = document.getElementById("choices");
  container.innerHTML = "";
  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.onclick = () => handleAnswer(choice, q);
    container.appendChild(btn);
  });
}

async function handleAnswer(choice, q) {
  const buttons = document.querySelectorAll(".choice-btn");
  buttons.forEach((b) => {
    b.disabled = true;
    if (b.textContent === q.answer) b.classList.add("correct");
    else if (b.textContent === choice) b.classList.add("wrong");
  });

  document.getElementById("fact").textContent =
    choice === q.answer ? "✔ Correct!" : `✖ The answer was ${q.answer}`;

  if (currentUser) {
    await addDoc(collection(db, "dailyResults"), {
      uid: currentUser.uid,
      date: todayKey(),
      category: q.category,
      question: q.question,
      choice,
      correct: choice === q.answer,
      correctAnswer: q.answer,
      ts: serverTimestamp(),
    });
  }
}

// ==== Init ====
const todayQ = pickQuestion();
renderQuestion(todayQ);
