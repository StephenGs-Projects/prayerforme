import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenLine, Play, Pause } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { getDailyContent, getLatestDailyContent, trackDailyContentOpen } from '../firebase/firestore';
import { markdownToSafeHTML } from '../utils/markdown';

const DevotionalPage = () => {
    const navigate = useNavigate();
    const { userRole, dailyPost } = useCommunity();
    const { currentUser } = useAuth();
    const [dailyContent, setDailyContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const fetchDailyContent = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get today's date in YYYY-MM-DD format
                const today = new Date().toISOString().split('T')[0];

                // Try to get today's content first
                let content = await getDailyContent(today);

                // If no content for today, get the latest published content
                if (!content) {
                    content = await getLatestDailyContent();
                }

                setDailyContent(content);

                // Track content open for analytics (non-blocking, only for signed-in users)
                if (content && content.date && currentUser) {
                    trackDailyContentOpen(content.date, currentUser.uid);
                }
            } catch (err) {
                console.error('Error fetching daily content:', err);
                setError('Failed to load devotional content');
            } finally {
                setLoading(false);
            }
        };

        fetchDailyContent();
    }, []);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        // Only show ad to free users and admins if an ad exists and is enabled
        const hasAd = dailyContent?.ad?.show || dailyPost.showAd;
        const isEligibleRole = userRole === 'free' || userRole === 'admin';

        if (isEligibleRole && hasAd) {
            navigate('/ad');
        } else {
            navigate('/journal');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 24px 120px 24px'
        }}>
            <div style={{ maxWidth: '448px', margin: '0 auto', width: '100%' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '48px' }}>
                    <p style={{
                        fontSize: '11px',
                        letterSpacing: '0.3em',
                        color: 'var(--text-light)',
                        textTransform: 'uppercase',
                        marginBottom: '24px',
                        fontWeight: 400
                    }}>
                        Daily Devotional
                    </p>

                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between'
                    }}>
                        {loading ? (
                            <h1 style={{
                                fontSize: '24px',
                                fontWeight: 300,
                                color: 'var(--text-tertiary)',
                                fontStyle: 'italic'
                            }}>
                                Loading devotional...
                            </h1>
                        ) : error ? (
                            <h1 style={{
                                fontSize: '24px',
                                fontWeight: 300,
                                color: '#ef4444'
                            }}>
                                {error}
                            </h1>
                        ) : (
                            <>
                                <h1 style={{
                                    fontSize: '36px',
                                    fontWeight: 300,
                                    color: 'var(--text-primary)',
                                    lineHeight: 1.1,
                                    fontFamily: 'var(--font-sans)',
                                    letterSpacing: '-0.02em'
                                }}>
                                    {(dailyContent?.devotional?.title || dailyPost.title || 'Daily Devotional').split(' ').slice(0, 2).join(' ')}<br />
                                    {(dailyContent?.devotional?.title || dailyPost.title || 'Daily Devotional').split(' ').slice(2).join(' ')}
                                </h1>

                                {/* Play Button */}
                                {dailyContent?.devotional?.audioUrl && (
                                    <button
                                        onClick={toggleAudio}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: '#06b6d4',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            marginTop: '4px',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <audio
                                            ref={audioRef}
                                            src={dailyContent.devotional.audioUrl}
                                            onEnded={() => setIsPlaying(false)}
                                        />
                                        {isPlaying ? (
                                            <Pause size={20} fill="white" color="white" />
                                        ) : (
                                            <Play size={20} fill="white" color="white" style={{ marginLeft: '2px' }} />
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div style={{ marginBottom: '32px' }}>
                    {/* Decorative Line */}
                    <div style={{
                        width: '48px',
                        height: '2px',
                        backgroundColor: '#d97706',
                        marginBottom: '24px'
                    }} />

                    {loading ? (
                        <p style={{
                            fontSize: '16px',
                            color: 'var(--text-tertiary)',
                            fontStyle: 'italic'
                        }}>
                            Loading content...
                        </p>
                    ) : error ? null : (
                        <div
                            style={{
                                fontSize: '18px',
                                lineHeight: 1.7,
                                color: 'var(--text-secondary)',
                                fontWeight: 300
                            }}
                            dangerouslySetInnerHTML={{
                                __html: markdownToSafeHTML(dailyContent?.devotional?.content || dailyPost.content || 'No devotional content available for today.')
                            }}
                        />
                    )}
                </div>

                {/* Go to Journal Button */}
                <button
                    onClick={handleNext}
                    style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-surface-active)',
                        padding: '16px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        border: '1px solid var(--border-surface)',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-surface)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)'}
                >
                    <PenLine size={20} color="var(--text-secondary)" strokeWidth={2} />
                    <span style={{
                        color: 'var(--text-secondary)',
                        fontWeight: 300,
                        letterSpacing: '0.02em',
                        fontSize: '16px'
                    }}>
                        Go to Journal
                    </span>
                </button>
            </div>
        </div>
    );
};

export default DevotionalPage;
