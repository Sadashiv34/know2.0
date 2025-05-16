// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDwGx2qJ90LFhu06lgWr_r6vv5Jx6JqxzE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pagepilot-y6ez7.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://pagepilot-y6ez7-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pagepilot-y6ez7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pagepilot-y6ez7.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "654134506434",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:654134506434:web:303611b2baa4b90e271c5b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Ensure collections exist by accessing them
const ensureCollectionsExist = async () => {
  try {
    // Access the collections to ensure they exist
    await getDocs(collection(db, 'rental_info'));
    await getDocs(collection(db, 'user_info'));
    console.log('Firebase collections initialized');
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
};

// Call the function to ensure collections exist
ensureCollectionsExist();

export { auth, db };
