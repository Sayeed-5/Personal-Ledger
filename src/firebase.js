// Firebase configuration — modular SDK (v9+)
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4TZ52zcq06rFrO8d9_uSFNVMD6rl6V7M",
  authDomain: "finance-tracker-b898c.firebaseapp.com",
  projectId: "finance-tracker-b898c",
  storageBucket: "finance-tracker-b898c.firebasestorage.app",
  messagingSenderId: "20792318730",
  appId: "1:20792318730:web:62bf26e4a7ad6c63fa38f3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google provider — configured once, reused across auth functions
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
