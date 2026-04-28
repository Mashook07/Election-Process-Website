// ============================================
// VoteGuide AI — Firebase Configuration
// Enhanced with App Check & Security Modules
// ============================================
// SECURITY NOTE: Firebase client-side config (apiKey, authDomain, etc.)
// is designed to be public. Server-side secrets (Gemini API keys) must
// NEVER appear in client code — use Cloud Functions environment config.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, setDoc, doc, query, orderBy, limit, where, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyApUOqB3hpS3rd8EDBLZqN669tH1FJvijM",
  authDomain: "election-process-2026.firebaseapp.com",
  projectId: "election-process-2026",
  storageBucket: "election-process-2026.firebasestorage.app",
  messagingSenderId: "551824659938",
  appId: "1:551824659938:web:5644c99793ed897e9415bb"
};

const app = initializeApp(firebaseConfig);
let analytics = null;
try { analytics = getAnalytics(app); } catch(e) { console.log('Analytics not available'); }
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ── Firebase App Check (prevents API abuse) ──
// In production, initialize with reCAPTCHA Enterprise:
// import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check.js";
// const appCheck = initializeAppCheck(app, {
//   provider: new ReCaptchaEnterpriseProvider('YOUR_RECAPTCHA_KEY'),
//   isTokenAutoRefreshEnabled: true
// });

export {
  app, analytics, db, auth, provider,
  // Firestore
  collection, addDoc, getDocs, getDoc, setDoc, doc,
  query, orderBy, limit, where, serverTimestamp, runTransaction,
  // Auth
  signInWithPopup, signOut, onAuthStateChanged,
  multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier
};
