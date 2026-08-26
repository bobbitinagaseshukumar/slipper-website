import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Read Firebase configuration from Vite environment variables with project defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAaAUFGpvCewaUFFS2k0imf5M2AcWl6eoI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'footvaultpdtr.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'footvaultpdtr',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'footvaultpdtr.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '828642405344',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:828642405344:web:e945e5b188a2a42f099985',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-74E0FY2C3J',
};

// Check if Firebase is configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId
);

// Initialize Firebase App safely (singleton pattern)
let app = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (err) {
    console.warn('Firebase initialization skipped or failed:', err);
  }
}

export { auth };
export default app;
