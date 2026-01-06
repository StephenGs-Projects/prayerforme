import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MessageCircle, MoreVertical, Send, Flag, X, AlertTriangle } from 'lucide-react';
import PrayerHandsIcon from '../components/PrayerHandsIcon';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import {
    getPrayerRequest,
    getComments,
    addComment,
    incrementPrayerCount,
    decrementPrayerCount,
    trackPrayerInteraction,
    removePrayerInteraction,
    hasUserPrayed,
    flagPrayerRequest
} from '../firebase/firestore';

const PrayerDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentUser } = useAuth();
    const { flagItem } = useCommunity();
    const [prayer, setPrayer] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPrayed, setIsPrayed] = useState(false);
    const [prayedCount, setPrayedCount] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showFlagModal, setShowFlagModal] = useState(false);
    const menuRef = useRef(null);

    // Fetch prayer request and comments
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch prayer request
                const prayerData = await getPrayerRequest(id);
                if (prayerData) {
                    setPrayer(prayerData);
                    setPrayedCount(prayerData.prayedCount || 0);
                }

                // Fetch comments
                const commentsData = await getComments(id);
                setComments(commentsData);

                // Check if current user has prayed
                if (currentUser) {
                    const prayed = await hasUserPrayed(id, currentUser.uid);
                    setIsPrayed(prayed);
                }
            } catch (error) {
                console.error('Error fetching prayer details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, currentUser]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFlagClick = () => {
        setShowFlagModal(true);
        setShowMenu(false);
    };

    const confirmFlag = async (reason) => {
        if (!currentUser) return;

        try {
            await flagPrayerRequest(id, currentUser.uid, reason);
            setShowFlagModal(false);
            navigate(-1);
        } catch (error) {
            console.error('Error flagging request:', error);
        }
    };

    const handlePrayClick = async () => {
        if (!currentUser) return;

        try {
            if (isPrayed) {
                await Promise.all([
                    decrementPrayerCount(id),
                    removePrayerInteraction(id, currentUser.uid)
                ]);
                setPrayedCount(c => Math.max(0, c - 1));
                setIsPrayed(false);
            } else {
                await Promise.all([
                    incrementPrayerCount(id),
                    trackPrayerInteraction(id, currentUser.uid)
                ]);
                setPrayedCount(c => c + 1);
                setIsPrayed(true);
            }
        } catch (error) {
            console.error('Error updating prayer:', error);
        }
    };

    const handleSubmitComment = async () => {
        if (!currentUser || !newComment.trim()) return;

        try {
            setSubmitting(true);

            await addComment(id, {
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                content: newComment.trim()
            });

            // Refresh comments
            const commentsData = await getComments(id);
            setComments(commentsData);

            setNewComment('');
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const getAvatarColor = (name) => {
        const colors = ['#fb7185', '#fb923c', '#fbbf24', '#a3e635', '#60a5fa', '#c084fc'];
        const index = (name || 'A').charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '32px 24px 120px 24px'
        }}>
            <div style={{ maxWidth: '448px', margin: '0 auto', width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px',
                            color: 'var(--text-tertiary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>Prayer Request</span>
                </div>

                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px',
                        color: 'var(--text-tertiary)',
                        fontSize: '16px',
                        fontStyle: 'italic'
                    }}>
                        Loading prayer request...
                    </div>
                ) : !prayer ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px',
                        color: 'var(--text-tertiary)',
                        fontSize: '16px'
                    }}>
                        Prayer request not found
                    </div>
                ) : (
                    <>

                {/* Main Prayer Card */}
                <div style={{
                    background: 'var(--bg-surface)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid var(--border-surface)',
                    marginBottom: '32px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: getAvatarColor(prayer.userName || 'Anonymous'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <span style={{ color: 'var(--bg-surface)', fontWeight: 300, fontSize: '18px' }}>
                                {(prayer.userName || 'A').charAt(0)}
                            </span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                {prayer.userName || 'Anonymous'}
                            </h3>
                            <p style={{ fontSize: '11px', color: 'var(--text-light)', letterSpacing: '0.05em' }}>
                                {formatTimestamp(prayer.createdAt)}
                            </p>
                        </div>

                        <div style={{ position: 'relative' }} ref={menuRef}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                style={{
                                    color: 'var(--text-light)',
                                    padding: '8px',
                                    transition: 'color 0.2s',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light)'}
                            >
                                <MoreVertical size={20} />
                            </button>

                            {showMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    width: '160px',
                                    borderRadius: '8px',
                                    zIndex: 10,
                                    overflow: 'hidden',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-surface)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <button
                                        onClick={() => { handleFlagClick(); setShowMenu(false); }}
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
                                            border: 'none',
                                            cursor: 'pointer',
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

                    <p style={{
                        lineHeight: 1.7,
                        marginBottom: '24px',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        fontWeight: 300,
                        fontSize: '16px'
                    }}>
                        {prayer.content}
                    </p>

                    <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--border-surface)', paddingTop: '16px' }}>
                        <button
                            onClick={handlePrayClick}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: isPrayed ? '#ed7b66' : 'var(--text-tertiary)',
                                background: 'transparent',
                                fontSize: '14px',
                                fontWeight: 300,
                                transition: 'color 0.2s',
                                cursor: 'pointer'
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
                            <PrayerHandsIcon size={20} color="currentColor" />
                            <span>{prayedCount} Prayed</span>
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', background: 'transparent', fontSize: '14px', fontWeight: 300, border: 'none', cursor: 'default' }}>
                            <MessageCircle size={20} strokeWidth={2} />
                            <span>{comments.length} Comments</span>
                        </button>
                    </div>
                </div>

                {/* Comments Section Header */}
                <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px', color: 'var(--text-secondary)' }}>Comments</h3>

                {/* Comments List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    {comments.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '24px',
                            color: 'var(--text-tertiary)',
                            fontSize: '14px'
                        }}>
                            No comments yet. Be the first to share encouragement!
                        </div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} style={{
                                background: 'var(--bg-surface)',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border-surface)'
                            }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: getAvatarColor(comment.userName || 'Anonymous'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        color: '#fff',
                                        fontWeight: 300,
                                        flexShrink: 0
                                    }}>
                                        {(comment.userName || 'A').charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>{comment.userName || 'Anonymous'}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{formatTimestamp(comment.createdAt)}</span>
                                        </div>
                                        <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)', fontWeight: 300, whiteSpace: 'pre-wrap' }}>
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Comment Input */}
                <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-surface)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !submitting) {
                                e.preventDefault();
                                handleSubmitComment();
                            }
                        }}
                        placeholder={currentUser ? "Write a supportive comment..." : "Sign in to comment"}
                        disabled={!currentUser || submitting}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '14px',
                            fontWeight: 300,
                            outline: 'none',
                            resize: 'none',
                            minHeight: '20px',
                            maxHeight: '120px',
                            fontFamily: 'inherit',
                            lineHeight: '1.5',
                            cursor: !currentUser ? 'not-allowed' : 'text'
                        }}
                    />
                    <button
                        onClick={handleSubmitComment}
                        disabled={!currentUser || !newComment.trim() || submitting}
                        style={{
                            color: (!currentUser || !newComment.trim() || submitting) ? 'var(--text-tertiary)' : '#06b6d4',
                            background: 'transparent',
                            border: 'none',
                            cursor: (!currentUser || !newComment.trim() || submitting) ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.5 : 1
                        }}
                    >
                        <Send size={20} strokeWidth={2} />
                    </button>
                </div>
                </>
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
                                <button onClick={() => setShowFlagModal(false)} style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
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
                                            cursor: 'pointer',
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

export default PrayerDetailPage;
