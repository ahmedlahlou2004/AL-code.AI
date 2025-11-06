// src/firebase.js

// ✅ استيراد خدمات Firebase التي تحتاجها
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// ✅ إعدادات مشروعك من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyC4L-FirebaseKey_mCObAUk",
  authDomain: "ai-code-ai.firebaseapp.com",
  projectId: "ai-code-ai",
  storageBucket: "ai-code-ai.appspot.com",
  messagingSenderId: "FirebaseSenderID",
  appId: "1:FirebaseAppID:web:FirebaseWebID",
  measurementId: "G-FirebaseMeasurementID"
};

// ✅ تهيئة Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ دالة تسجيل الدخول باستخدام Google
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("✅ Logged in as:", user.displayName);
    return user;
  } catch (error) {
    console.error("❌ Login error:", error);
    return null;
  }
}

// ✅ دالة لحفظ الكود في Firestore
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
