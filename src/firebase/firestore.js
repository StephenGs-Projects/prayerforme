import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';

// ==================== DAILY CONTENT ====================

/**
 * Get daily content (prayer, verse, devotional) for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Daily content object or null
 */
export const getDailyContent = async (date) => {
  try {
    const docRef = doc(db, 'dailyContent', date);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting daily content:', error);
    throw error;
  }
};

/**
 * Get the most recent daily content
 * @returns {Promise<Object|null>} Most recent daily content
 */
export const getLatestDailyContent = async () => {
  try {
    const q = query(
      collection(db, 'dailyContent'),
      where('published', '==', true),
      orderBy('date', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting latest daily content:', error);
    throw error;
  }
};

/**
 * Create or update daily content (Admin only)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {Object} content - Content object
 * @returns {Promise<void>}
 */
export const saveDailyContent = async (date, content) => {
  try {
    const docRef = doc(db, 'dailyContent', date);
    await setDoc(docRef, {
      ...content,
      date,
      published: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving daily content:', error);
    throw error;
  }
};

/**
 * Get all daily content entries (Admin only)
 * @returns {Promise<Array>} Array of daily content objects
 */
export const getAllDailyContent = async () => {
  try {
    const q = query(
      collection(db, 'dailyContent'),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all daily content:', error);
    throw error;
  }
};

// ==================== JOURNAL ENTRIES ====================

/**
 * Save a journal entry for a user
 * @param {string} userId - User ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {Object} entry - Journal entry data
 * @returns {Promise<void>}
 */
export const saveJournalEntry = async (userId, date, entry) => {
  try {
    const docRef = doc(db, 'users', userId, 'journalEntries', date);
    await setDoc(docRef, {
      ...entry,
      date,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};

/**
 * Get a specific journal entry
 * @param {string} userId - User ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Journal entry or null
 */
export const getJournalEntry = async (userId, date) => {
  try {
    const docRef = doc(db, 'users', userId, 'journalEntries', date);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting journal entry:', error);
    throw error;
  }
};

/**
 * Get all journal entries for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of journal entries
 */
export const getUserJournalEntries = async (userId) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'journalEntries'),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting journal entries:', error);
    throw error;
  }
};

// ==================== PRAYER REQUESTS ====================

/**
 * Get all prayer requests
 * @returns {Promise<Array>} Array of prayer requests
 */
export const getPrayerRequests = async () => {
  try {
    const q = query(
      collection(db, 'prayerRequests'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting prayer requests:', error);
    throw error;
  }
};

/**
 * Subscribe to prayer requests (real-time)
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToPrayerRequests = (callback) => {
  const q = query(
    collection(db, 'prayerRequests'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(requests);
  });
};

/**
 * Create a new prayer request
 * @param {Object} request - Prayer request data
 * @returns {Promise<string>} Document ID
 */
export const createPrayerRequest = async (request) => {
  try {
    const docRef = await addDoc(collection(db, 'prayerRequests'), {
      ...request,
      prayedCount: 0,
      commentCount: 0,
      status: 'approved', // Auto-approve for now, can add moderation later
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating prayer request:', error);
    throw error;
  }
};

/**
 * Get a specific prayer request
 * @param {string} requestId - Request ID
 * @returns {Promise<Object|null>} Prayer request or null
 */
export const getPrayerRequest = async (requestId) => {
  try {
    const docRef = doc(db, 'prayerRequests', requestId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting prayer request:', error);
    throw error;
  }
};

/**
 * Increment prayer count
 * @param {string} requestId - Request ID
 * @returns {Promise<void>}
 */
export const incrementPrayerCount = async (requestId) => {
  try {
    const docRef = doc(db, 'prayerRequests', requestId);
    await updateDoc(docRef, {
      prayedCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing prayer count:', error);
    throw error;
  }
};

/**
 * Decrement prayer count
 * @param {string} requestId - Request ID
 * @returns {Promise<void>}
 */
export const decrementPrayerCount = async (requestId) => {
  try {
    const docRef = doc(db, 'prayerRequests', requestId);
    await updateDoc(docRef, {
      prayedCount: increment(-1)
    });
  } catch (error) {
    console.error('Error decrementing prayer count:', error);
    throw error;
  }
};

/**
 * Track user prayer interaction
 * @param {string} requestId - Request ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const trackPrayerInteraction = async (requestId, userId) => {
  try {
    const docRef = doc(db, 'prayerRequests', requestId, 'prayedBy', userId);
    await setDoc(docRef, {
      prayedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error tracking prayer interaction:', error);
    throw error;
  }
};

/**
 * Remove user prayer interaction
 * @param {string} requestId - Request ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const removePrayerInteraction = async (requestId, userId) => {
  try {
    const docRef = doc(db, 'prayerRequests', requestId, 'prayedBy', userId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error removing prayer interaction:', error);
    throw error;
  }
};

/**
 * Check if user has prayed for a request
 * @param {string} requestId - Request ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const hasUserPrayed = async (requestId, userId) => {
  try {
    const docRef = doc(db, 'prayerRequests', requestId, 'prayedBy', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking prayer interaction:', error);
    return false;
  }
};

// ==================== COMMENTS ====================

/**
 * Get comments for a prayer request
 * @param {string} requestId - Request ID
 * @returns {Promise<Array>} Array of comments
 */
export const getComments = async (requestId) => {
  try {
    const q = query(
      collection(db, 'prayerRequests', requestId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

/**
 * Add a comment to a prayer request
 * @param {string} requestId - Request ID
 * @param {Object} comment - Comment data
 * @returns {Promise<string>} Comment ID
 */
export const addComment = async (requestId, comment) => {
  try {
    const docRef = await addDoc(
      collection(db, 'prayerRequests', requestId, 'comments'),
      {
        ...comment,
        createdAt: serverTimestamp()
      }
    );

    // Increment comment count on the prayer request
    const requestRef = doc(db, 'prayerRequests', requestId);
    await updateDoc(requestRef, {
      commentCount: increment(1)
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// ==================== USER PRAYER REQUESTS ====================

/**
 * Get prayer requests created by a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user's prayer requests
 */
export const getUserPrayerRequests = async (userId) => {
  try {
    const q = query(
      collection(db, 'prayerRequests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user prayer requests:', error);
    throw error;
  }
};

// ==================== FLAGGED CONTENT ====================

/**
 * Flag a prayer request
 * @param {string} requestId - Request ID
 * @param {string} reporterUid - Reporter's user ID
 * @param {string} reason - Reason for flagging
 * @returns {Promise<void>}
 */
export const flagPrayerRequest = async (requestId, reporterUid, reason) => {
  try {
    const request = await getPrayerRequest(requestId);

    await addDoc(collection(db, 'flaggedRequests'), {
      originalRequestId: requestId,
      content: request.content,
      reporterUid,
      reason,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    // Update original request status
    const requestRef = doc(db, 'prayerRequests', requestId);
    await updateDoc(requestRef, {
      status: 'flagged'
    });
  } catch (error) {
    console.error('Error flagging prayer request:', error);
    throw error;
  }
};

/**
 * Get all flagged requests (Admin only)
 * @returns {Promise<Array>} Array of flagged requests
 */
export const getFlaggedRequests = async () => {
  try {
    const q = query(
      collection(db, 'flaggedRequests'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting flagged requests:', error);
    throw error;
  }
};

/**
 * Approve a flagged request (Admin only)
 * @param {string} flaggedId - Flagged request ID
 * @param {string} originalRequestId - Original request ID
 * @returns {Promise<void>}
 */
export const approveFlaggedRequest = async (flaggedId, originalRequestId) => {
  try {
    // Update flagged request status
    const flaggedRef = doc(db, 'flaggedRequests', flaggedId);
    await updateDoc(flaggedRef, {
      status: 'approved'
    });

    // Restore original request
    const requestRef = doc(db, 'prayerRequests', originalRequestId);
    await updateDoc(requestRef, {
      status: 'approved'
    });
  } catch (error) {
    console.error('Error approving flagged request:', error);
    throw error;
  }
};

/**
 * Reject/delete a flagged request (Admin only)
 * @param {string} flaggedId - Flagged request ID
 * @param {string} originalRequestId - Original request ID
 * @returns {Promise<void>}
 */
export const rejectFlaggedRequest = async (flaggedId, originalRequestId) => {
  try {
    // Delete flagged request
    const flaggedRef = doc(db, 'flaggedRequests', flaggedId);
    await deleteDoc(flaggedRef);

    // Delete original request
    const requestRef = doc(db, 'prayerRequests', originalRequestId);
    await deleteDoc(requestRef);
  } catch (error) {
    console.error('Error rejecting flagged request:', error);
    throw error;
  }
};

export default {
  // Daily Content
  getDailyContent,
  getLatestDailyContent,
  saveDailyContent,

  // Journal
  saveJournalEntry,
  getJournalEntry,
  getUserJournalEntries,

  // Prayer Requests
  getPrayerRequests,
  subscribeToPrayerRequests,
  createPrayerRequest,
  getPrayerRequest,
  incrementPrayerCount,
  decrementPrayerCount,
  trackPrayerInteraction,
  removePrayerInteraction,
  hasUserPrayed,

  // Comments
  getComments,
  addComment,

  // User Requests
  getUserPrayerRequests,

  // Flagged Content
  flagPrayerRequest,
  getFlaggedRequests,
  approveFlaggedRequest,
  rejectFlaggedRequest,
};
