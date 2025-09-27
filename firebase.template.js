// Firebase Configuration Template
// Copy this file to firebase.js and configure your Firebase settings

// For Mock Firebase (Development/Testing):
// Uncomment the following line to use the mock Firebase implementation
// export * from './firebase.mock.js';

// For Real Firebase (Production):
// Uncomment and configure the following Firebase setup

/*
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default { auth, db, storage };
*/

// Default to mock implementation for development
export * from './firebase.mock.js';