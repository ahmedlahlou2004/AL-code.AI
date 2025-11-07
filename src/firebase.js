// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup // ✅ استخدمنا pop-up بدل redirect
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc
} from "firebase/firestore";

// ✅ إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC4L-FirebaseKey_mCObAUk",
  authDomain: "ai-code-ai.firebaseapp.com",
  projectId: "ai-code-ai",
  storageBucket: "ai-code-ai.appspot.com",
  messagingSenderId: "FirebaseSenderID",
  appId: "1:FirebaseAppID:web:FirebaseWebID",
  measurementId: "G-FirebaseMeasurementID"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ تسجيل الدخول باستخدام Google (Popup)
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("✅ Logged in:", result.user);
  } catch (error) {
    console.error("❌ Login error:", error.code, error.message);
  }
}

// ✅ حفظ الكود في Firestore
export async function saveCode(code) {
  try {
    await addDoc(collection(db, "codes"), {
      content: code,
      timestamp: Date.now()
    });
    console.log("✅ Code saved to Firestore");
  } catch (error) {
    console.error("❌ Error saving code:", error);
  }
}
