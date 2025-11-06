// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBU0LFsZfI1EecKUyHmPTM8v_OCDfhAOLk",
  authDomain: "al-code-ai.firebaseapp.com",
  projectId: "al-code-ai",
  storageBucket: "al-code-ai.firebasestorage.app",
  messagingSenderId: "928389303589",
  appId: "1:928389303589:web:492a9b60f8f2f784815ecc",
  measurementId: "G-C1Z6VXPVGF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
