import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBU0LFsZfI1EecKUyHmPTM8v_OCDfhAOLk",
  authDomain: "al-code-ai.firebaseapp.com",
  projectId: "al-code-ai",
  storageBucket: "al-code-ai.appspot.com",
  messagingSenderId: "928389303589",
  appId: "1:928389303589:web:5c842702d8839a31815ecc",
  measurementId: "G-LPDDMV382Y"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ تسجيل الدخول باستخدام Google
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
