import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FlowContext = createContext();

export const FlowProvider = ({ children }) => {
    const location = useLocation();

    // Get today's key for persistence
    const today = new Date().toISOString().split('T')[0];
    const STORAGE_KEY = `flow_unlocked_${today}`;

    // Tracks if the flow was already unlocked PRIOR to this mounting (e.g. refresh)
    const [wasAlreadyUnlocked] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
    // Tracks if the flow was unlocked in the current session
    const [isFlowActive, setIsFlowActive] = useState(false);

    // Function to "unlock" navigation for the rest of the day
    const showNav = () => {
        setIsFlowActive(true);
        localStorage.setItem(STORAGE_KEY, 'true');
    };

    // For backward compatibility with components calling setIsNavVisible direktly
    const setIsNavVisible = (val) => {
        if (val) {
            showNav();
        } else {
            setIsFlowActive(false);
        }
    };

    // Determine visibility based on user requirements:
    // 1. Hidden until after Prayer/Devotional/Ad/Journal flow.
    // 2. Once moved to Community (or reached), it shows.
    // 3. If refreshed AFTER starting/completing flow, it shows everywhere.

    const isUnlocked = wasAlreadyUnlocked || isFlowActive;

    // Pages that are part of the initial "focus" flow (Menu stays hidden here unless refresh-unlocked)
    const introPages = ['/', '/devotional', '/journal', '/ad', '/admin', '/install'];
    const isIntroPage = introPages.includes(location.pathname);

    // Visibility Rule: 
    // - Show if unlocked AND NOT an intro page.
    // - This ensures that even if you've already "unlocked" the app today,
    //   re-entering the Daily Flow (Prayer/Devotional/Ad) stays focused and immersive.
    const isNavVisible = isUnlocked && !isIntroPage;

    return (
        <FlowContext.Provider value={{ isNavVisible, setIsNavVisible, showNav }}>
            {children}
        </FlowContext.Provider>
    );
};

export const useFlow = () => useContext(FlowContext);
