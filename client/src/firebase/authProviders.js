import {
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';

// Google OAuth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Facebook OAuth Provider setup
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  display: 'popup',
});
