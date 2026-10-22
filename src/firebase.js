
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBORMxJF9gcgrRBpNQq2uIGoLJN2rYN4Zk",
  authDomain: "cake-corner-bff88.firebaseapp.com",
  projectId: "cake-corner-bff88",
  storageBucket: "cake-corner-bff88.firebasestorage.app",
  messagingSenderId: "387304752314",
  appId: "1:387304752314:web:d77c937f656fad0271ae83"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
