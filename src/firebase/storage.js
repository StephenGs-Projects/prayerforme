import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a profile image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} userId - User ID
 * @returns {Promise<string>} Download URL of the uploaded image
 */
export const uploadProfileImage = async (file, userId) => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }

    // Create a reference to the storage location
    const storageRef = ref(storage, `profileImages/${userId}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

/**
 * Upload a file to a specific path in Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The path in storage (e.g., 'ads/my-ad.png' or 'audio/daily-prayer.mp3')
 * @returns {Promise<string>} Download URL of the uploaded file
 */
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading file to ${path}:`, error);
    throw error;
  }
};

/**
 * Delete a user's profile image from Firebase Storage
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteProfileImage = async (userId) => {
  try {
    const storageRef = ref(storage, `profileImages/${userId}`);
    await deleteObject(storageRef);
  } catch (error) {
    // If the file doesn't exist, that's okay
    if (error.code !== 'storage/object-not-found') {
      console.error('Error deleting profile image:', error);
      throw error;
    }
  }
};

export default {
  uploadProfileImage,
  uploadFile,
  deleteProfileImage,
};
