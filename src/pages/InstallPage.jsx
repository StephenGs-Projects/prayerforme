import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Download,
    Smartphone,
    Chrome,
    Share,
    MoreVertical,
    Info,
    Apple,
    ChevronRight
} from 'lucide-react';

const InstallPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-app)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 24px',
            fontFamily: 'var(--font-sans)',
            gap: '32px'
        }}>
            {/* Header Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--bg-surface-active)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '32px',
                    border: '1px solid var(--border-surface)'
                }}>
                    <Download size={32} color="var(--accent-cyan)" strokeWidth={1.5} />
                </div>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginBottom: '12px'
                }}>
                    Install App
                </h1>
                <p style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    fontWeight: 300,
                    maxWidth: '300px'
                }}>
                    Add this app to your home screen for quick access and notifications
                </p>
                <div style={{
                    width: '40px',
                    height: '2px',
                    background: 'var(--accent-amber)',
                    marginTop: '32px'
                }} />
            </div>

            {/* Instruction Cards Container */}
            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* iPhone Card */}
                <div style={{
                    background: 'var(--bg-surface)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid var(--border-surface)',
                }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'var(--bg-app)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-cyan)">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>iPhone (Safari)</h3>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 300, lineHeight: '1.8' }}>
                                <div>1. Tap the <strong>Share</strong> button at the bottom</div>
                                <div>2. Scroll down and tap <strong>Add to Home Screen</strong></div>
                                <div>3. Tap <strong>Add</strong> in the top right</div>
                            </div>
                        </div>
                    </div>
                    <div style={{
                        borderTop: '1px solid var(--border-surface)',
                        paddingTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        color: 'var(--accent-cyan)',
                        fontSize: '14px',
                        fontWeight: 300
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3v13M5 10l7-7 7 7M4 21h16" />
                        </svg>
                        <span>Look for this icon</span>
                    </div>
                </div>

                {/* Android Card */}
                <div style={{
                    background: 'var(--bg-surface)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid var(--border-surface)',
                }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'var(--bg-app)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Chrome size={20} color="var(--accent-cyan)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>Android (Chrome)</h3>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 300, lineHeight: '1.8' }}>
                                <div>1. Tap the <strong>Menu</strong> (three dots) in the top right</div>
                                <div>2. Tap <strong>Add to Home screen</strong></div>
                                <div>3. Tap <strong>Add</strong> to confirm</div>
                            </div>
                        </div>
                    </div>
                    <div style={{
                        borderTop: '1px solid var(--border-surface)',
                        paddingTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        color: 'var(--accent-cyan)',
                        fontSize: '14px',
                        fontWeight: 300
                    }}>
                        <MoreVertical size={20} />
                        <span>Look for this icon</span>
                    </div>
                </div>

                {/* Other Browsers Card */}
                <div style={{
                    background: 'var(--bg-surface)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid var(--border-surface)',
                }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'var(--bg-app)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Smartphone size={20} color="var(--accent-cyan)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>Other Browsers</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '8px', fontWeight: 300 }}>Firefox, DuckDuckGo, Edge, Opera</p>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 300, lineHeight: '1.8' }}>
                                <div>1. Tap the <strong>Menu</strong> or <strong>Share</strong> button</div>
                                <div>2. Tap <strong>More</strong> or scroll to see more options</div>
                                <div>3. Tap <strong>Install</strong> or <strong>Add to Home Screen</strong></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brave Note */}
                <div style={{
                    background: 'var(--theme-is-dark) ? #78350f20 : #fffbeb',
                    backgroundColor: 'rgba(254, 243, 199, 0.5)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #fef3c7',
                    display: 'flex',
                    gap: '12px'
                }}>
                    <Info size={20} color="#d97706" style={{ flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#92400e' }}>Note for Brave Users</h4>
                        <p style={{ fontSize: '13px', color: '#92400e', fontWeight: 300, lineHeight: 1.5 }}>
                            Brave browser does not support Add to Home Screen by default. Please use Safari (iOS) or Chrome (Android) for the best experience.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        width: '100%',
                        padding: '18px',
                        borderRadius: '12px',
                        background: 'var(--accent-cyan)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    Continue to App
                </button>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-light)',
                        fontSize: '14px',
                        fontWeight: 300,
                        cursor: 'pointer'
                    }}
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
};

export default InstallPage;
