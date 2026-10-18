import { initializeApp } from "firebase/app";
import { indexedDBLocalPersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { environment } from "../environments/environment.js";

const app = initializeApp(environment.firebaseConfig);

// initializeAuth (instead of getAuth) so that login also works in the native Capacitor app
export const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence,
});

export const db = getFirestore(app);
