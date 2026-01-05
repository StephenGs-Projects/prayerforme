import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';

const AdPage = () => {
    const navigate = useNavigate();
    const { dailyPost } = useCommunity();
    const [secondsLeft, setSecondsLeft] = useState(dailyPost.adDuration || 5);
    const [canClose, setCanClose] = useState(false);

    useEffect(() => {
        if (secondsLeft > 0) {
            const timer = setInterval(() => {
                setSecondsLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setCanClose(true);
        }
    }, [secondsLeft]);

    const defaultAd = "/Users/main/.gemini/antigravity/brain/6e9e27e5-eadd-4f19-bdbb-279fe676a3cb/physical_journal_ad_1767634259884.png";
    const adImage = dailyPost.adImage || defaultAd;
    const isDefaultAd = !dailyPost.adImage;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'var(--bg-app)', zIndex: 1000, display: 'flex', flexDirection: 'column'
        }}>
            {/* Top Close Button / Countdown */}
            <div style={{
                position: 'absolute', top: '20px', right: '20px', zIndex: 1001,
                display: 'flex', alignItems: 'center', gap: '10px'
            }}>
                {!canClose ? (
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        border: '2px solid #d97706',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#d97706', fontSize: '14px', fontWeight: 600,
                        background: 'var(--bg-surface)'
                    }}>
                        {secondsLeft}
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/journal')}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--bg-surface)', border: '1px solid var(--border-surface)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-secondary)', cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Ad Content */}
            <div style={{
                flex: 1, position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <img
                    src={adImage}
                    alt="Prayer Journal Ad"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Content Overlay */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '40px 24px', background: 'linear-gradient(to top, rgba(250,250,249,0.95), transparent)',
                    display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                    <div style={{
                        background: '#fef3c7', color: '#d97706',
                        padding: '4px 12px', borderRadius: '4px', fontSize: '11px',
                        fontWeight: 500, width: 'fit-content', textTransform: 'uppercase', letterSpacing: '1px'
                    }}>
                        Sponsored
                    </div>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 300, marginBottom: '4px' }}>
                        {isDefaultAd ? "The 2026 Physical Journal" : "Daily Inspiration"}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 300 }}>
                        {isDefaultAd
                            ? "Deepen your prayer life with our premium linen-bound journal. Limited edition now available."
                            : "A special message from our community partners."}
                    </p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                padding: '24px', borderTop: '1px solid var(--border-surface)',
                display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-surface)'
            }}>
                <button
                    onClick={() => {
                        if (dailyPost.adLink) window.open(dailyPost.adLink, '_blank');
                        navigate('/journal');
                    }}
                    style={{
                        width: '100%', padding: '18px', borderRadius: '8px',
                        background: '#06b6d4', color: 'var(--bg-surface)',
                        fontWeight: 500, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px', border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {isDefaultAd ? "Learn More & Continue" : "Continue to Journal"} <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default AdPage;
