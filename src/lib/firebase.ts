// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2FqdJW4AmxyNTh3eDPUU1Y7BezZRfk_c",
  authDomain: "terminalpunk.firebaseapp.com",
  projectId: "terminalpunk",
  storageBucket: "terminalpunk.firebasestorage.app",
  messagingSenderId: "592190541269",
  appId: "1:592190541269:web:8500e5151f0acbd7fe415c",
  measurementId: "G-TNEKXFPTEN"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, analytics };
