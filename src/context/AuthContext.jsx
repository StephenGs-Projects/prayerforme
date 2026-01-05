import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
  logOut,
  resetPassword,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  sendVerificationEmail,
  deleteUserAccount,
} from '../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('free'); // 'free' or 'premium'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user role from Firestore
  const fetchUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role || 'free';
        setUserRole(role);
        return role;
      }
      return 'free';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'free';
    }
  };

  // Create user document in Firestore on signup
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = new Date().toISOString();

      try {
        await setDoc(userRef, {
          email,
          displayName: displayName || '',
          photoURL: photoURL || '',
          role: 'free',
          preferences: {
            theme: 'system',
            fontSize: 1,
          },
          createdAt,
          ...additionalData,
        });
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch user role
        await fetchUserRole(user.uid);
        // Ensure user document exists
        await createUserDocument(user);
      } else {
        setUserRole('free');
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up with email
  const signup = async (email, password, firstName, lastName) => {
    try {
      setError(null);
      const displayName = `${firstName} ${lastName}`.trim();
      const user = await signUpWithEmail(email, password, displayName);
      await createUserDocument(user, { firstName, lastName });
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with email
  const signin = async (email, password) => {
    try {
      setError(null);
      const user = await signInWithEmail(email, password);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const signinWithGoogle = async () => {
    try {
      setError(null);
      const user = await signInWithGoogle();
      await createUserDocument(user);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Facebook
  const signinWithFacebook = async () => {
    try {
      setError(null);
      const user = await signInWithFacebook();
      await createUserDocument(user);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Apple
  const signinWithApple = async () => {
    try {
      setError(null);
      const user = await signInWithApple();
      await createUserDocument(user);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await logOut();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      setError(null);
      await updateUserProfile(updates);

      // Update Firestore document
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, updates, { merge: true });
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update email
  const changeEmail = async (newEmail) => {
    try {
      setError(null);
      await updateUserEmail(newEmail);

      // Update Firestore document
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { email: newEmail }, { merge: true });
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update password
  const changePassword = async (newPassword) => {
    try {
      setError(null);
      await updateUserPassword(newPassword);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const forgotPassword = async (email) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Send verification email
  const verifyEmail = async () => {
    try {
      setError(null);
      await sendVerificationEmail();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      setError(null);
      // Delete user document from Firestore
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { deleted: true, deletedAt: new Date().toISOString() }, { merge: true });
      }
      await deleteUserAccount();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    error,
    signup,
    signin,
    signinWithGoogle,
    signinWithFacebook,
    signinWithApple,
    logout,
    updateProfile,
    changeEmail,
    changePassword,
    forgotPassword,
    verifyEmail,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
