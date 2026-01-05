import React from 'react';
import { Smartphone, QrCode } from 'lucide-react';

const DesktopSplash = () => {
    return (
        <div id="desktop-splash" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--bg-app)',
            zIndex: 9999,
            display: 'none', // Hidden by default, toggled via CSS media query
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-primary)'
        }}>
            <div className="glass" style={{
                padding: '60px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '30px',
                maxWidth: '500px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--bg-surface-active)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan)'
                }}>
                    <Smartphone size={40} />
                </div>

                <div>
                    <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>Mobile Experience</h1>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '16px' }}>
                        This application is designed to be experienced on a mobile phone.
                        Please open this link on your device or scan the code below.
                    </p>
                </div>

                {/* QR Code Placeholder */}
                <div style={{
                    padding: '20px',
                    background: 'white',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <QrCode size={150} color="black" />
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                    Scan to open on your phone
                </p>
            </div>
        </div>
    );
};

export default DesktopSplash;
