import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import PrayerHandsIcon from '../components/PrayerHandsIcon';

const PrayerPage = () => {
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState('Good Morning');
    const [progress, setProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    const startHold = () => {
        setIsHolding(true);
        intervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(intervalRef.current);
                    navigate('/devotional');
                    return 100;
                }
                return prev + 3;
            });
        }, 60);
    };

    const endHold = () => {
        setIsHolding(false);
        clearInterval(intervalRef.current);
        setProgress(0);
    };

    // Get current date
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).toUpperCase();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 24px 120px 24px'
        }}>
            <div style={{ maxWidth: '448px', margin: '0 auto', width: '100%' }}>
                {/* Date */}
                <p style={{
                    fontSize: '11px',
                    letterSpacing: '0.3em',
                    color: 'var(--text-light)',
                    textTransform: 'uppercase',
                    marginBottom: '32px',
                    fontWeight: 400
                }}>
                    {currentDate}
                </p>

                {/* Greeting */}
                <h1 style={{
                    fontSize: '36px',
                    fontWeight: 300,
                    color: 'var(--text-primary)',
                    marginBottom: '64px',
                    lineHeight: 1.2,
                    fontFamily: 'var(--font-sans)'
                }}>
                    {greeting.split(' ')[0]}<br />{greeting.split(' ')[1] || ''}
                </h1>

                {/* Verse Section */}
                <div style={{ marginBottom: '64px' }}>
                    {/* Decorative Line */}
                    <div style={{
                        width: '48px',
                        height: '2px',
                        backgroundColor: '#d97706',
                        marginBottom: '24px'
                    }} />

                    <p style={{
                        fontSize: '18px',
                        lineHeight: 1.7,
                        color: 'var(--text-secondary)',
                        marginBottom: '24px',
                        fontWeight: 300
                    }}>
                        "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."
                    </p>

                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-tertiary)',
                        fontWeight: 300,
                        fontStyle: 'italic'
                    }}>
                        Philippians 4:6
                    </p>
                </div>

                {/* Prayer Section */}
                <div style={{
                    borderLeft: '2px solid var(--border-surface)',
                    paddingLeft: '24px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px'
                    }}>
                        <h2 style={{
                            fontSize: '13px',
                            letterSpacing: '0.15em',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                            fontFamily: 'var(--font-sans)'
                        }}>
                            Prayer
                        </h2>

                        <button style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#06b6d4',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                        }}>
                            <Play size={16} fill="white" color="white" style={{ marginLeft: '2px' }} />
                        </button>
                    </div>

                    <p style={{
                        fontSize: '16px',
                        lineHeight: 1.8,
                        color: 'var(--text-secondary)',
                        fontWeight: 300
                    }}>
                        Lord, thank you for this new day. Help me to trust You with all my heart and lean not on my own understanding. Guide my steps and fill me with Your peace that surpasses all understanding. Amen.
                    </p>
                </div>

                {/* Hold Button (Centered, fixed to bottom) */}
                <div style={{
                    position: 'fixed',
                    bottom: '120px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div
                        onMouseDown={startHold}
                        onMouseUp={endHold}
                        onMouseLeave={endHold}
                        onTouchStart={startHold}
                        onTouchEnd={endHold}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            transform: isHolding ? 'scale(0.95)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'transparent',
                            border: '2px solid var(--accent-cyan)',
                            animation: !isHolding && progress === 0 ? 'pulseScale 2s infinite' : 'none'
                        }}
                    >
                        {/* Progress overlay */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: `${progress}%`,
                            height: `${progress}%`,
                            borderRadius: '50%',
                            background: 'rgba(6, 182, 212, 0.1)',
                            transition: 'all 0.05s linear',
                            zIndex: 0
                        }} />

                        <PrayerHandsIcon size={32} color="var(--accent-cyan)" style={{ zIndex: 1 }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrayerPage;
