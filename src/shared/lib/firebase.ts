import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 1. Idinagdag ito

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Helpful logs to debug env issues in development
if (!firebaseConfig.apiKey) {
  console.warn(
    "[Firebase] VITE_FIREBASE_API_KEY is missing. Check your .env file and restart npm run dev."
  );
}

let app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let authInstance;
let googleProviderInstance;
let dbInstance;
let storageInstance; // 2. Idinagdag ito

try {
  authInstance = getAuth(app);
  googleProviderInstance = new GoogleAuthProvider();
  dbInstance = getFirestore(app);
  storageInstance = getStorage(app); // 3. Initialize storage
} catch (error) {
  console.error("[Firebase] Failed to initialize services:", error);
  authInstance = undefined;
  googleProviderInstance = undefined;
  dbInstance = undefined;
  storageInstance = undefined;
}

export const auth = authInstance;
export const googleProvider = googleProviderInstance;
export const db = dbInstance;
export const storage = storageInstance; // 4. I-export ang storage