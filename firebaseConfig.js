import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAYXRQLsIQG6fsFFExKyniysDpa8eyeVeA",
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
