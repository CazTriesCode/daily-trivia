// firebase-init.js (CDN ESM; works from plain file server)
import {
  initializeApp,
  getApps,
  getApp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- Your project config (fixed storageBucket) ---
const firebaseConfig = {
  apiKey: "AIzaSyAnJGILXv2xqTwxpssNanbUz_VwUlCi4jw",
  authDomain: "gains4brains.firebaseapp.com",
  projectId: "gains4brains",
  storageBucket: "gains4brains.appspot.com", // ← important
  messagingSenderId: "694045624039",
  appId: "1:694045624039:web:dfcccded8d34bab0aa0442",
};

// Guard against double include (HMR/refresh)
if (!window.__TRIVIA_FB_INIT__) {
  window.__TRIVIA_FB_INIT__ = true;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Set persistence to LOCAL (user stays logged in across browser sessions)
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("[auth] persistence error:", error);
  });

  // Expose the exact API that app.js expects
  window.FB = {
    app,
    auth,
    db,
    // auth - anonymous
    signInAnonymously,
    onAuthStateChanged,
    // auth - email/password
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updateEmail,
    // firestore
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    serverTimestamp,
    // extras for leaderboard
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
  };

  // Note: We no longer auto sign-in anonymously
  // The app will handle authentication via email/password
}
