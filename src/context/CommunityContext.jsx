import React, { createContext, useContext, useState } from 'react';

const CommunityContext = createContext();

export const useCommunity = () => useContext(CommunityContext);

export const CommunityProvider = ({ children }) => {
    // Initial dummy data
    const initialFeed = [
        { id: 1, name: 'Sarah M.', time: '2h ago', content: "Please pray for my mother's surgery tomorrow. We are hoping for a quick recovery and peace for the family during this time.", prayedCount: 24, commentCount: 5 },
        { id: 2, name: 'David K.', time: '4h ago', content: "Fighting anxiety about my upcoming job interview. I really need this opportunity.", prayedCount: 15, commentCount: 2 },
        { id: 3, name: 'Grace L.', time: '6h ago', content: "Praise report! My brother finally came back to church today after 5 years.", prayedCount: 42, commentCount: 12 },
    ];

    const [feedItems, setFeedItems] = useState(initialFeed);
    const [flaggedItems, setFlaggedItems] = useState([
        { id: 101, content: "This is spam content...", reporter: 'John D.', time: '2h ago', reason: 'Spam' },
        { id: 102, content: "Inappropriate language here...", reporter: 'Emily W.', time: '5h ago', reason: 'Harassment' },
    ]);

    // New State for Premium/Ads
    const [userRole, setUserRole] = useState('free'); // 'free' or 'premium'
    const [dailyPost, setDailyPost] = useState({
        adImage: null,
        adLink: 'https://example.com/journal',
        showAd: true,
        adDuration: 5,
        title: 'Walking in Faith',
        content: "Faith is not just a feeling; it is a choice to trust God even when we cannot see the path ahead..."
    });

    const flagItem = (itemId, reason, reporterName = 'Anonymous') => {
        const itemToFlag = feedItems.find(item => item.id === itemId);
        if (itemToFlag) {
            // Remove from feed
            setFeedItems(prev => prev.filter(item => item.id !== itemId));
            // Add to flagged
            setFlaggedItems(prev => [...prev, {
                ...itemToFlag,
                reason,
                reporter: reporterName,
                time: 'Just now'
            }]);
        }
    };

    const approveItem = (itemId) => {
        const itemToApprove = flaggedItems.find(item => item.id === itemId);
        if (itemToApprove) {
            // Remove from flagged
            setFlaggedItems(prev => prev.filter(item => item.id !== itemId));
            // Add back to feed (prepend)
            setFeedItems(prev => [{ ...itemToApprove }, ...prev]);
        }
    };

    const rejectItem = (itemId) => {
        // PERMANENT DELETE
        setFlaggedItems(prev => prev.filter(item => item.id !== itemId));
    };

    return (
        <CommunityContext.Provider value={{
            feedItems, flaggedItems, flagItem, approveItem, rejectItem,
            userRole, setUserRole, dailyPost, setDailyPost
        }}>
            {children}
        </CommunityContext.Provider>
    );
};
