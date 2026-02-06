// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  query,
  where,
  updateDoc,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4TZ52zcq06rFrO8d9_uSFNVMD6rl6V7M",
  authDomain: "finance-tracker-b898c.firebaseapp.com",
  projectId: "finance-tracker-b898c",
  storageBucket: "finance-tracker-b898c.firebasestorage.app",
  messagingSenderId: "20792318730",
  appId: "1:20792318730:web:62bf26e4a7ad6c63fa38f3",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const peopleCol = collection(db, "people");
export const transCol = collection(db, "transactions");

export {
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
  writeBatch,
};
