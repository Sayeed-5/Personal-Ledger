// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore, collection, doc,
  addDoc, getDocs, onSnapshot,
  deleteDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_APIKEY",
  authDomain: "YOUR_AUTHDOMAIN",
  projectId: "YOUR_PROJECTID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Collections
export const peopleCol = collection(db, "people");
export const transCol = collection(db, "transactions");
export { addDoc, getDocs, onSnapshot, deleteDoc, doc, query, where };



<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA4TZ52zcq06rFrO8d9_uSFNVMD6rl6V7M",
    authDomain: "finance-tracker-b898c.firebaseapp.com",
    projectId: "finance-tracker-b898c",
    storageBucket: "finance-tracker-b898c.firebasestorage.app",
    messagingSenderId: "20792318730",
    appId: "1:20792318730:web:62bf26e4a7ad6c63fa38f3"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script>