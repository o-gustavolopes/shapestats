import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AQ.Ab8RN6Kti3esSmFaBUpdh94gUeAQ7w24Pkb9KZ-kld1Ir2wvFA",
  authDomain: "shapestats.firebaseapp.com",
  projectId: "shapestats",
  storageBucket: "shapestats.firebasestorage.app",
  messagingSenderId: "480689434073",
  appId: "1:480689434073:web:ae1d65756f63294bc03dc8",
  measurementId: "G-7504HLK9ZV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
