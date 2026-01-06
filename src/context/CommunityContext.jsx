import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const CommunityContext = createContext();

export const useCommunity = () => useContext(CommunityContext);

export const CommunityProvider = ({ children }) => {
    // Get userRole from AuthContext
    const { userRole } = useAuth();

    // Empty arrays - all data now comes from Firestore
    const [feedItems] = useState([]);
    const [flaggedItems] = useState([]);

    // Daily post state - used as fallback when Firestore data is not available
    const [dailyPost, setDailyPost] = useState({
        adImage: null,
        adLink: '',
        showAd: false,
        adDuration: 5,
        title: 'Daily Devotional',
        content: "Today's devotional content will appear here once added by an admin."
    });

    // Legacy functions kept for compatibility - use Firestore functions instead
    const flagItem = () => {
        console.warn('flagItem is deprecated - use flagPrayerRequest from firebase/firestore');
    };

    const approveItem = () => {
        console.warn('approveItem is deprecated - use approveFlaggedRequest from firebase/firestore');
    };

    const rejectItem = () => {
        console.warn('rejectItem is deprecated - use rejectFlaggedRequest from firebase/firestore');
    };

    return (
        <CommunityContext.Provider value={{
            feedItems, flaggedItems, flagItem, approveItem, rejectItem,
            userRole, dailyPost, setDailyPost
        }}>
            {children}
        </CommunityContext.Provider>
    );
};
