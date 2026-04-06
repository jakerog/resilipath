import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, Functions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "resilipath-test",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

if (typeof window !== "undefined" || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);

  // Connect to Emulators if running locally and either:
  // 1. Explicitly requested via NEXT_PUBLIC_USE_EMULATORS=true
  // 2. No real API key is provided (default development mode)
  const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true' ||
                      (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'mock-api-key');

  if (process.env.NODE_ENV === 'development' && useEmulators) {
    try {
      // Connect to Auth Emulator (default port 9099)
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });

      // Connect to Firestore Emulator (default port 8080)
      connectFirestoreEmulator(db, '127.0.0.1', 8080);

      // Connect to Storage Emulator (default port 9199)
      connectStorageEmulator(storage, '127.0.0.1', 9199);

      // Connect to Functions Emulator (default port 5001)
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);

      console.log("🛠️  Connected to Local Firebase Emulators (Project: resilipath-test)");
      console.log("👉 Ensure you started them with: firebase emulators:start");
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn("⚠️  Firebase Emulators already initialized. This is expected during HMR.");
      } else {
        console.error("❌ Failed to connect to Firebase Emulators:", err);
      }
    }
  }
} else {
  // SSR / Build time placeholders
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
  functions = {} as Functions;
}

export { app, auth, db, storage, functions };
