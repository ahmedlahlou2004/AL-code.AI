// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

// ✅ تسجيل الدخول باستخدام Google (Redirect)
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithRedirect(auth, provider);
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
