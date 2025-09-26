import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBmpUAh_oFOvIt9O6-w0vbWSUmgNdVBYQ8",
  authDomain: "chatapp-fa9f1.firebaseapp.com",
  projectId: "chatapp-fa9f1",
  storageBucket: "chatapp-fa9f1.firebasestorage.app",
  messagingSenderId: "785903785985",
  appId: "1:785903785985:web:9ca96a40b4467d26168800",
  measurementId: "G-WDZN7Q0LHD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
