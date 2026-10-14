import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBKpOZWcgHS8YOr6KxtAWzMK2NZj8OWa0k",
  authDomain: "kaza-namazlari-89163.firebaseapp.com",
  projectId: "kaza-namazlari-89163",
  storageBucket: "kaza-namazlari-89163.firebasestorage.app",
  messagingSenderId: "225706673985",
  appId: "1:225706673985:web:a41ca138110b8e2cb703c0"
};

// Initialize Firebase (SSR ve Next.js re-render güvenli)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
