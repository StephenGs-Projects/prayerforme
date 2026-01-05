import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  deleteUser as firebaseDeleteUser,
} from 'firebase/auth';
import { auth } from './config';

// Email/Password Authentication
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Send email verification
    await sendEmailVerification(userCredential.user);

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// OAuth Providers
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithApple = async () => {
  try {
    const provider = new OAuthProvider('apple.com');
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign Out
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Password Reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Profile Updates
export const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await updateProfile(user, updates);
    return user;
  } catch (error) {
    throw error;
  }
};

export const updateUserEmail = async (newEmail) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await updateEmail(user, newEmail);
    return user;
  } catch (error) {
    throw error;
  }
};

export const updateUserPassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await updatePassword(user, newPassword);
  } catch (error) {
    throw error;
  }
};

// Email Verification
export const sendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await sendEmailVerification(user);
  } catch (error) {
    throw error;
  }
};

// Delete Account
export const deleteUserAccount = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await firebaseDeleteUser(user);
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
