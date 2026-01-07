import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MoreVertical, Send, Flag, X, AlertTriangle } from 'lucide-react';
import PrayerHandsIcon from '../components/PrayerHandsIcon';
import { useFlow } from '../context/FlowContext';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import {
    subscribeToPrayerRequests,
    createPrayerRequest,
    incrementPrayerCount,
    decrementPrayerCount,
    trackPrayerInteraction,
    removePrayerInteraction,
    hasUserPrayed,
    flagPrayerRequest
} from '../firebase/firestore';

const CommunityPage = () => {
    const navigate = useNavigate();
    const { setIsNavVisible } = useFlow();
    const { feedItems, flagItem } = useCommunity();
    const { currentUser } = useAuth();
    const [prayerRequests, setPrayerRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRequest, setNewRequest] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [flaggingId, setFlaggingId] = useState(null);
    const [showFlagModal, setShowFlagModal] = useState(false);

    useEffect(() => {
        setIsNavVisible(true);
    }, [setIsNavVisible]);

    // Subscribe to real-time prayer requests
    useEffect(() => {
        setLoading(true);

        const unsubscribe = subscribeToPrayerRequests((requests) => {
            // Format requests to match the expected structure
            const formattedRequests = requests.map(req => ({
                ...req,
                name: req.userName || 'Anonymous',
                time: req.createdAt ? formatTimestamp(req.createdAt) : 'Just now'
            }));
            setPrayerRequests(formattedRequests);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Helper function to format timestamp
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Just now';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // difference in seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const handleSubmitRequest = async () => {
        if (!newRequest.trim() || !currentUser) return;

        try {
            setSubmitting(true);

            await createPrayerRequest({
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                userEmail: currentUser.email,
                photoURL: currentUser.photoURL || null,
                content: newRequest.trim()
            });

            setNewRequest('');
        } catch (error) {
            console.error('Error submitting prayer request:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFlagClick = (id) => {
        setFlaggingId(id);
        setShowFlagModal(true);
    };

    const confirmFlag = async (reason) => {
        if (!currentUser) return;

        try {
            await flagPrayerRequest(flaggingId, currentUser.uid, reason);
            setShowFlagModal(false);
            setFlaggingId(null);
        } catch (error) {
            console.error('Error flagging request:', error);
        }
    };

    // Avatar colors
    const avatarColors = ['#fb7185', '#fb923c', '#fbbf24', '#a3e635', '#60a5fa', '#c084fc'];

    const getAvatarColor = (name) => {
        const index = name.charCodeAt(0) % avatarColors.length;
        return avatarColors[index];
    };

    // Sub-component for Feed Item
    const FeedItem = ({ item }) => {
        const [isPrayed, setIsPrayed] = useState(false);
        const [count, setCount] = useState(item.prayedCount || 0);
        const [showMenu, setShowMenu] = useState(false);
        const [checking, setChecking] = useState(true);
        const menuRef = useRef(null);

        // Check if user has already prayed for this request
        useEffect(() => {
            const checkPrayedStatus = async () => {
                if (currentUser) {
                    const prayed = await hasUserPrayed(item.id, currentUser.uid);
                    setIsPrayed(prayed);
                }
                setChecking(false);
            };
            checkPrayedStatus();
        }, [item.id]);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (menuRef.current && !menuRef.current.contains(event.target)) {
                    setShowMenu(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const handlePrayClick = async (e) => {
            e.stopPropagation();
            if (!currentUser) return;

            try {
                if (isPrayed) {
                    // Remove prayer
                    await Promise.all([
                        decrementPrayerCount(item.id),
                        removePrayerInteraction(item.id, currentUser.uid)
                    ]);
                    setCount(c => Math.max(0, c - 1));
                    setIsPrayed(false);
                } else {
                    // Add prayer
                    await Promise.all([
                        incrementPrayerCount(item.id),
                        trackPrayerInteraction(item.id, currentUser.uid)
                    ]);
                    setCount(c => c + 1);
                    setIsPrayed(true);
                }
            } catch (error) {
                console.error('Error updating prayer:', error);
            }
        };

        return (
            <div style={{
                background: 'var(--bg-surface)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid var(--border-surface)',
                position: 'relative'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: item.photoURL ? `url(${item.photoURL}) center/cover` : getAvatarColor(item.name),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {!item.photoURL && (
                            <span style={{ color: 'var(--bg-surface)', fontWeight: 300, fontSize: '18px' }}>
                                {item.name.charAt(0)}
                            </span>
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                            {item.name}
                        </h3>
                        <p style={{ fontSize: '11px', color: 'var(--text-light)', letterSpacing: '0.05em' }}>
                            {item.time}
                        </p>
                    </div>

                    <div style={{ position: 'relative' }} ref={menuRef}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            style={{
                                color: 'var(--text-light)',
                                padding: '8px',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light)'}
                        >
                            <MoreVertical size={20} />
                        </button>

                        {showMenu && (
                            <div style={{
                                position: 'absolute', top: '100%', right: 0,
                                width: '160px', borderRadius: '8px',
                                zIndex: 10, overflow: 'hidden',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-surface)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleFlagClick(item.id); setShowMenu(false); }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#ec4899',
                                        fontSize: '14px',
                                        fontWeight: 400,
                                        background: 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Flag size={16} />
                                    Flag Request
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <p style={{
                    lineHeight: 1.7,
                    marginBottom: '24px',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    fontWeight: 300,
                    fontSize: '16px'
                }}>
                    {item.content}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button
                        onClick={handlePrayClick}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: isPrayed ? '#ed7b66' : 'var(--text-tertiary)',
                            background: 'transparent',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!isPrayed) {
                                e.currentTarget.style.color = 'var(--accent-cyan)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = isPrayed ? '#ed7b66' : 'var(--text-tertiary)';
                        }}
                    >
                        <PrayerHandsIcon size={20} color="currentColor" strokeWidth={2} />
                        <span style={{ fontSize: '14px', fontWeight: 300 }}>{count}</span>
                    </button>

                    <button
                        onClick={() => navigate(`/community/${item.id}`)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--text-tertiary)',
                            background: 'transparent',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#06b6d4'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                    >
                        <MessageCircle size={20} strokeWidth={2} />
                        <span style={{ fontSize: '14px', fontWeight: 300 }}>{item.commentCount}</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '32px 24px 120px 24px',
            overflowY: 'auto'
        }}>
            <div style={{ maxWidth: '448px', margin: '0 auto', width: '100%' }}>
                <h1 style={{
                    fontSize: '36px',
                    fontWeight: 300,
                    color: 'var(--text-primary)',
                    marginBottom: '48px',
                    fontFamily: 'var(--font-sans)'
                }}>
                    Community
                </h1>

                {/* Share Prayer Request Input */}
                <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-surface)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '48px',
                    transition: 'border-color 0.2s'
                }}>
                    <input
                        type="text"
                        value={newRequest}
                        onChange={(e) => setNewRequest(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !submitting) {
                                handleSubmitRequest();
                            }
                        }}
                        placeholder={currentUser ? "Share a prayer request..." : "Sign in to share a prayer request"}
                        disabled={!currentUser || submitting}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '16px',
                            fontWeight: 300,
                            outline: 'none',
                            fontFamily: 'inherit',
                            cursor: !currentUser ? 'not-allowed' : 'text'
                        }}
                    />
                    <button
                        onClick={handleSubmitRequest}
                        disabled={!currentUser || !newRequest.trim() || submitting}
                        style={{
                            color: (!currentUser || !newRequest.trim() || submitting) ? 'var(--text-tertiary)' : '#06b6d4',
                            transition: 'color 0.2s',
                            cursor: (!currentUser || !newRequest.trim() || submitting) ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (currentUser && newRequest.trim() && !submitting) {
                                e.currentTarget.style.color = '#0891b2';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (currentUser && newRequest.trim() && !submitting) {
                                e.currentTarget.style.color = '#06b6d4';
                            }
                        }}
                    >
                        <Send size={20} strokeWidth={2} />
                    </button>
                </div>

                {/* Feed */}
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px',
                        color: 'var(--text-tertiary)',
                        fontSize: '16px',
                        fontStyle: 'italic'
                    }}>
                        Loading prayer requests...
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {(prayerRequests.length > 0 ? prayerRequests : feedItems).map(item => (
                            <FeedItem key={item.id} item={item} />
                        ))}
                        {prayerRequests.length === 0 && feedItems.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '48px',
                                color: 'var(--text-tertiary)',
                                fontSize: '16px'
                            }}>
                                No prayer requests yet. Be the first to share!
                            </div>
                        )}
                    </div>
                )}

                {/* Flagging Modal */}
                {showFlagModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{
                            width: '100%',
                            maxWidth: '340px',
                            padding: '24px',
                            borderRadius: '12px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-surface)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ec4899' }}>
                                    <AlertTriangle size={24} />
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Report Content</h3>
                                </div>
                                <button onClick={() => setShowFlagModal(false)} style={{ color: 'var(--text-tertiary)' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 300 }}>
                                Why are you flagging this request? The team will review it shortly.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {['Inappropriate Content', 'Spam / Scam', 'Harassment', 'False Information'].map(reason => (
                                    <button
                                        key={reason}
                                        onClick={() => confirmFlag(reason)}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            background: 'var(--bg-app)',
                                            border: '1px solid var(--border-surface)',
                                            textAlign: 'left',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            fontWeight: 400,
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-active)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
