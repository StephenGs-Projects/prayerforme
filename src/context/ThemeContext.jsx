import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 'system', 'light', 'dark'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'system';
    });

    const [fontSize, setFontSize] = useState(() => {
        return parseFloat(localStorage.getItem('fontSize')) || 1;
    });

    useEffect(() => {
        const root = document.documentElement;
        localStorage.setItem('theme', theme);
        localStorage.setItem('fontSize', fontSize);

        if (theme === 'system') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', theme);
        }

        root.style.setProperty('--font-scale', fontSize);
    }, [theme, fontSize]);

    // Listen for system changes if we want to do something reactive? 
    // CSS media query handles the "System" look automatically when data-theme is missing.
    // So we don't need extra JS listeners for system unless we want to display "System (Light)" text.

    return (
        <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
