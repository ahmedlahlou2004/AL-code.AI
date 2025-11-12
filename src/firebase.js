import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBU0LFsZfI1EecKUyHmPTM8v_OCDfhAOLk",
  authDomain: "al-code-ai.firebaseapp.com",
  projectId: "al-code-ai",
  storageBucket: "al-code-ai.appspot.com", // ✅ مصحّح
  messagingSenderId: "928389303589",
  appId: "1:928389303589:web:5c842702d8839a31815ecc",
  measurementId: "G-LPDDMV382Y"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
