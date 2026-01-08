import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import { getDailyContent, getLatestDailyContent } from '../firebase/firestore';

const AdPage = () => {
    const navigate = useNavigate();
    const [dailyContent, setDailyContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(5);
    const [canClose, setCanClose] = useState(false);
    const [totalDuration, setTotalDuration] = useState(5);
    const [showCTA, setShowCTA] = useState(false);

    useEffect(() => {
        const fetchDailyContent = async () => {
            try {
                setLoading(true);
                const today = new Date().toISOString().split('T')[0];
                let content = await getDailyContent(today);
                if (!content) content = await getLatestDailyContent();

                if (content?.ad?.show) {
                    setDailyContent(content);
                    const duration = content.ad.duration || 5;
                    setSecondsLeft(duration);
                    setTotalDuration(duration);
                } else {
                    console.log('No ad for today, skipping');
                    navigate('/journal');
                }
            } catch (err) {
                console.error('Ad fetch error:', err);
                setError('Failed to load');
                setTimeout(() => navigate('/journal'), 1500);
            } finally {
                setLoading(false);
            }
        };
        fetchDailyContent();
    }, [navigate]);

    useEffect(() => {
        if (!loading && secondsLeft > 0) {
            const timer = setInterval(() => setSecondsLeft(p => p - 1), 1000);
            return () => clearInterval(timer);
        } else if (!loading && secondsLeft <= 0) {
            setCanClose(true);
        }
    }, [secondsLeft, loading]);

    // Show CTA button after 2 seconds
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setShowCTA(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    if (loading) return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000, background: 'var(--bg-app)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px'
        }}>
            <Loader2 size={32} className="animate-spin" color="var(--accent-cyan)" />
            <p style={{ color: 'var(--text-tertiary)' }}>Loading sponsorship...</p>
        </div>
    );

    if (error || !dailyContent?.ad) return null;

    const ad = dailyContent.ad;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000, background: '#000',
            display: 'flex', flexDirection: 'column'
        }}>
            {/* Ad Content Container */}
            <div style={{ flex: 1, position: 'relative', background: '#000' }}>
                {/* Video or Image */}
                {ad.videoUrl ? (
                    <video
                        src={ad.videoUrl}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        autoPlay
                        muted
                        loop
                        playsInline
                        onError={(e) => {
                            console.error('Ad video load fail');
                            // Fallback to image if video fails
                            if (ad.imageUrl) {
                                e.target.style.display = 'none';
                            }
                        }}
                    />
                ) : ad.imageUrl ? (
                    <img
                        src={ad.imageUrl}
                        alt="Daily Sponsor"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            console.error('Ad image load fail');
                            e.target.style.display = 'none';
                        }}
                    />
                ) : null}

                {/* Top Controls Overlay */}
                <div style={{
                    position: 'absolute', top: '24px', right: '24px', zIndex: 2100,
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    {!canClose ? (
                        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                            {/* Circular Progress Ring */}
                            <svg style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }} width="48" height="48">
                                {/* Background circle */}
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="3"
                                    fill="rgba(0,0,0,0.4)"
                                    style={{ backdropFilter: 'blur(10px)' }}
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="#67e8f9"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 20}`}
                                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - secondsLeft / totalDuration)}`}
                                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                                />
                            </svg>
                            {/* Countdown number */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '48px', height: '48px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700, fontSize: '16px'
                            }}>
                                {secondsLeft}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/journal')}
                            style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'white', border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#000', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                transition: 'all 0.3s ease',
                                animation: 'pulse 2s ease-in-out infinite'
                            }}
                        >
                            <X size={22} />
                        </button>
                    )}
                </div>

                {/* Bottom Gradient and Text Overlay */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '80px 24px 32px 24px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            background: 'rgba(6, 182, 212, 0.2)', color: '#67e8f9',
                            padding: '4px 12px', borderRadius: '4px', fontSize: '12px',
                            fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '0.1em', border: '1px solid rgba(6, 182, 212, 0.3)'
                        }}>
                            Sponsored
                        </div>
                        <button
                            onClick={() => {
                                if (ad.link) window.open(ad.link, '_blank');
                                navigate('/journal');
                            }}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '50px',
                                background: '#06b6d4',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {ad.buttonText || 'Learn More'} <ArrowRight size={16} />
                        </button>
                    </div>
                    <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 600, marginBottom: '8px', lineHeight: 1.2 }}>
                        {ad.title || "Daily Inspiration"}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', fontWeight: 300, lineHeight: 1.5 }}>
                        {ad.content || "A special message from our community partners."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdPage;
