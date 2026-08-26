import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { googleProvider, facebookProvider } from '../firebase/authProviders';

/**
 * Translates Firebase technical errors into friendly, customer-facing copy
 */
export const formatFirebaseAuthError = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const code = error.code || '';
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Your password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed before completion.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in process was cancelled.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email using a different sign-in provider.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently being configured. Please use email or Google.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a few moments before trying again.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};

/**
 * Sign in with Google Popup
 */
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase credentials are not configured yet in .env.');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw new Error(formatFirebaseAuthError(error));
  }
};

/**
 * Sign in with Facebook Popup
 */
export const signInWithFacebook = async () => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase credentials are not configured yet in .env.');
  }
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  } catch (error) {
    throw new Error(formatFirebaseAuthError(error));
  }
};

/**
 * Register with Email and Password
 */
export const registerWithEmail = async (email, password, displayName = '') => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase credentials are not configured yet in .env.');
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  } catch (error) {
    throw new Error(formatFirebaseAuthError(error));
  }
};

/**
 * Sign in with Email and Password
 */
export const loginWithEmail = async (email, password) => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase credentials are not configured yet in .env.');
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw new Error(formatFirebaseAuthError(error));
  }
};

/**
 * Send Password Reset Email
 */
export const sendPasswordReset = async (email) => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase credentials are not configured yet in .env.');
  }
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw new Error(formatFirebaseAuthError(error));
  }
};

/**
 * Send Email Verification
 */
export const sendVerificationEmail = async (user) => {
  if (!user) return false;
  try {
    await sendEmailVerification(user);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
};

/**
 * Sign Out from Firebase
 */
export const logoutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase sign out error:', error);
  }
};
