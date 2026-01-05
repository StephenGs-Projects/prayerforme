import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FlowContext = createContext();

export const FlowProvider = ({ children }) => {
    const [isNavVisible, setIsNavVisible] = useState(false);
    const location = useLocation();

    // Logic: 
    // If user has NOT completed the flow today, hide nav? 
    // For now, let's keep it simple as requested: "Once they click next or skip in the journal page, there show the bottom menu bar."
    // This implies default state is hidden.
    // We can persist this in localStorage if we want "today's session" to remember, but for now ephemeral state is safer for testing.

    const showNav = () => setIsNavVisible(true);

    return (
        <FlowContext.Provider value={{ isNavVisible, setIsNavVisible, showNav }}>
            {children}
        </FlowContext.Provider>
    );
};

export const useFlow = () => useContext(FlowContext);
