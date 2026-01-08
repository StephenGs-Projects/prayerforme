import {
  collection,
  collectionGroup,
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
      const data = docSnap.data();
      // Only return if published (supports both old 'published' field and new 'status' field)
      if (data.published === true || data.status === 'published') {
        return { id: docSnap.id, ...data };
      }
    }
    return null;
  } catch (error) {
    // If permission is denied (e.g. guest trying to read a draft), 
    // treat it as "not found" so the app can fall back to the latest published content.
    if (error.code === 'permission-denied') {
      return null;
    }
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
    // Try to get content using the new 'status' field first
    let q = query(
      collection(db, 'dailyContent'),
      where('status', '==', 'published'),
      orderBy('date', 'desc'),
      limit(1)
    );
    let querySnapshot = await getDocs(q);

    // If no results, fall back to old 'published' field
    if (querySnapshot.empty) {
      q = query(
        collection(db, 'dailyContent'),
        where('published', '==', true),
        orderBy('date', 'desc'),
        limit(1)
      );
      querySnapshot = await getDocs(q);
    }

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

/**
 * Save daily content with scheduling support (Admin only)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {Object} content - Content object
 * @param {string} status - 'draft' | 'scheduled' | 'published'
 * @param {Date} publishDate - Optional scheduled publish date
 * @returns {Promise<void>}
 */
export const saveDailyContentWithSchedule = async (date, content, status = 'published', publishDate = null) => {
  try {
    const docRef = doc(db, 'dailyContent', date);
    const dataToSave = {
      ...content,
      date,
      status,
      updatedAt: serverTimestamp(),
    };

    // Add createdAt if this is a new document
    const existingDoc = await getDoc(docRef);
    if (!existingDoc.exists()) {
      dataToSave.createdAt = serverTimestamp();
    }

    // Handle scheduling
    if (status === 'scheduled' && publishDate) {
      dataToSave.publishDate = publishDate;
      dataToSave.published = false;
    } else if (status === 'published') {
      dataToSave.published = true;
      dataToSave.publishedAt = serverTimestamp();
    } else {
      dataToSave.published = false;
    }

    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    console.error('Error saving daily content with schedule:', error);
    throw error;
  }
};

/**
 * Get all daily content with status filter (Admin only)
 * @param {string} statusFilter - 'all' | 'draft' | 'scheduled' | 'published'
 * @returns {Promise<Array>} Array of daily content objects
 */
export const getAllDailyContentWithStatus = async (statusFilter = 'all') => {
  try {
    let q;
    if (statusFilter === 'all') {
      q = query(
        collection(db, 'dailyContent'),
        orderBy('date', 'desc')
      );
    } else {
      q = query(
        collection(db, 'dailyContent'),
        where('status', '==', statusFilter),
        orderBy('date', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting daily content with status:', error);
    throw error;
  }
};

/**
 * Get scheduled content that should be published
 * @returns {Promise<Array>} Content ready to publish
 */
export const getScheduledContentToPublish = async () => {
  try {
    const now = new Date();
    const q = query(
      collection(db, 'dailyContent'),
      where('status', '==', 'scheduled'),
      where('publishDate', '<=', now)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting scheduled content to publish:', error);
    throw error;
  }
};

/**
 * Publish scheduled content
 * @param {string} contentId - Content ID
 * @returns {Promise<void>}
 */
export const publishScheduledContent = async (contentId) => {
  try {
    const docRef = doc(db, 'dailyContent', contentId);
    await updateDoc(docRef, {
      status: 'published',
      published: true,
      publishedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error publishing scheduled content:', error);
    throw error;
  }
};

/**
 * Update content status
 * @param {string} contentId - Content ID
 * @param {string} newStatus - New status
 * @returns {Promise<void>}
 */
export const updateContentStatus = async (contentId, newStatus) => {
  try {
    const docRef = doc(db, 'dailyContent', contentId);
    const updateData = {
      status: newStatus,
      updatedAt: serverTimestamp()
    };

    if (newStatus === 'published') {
      updateData.published = true;
      updateData.publishedAt = serverTimestamp();
    } else {
      updateData.published = false;
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating content status:', error);
    throw error;
  }
};

/**
 * Check and auto-publish scheduled content
 * @returns {Promise<number>} Number of content pieces published
 */
export const checkAndPublishScheduledContent = async () => {
  try {
    const contentToPublish = await getScheduledContentToPublish();

    for (const content of contentToPublish) {
      await publishScheduledContent(content.id);
    }

    return contentToPublish.length;
  } catch (error) {
    console.error('Error auto-publishing scheduled content:', error);
    throw error;
  }
};

/**
 * Delete daily content entry (Admin only)
 * @param {string} contentId - Content ID (date in YYYY-MM-DD format)
 * @returns {Promise<void>}
 */
export const deleteDailyContent = async (contentId) => {
  try {
    const docRef = doc(db, 'dailyContent', contentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting daily content:', error);
    throw error;
  }
};

// ==================== USER MANAGEMENT ====================

/**
 * Get all users (Admin only)
 * @returns {Promise<Array>} Array of user objects
 */
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Update user role (Admin only)
 * @param {string} userId - User ID
 * @param {string} role - New role ('free', 'premium', 'admin')
 * @returns {Promise<void>}
 */
export const updateUserRole = async (userId, role) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: role
    });
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

/**
 * Get the N most recent users
 * @param {number} n - Number of users to fetch
 * @returns {Promise<Array>} Array of user objects
 */
export const getRecentUsers = async (n = 3) => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(n)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting recent users:', error);
    throw error;
  }
};

/**
 * Get aggregated admin statistics
 * @returns {Promise<Object>} Object containing counts
 */
export const getAdminStats = async () => {
  try {
    // We'll do simple client side counting for now as standard Firestore doesn't provide easy count() for large collections without specialized extensions or server-side logic
    // But since the user wants specific counts, we'll fetch snapshots or use specific queries

    // Total Users
    const usersSnap = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnap.size;

    // Premium Users
    const premiumQ = query(collection(db, 'users'), where('role', '==', 'premium'));
    const premiumSnap = await getDocs(premiumQ);
    const premiumUsers = premiumSnap.size;

    // Total Prayer Requests
    const prayersSnap = await getDocs(collection(db, 'prayerRequests'));
    const totalPrayers = prayersSnap.size;

    // Today's Prayer Requests
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayQ = query(
      collection(db, 'prayerRequests'),
      where('createdAt', '>=', today)
    );
    const todaySnap = await getDocs(todayQ);
    const todayPrayers = todaySnap.size;

    return {
      totalUsers,
      premiumUsers,
      totalPrayers,
      todayPrayers
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    throw error;
  }
};

/**
 * Update user status (Admin only)
 * @param {string} userId - User ID
 * @param {string} status - New status ('active', 'suspended')
 * @returns {Promise<void>}
 */
export const updateUserStatus = async (userId, status) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: status
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Delete user account (Admin only)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    // Note: This only deletes the user document from Firestore
    // Firebase Auth user deletion requires server-side Admin SDK
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ==================== ANALYTICS ====================

/**
 * Track when a signed-in user opens daily content (Admin analytics)
 * Only counts unique users once per day
 * @param {string} contentId - Content ID (date in YYYY-MM-DD format)
 * @param {string} userId - User ID (only tracks if provided)
 * @returns {Promise<void>}
 */
export const trackDailyContentOpen = async (contentId, userId) => {
  try {
    // Only track if user is authenticated
    if (!userId) return;

    const docRef = doc(db, 'dailyContent', contentId);
    const contentDoc = await getDoc(docRef);

    if (!contentDoc.exists()) return;

    const data = contentDoc.data();
    const openedBy = data.openedBy || [];

    // Only increment if this user hasn't been counted yet
    if (!openedBy.includes(userId)) {
      await updateDoc(docRef, {
        opens: increment(1),
        openedBy: [...openedBy, userId]
      });
    }
  } catch (error) {
    console.error('Error tracking daily content open:', error);
    // Don't throw - analytics tracking failures shouldn't break user experience
  }
};

/**
 * Get prayer request trends over time (Admin only)
 * @param {number} days - Number of days to analyze (default: 7)
 * @returns {Promise<Array>} Array of {date, count} objects
 */
export const getPrayerRequestTrends = async (days = 7) => {
  try {
    const trends = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const q = query(
        collection(db, 'prayerRequests'),
        where('createdAt', '>=', date),
        where('createdAt', '<', nextDate)
      );

      const snapshot = await getDocs(q);

      trends.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        count: snapshot.size
      });
    }

    return trends;
  } catch (error) {
    console.error('Error getting prayer request trends:', error);
    throw error;
  }
};

/**
 * Get most active users by prayer interactions (Admin only)
 * @param {number} limitCount - Number of top users to return (default: 5)
 * @returns {Promise<Array>} Array of user objects with interaction counts
 */
export const getMostActiveUsers = async (limitCount = 5) => {
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate interaction counts for each user
    const userStats = await Promise.all(
      users.map(async (user) => {
        // Count prayer requests created
        const requestsQ = query(
          collection(db, 'prayerRequests'),
          where('userId', '==', user.id)
        );
        const requestsSnap = await getDocs(requestsQ);
        const requestsCount = requestsSnap.size;

        // Count prayers given to others
        const prayersQ = query(
          collection(db, 'prayerInteractions'),
          where('userId', '==', user.id)
        );
        const prayersSnap = await getDocs(prayersQ);
        const prayersCount = prayersSnap.size;

        // Count comments made (using collection group)
        const commentsQ = query(
          collectionGroup(db, 'comments'),
          where('userId', '==', user.id)
        );
        const commentsSnap = await getDocs(commentsQ);
        const commentsCount = commentsSnap.size;

        const totalInteractions = requestsCount + prayersCount + commentsCount;

        return {
          id: user.id,
          displayName: user.displayName || user.email || 'Anonymous',
          email: user.email,
          photoURL: user.photoURL,
          requestsCount,
          prayersCount,
          commentsCount,
          totalInteractions
        };
      })
    );

    // Sort by total interactions and return top users
    return userStats
      .sort((a, b) => b.totalInteractions - a.totalInteractions)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error getting most active users:', error);
    throw error;
  }
};

/**
 * Get content engagement metrics (Admin only)
 * @param {number} limitCount - Number of recent content items to analyze (default: 10)
 * @returns {Promise<Array>} Array of content with engagement metrics
 */
export const getContentEngagement = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'dailyContent'),
      where('published', '==', true),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.date,
        title: data.devotional?.title || 'Untitled',
        opens: data.opens || 0,
        prayers: data.prayers || 0,
        engagementRate: data.opens > 0 ? ((data.prayers / data.opens) * 100).toFixed(1) : '0.0'
      };
    });
  } catch (error) {
    console.error('Error getting content engagement:', error);
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
    const colRef = collection(db, 'users', userId, 'journalEntries');
    await addDoc(colRef, {
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
 * Update a journal entry
 * @param {string} userId - User ID
 * @param {string} entryId - Entry ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateJournalEntry = async (userId, entryId, updateData) => {
  try {
    const docRef = doc(db, 'users', userId, 'journalEntries', entryId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

/**
 * Get a specific journal entry
 * @param {string} userId - User ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Journal entry or null
 */
export const getJournalEntry = async (userId, entryId) => {
  try {
    const docRef = doc(db, 'users', userId, 'journalEntries', entryId);
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

/**
 * Delete a journal entry
 * @param {string} userId - User ID
 * @param {string} entryId - Entry ID
 * @returns {Promise<void>}
 */
export const deleteJournalEntry = async (userId, entryId) => {
  try {
    const docRef = doc(db, 'users', userId, 'journalEntries', entryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
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
 * Delete a prayer request
 * @param {string} requestId - Prayer request ID
 * @returns {Promise<void>}
 */
export const deletePrayerRequest = async (requestId) => {
  try {
    const requestRef = doc(db, 'prayerRequests', requestId);
    await deleteDoc(requestRef);
  } catch (error) {
    console.error('Error deleting prayer request:', error);
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

/**
 * Get all comments across all prayer requests (Admin only)
 * Uses collection group query to get comments from all subcollections
 * @param {string} statusFilter - 'all' | 'active' | 'flagged'
 * @returns {Promise<Array>} Array of all comments with prayer request context
 */
export const getAllComments = async (statusFilter = 'all') => {
  try {
    let q;
    if (statusFilter === 'all') {
      q = query(
        collectionGroup(db, 'comments'),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collectionGroup(db, 'comments'),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);

    // Map comments and include the prayer request ID from the parent path
    const comments = [];
    for (const docSnap of querySnapshot.docs) {
      const commentData = {
        id: docSnap.id,
        ...docSnap.data(),
        // Extract prayer request ID from the document path
        prayerRequestId: docSnap.ref.parent.parent.id
      };

      // Fetch prayer request details to provide context
      try {
        const requestRef = doc(db, 'prayerRequests', commentData.prayerRequestId);
        const requestSnap = await getDoc(requestRef);
        if (requestSnap.exists()) {
          commentData.prayerRequestTitle = requestSnap.data().content?.substring(0, 100) + '...';
        }
      } catch (err) {
        console.error('Error fetching prayer request context:', err);
      }

      comments.push(commentData);
    }

    return comments;
  } catch (error) {
    console.error('Error getting all comments:', error);
    throw error;
  }
};

/**
 * Delete a comment from a prayer request (Admin only)
 * @param {string} prayerRequestId - Prayer request ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<void>}
 */
export const deleteComment = async (prayerRequestId, commentId) => {
  try {
    const commentRef = doc(db, 'prayerRequests', prayerRequestId, 'comments', commentId);
    await deleteDoc(commentRef);

    // Decrement comment count on the prayer request
    const requestRef = doc(db, 'prayerRequests', prayerRequestId);
    await updateDoc(requestRef, {
      commentCount: increment(-1)
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

/**
 * Search comments across all prayer requests (Admin only)
 * @param {string} searchTerm - Search term to find in comment text
 * @returns {Promise<Array>} Array of matching comments
 */
export const searchComments = async (searchTerm) => {
  try {
    // Get all comments (Firestore doesn't support text search natively)
    const allComments = await getAllComments('all');

    // Filter by search term (case-insensitive)
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allComments.filter(comment =>
      comment.text?.toLowerCase().includes(lowerSearchTerm) ||
      comment.userName?.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error) {
    console.error('Error searching comments:', error);
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
  getAllDailyContent,
  deleteDailyContent,

  // User Management
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,

  // Journal
  saveJournalEntry,
  getJournalEntry,
  getUserJournalEntries,
  updateJournalEntry,
  deleteJournalEntry,

  // Prayer Requests
  getPrayerRequests,
  subscribeToPrayerRequests,
  createPrayerRequest,
  deletePrayerRequest,
  getPrayerRequest,
  incrementPrayerCount,
  decrementPrayerCount,
  trackPrayerInteraction,
  removePrayerInteraction,
  hasUserPrayed,

  // Comments
  getComments,
  addComment,
  getAllComments,
  deleteComment,
  searchComments,

  // User Requests
  getUserPrayerRequests,

  // Flagged Content
  flagPrayerRequest,
  getFlaggedRequests,
  approveFlaggedRequest,
  rejectFlaggedRequest,
  getRecentUsers,
  getAdminStats,

  // Analytics
  trackDailyContentOpen,
  getPrayerRequestTrends,
  getMostActiveUsers,
  getContentEngagement,
};
