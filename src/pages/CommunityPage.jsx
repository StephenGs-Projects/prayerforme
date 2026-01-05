import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MoreVertical, Send, Flag, X, AlertTriangle } from 'lucide-react';
import PrayerHandsIcon from '../components/PrayerHandsIcon';
import { useFlow } from '../context/FlowContext';
import { useCommunity } from '../context/CommunityContext';

const CommunityPage = () => {
    const navigate = useNavigate();
    const { setIsNavVisible } = useFlow();
    const { feedItems, flagItem } = useCommunity();
    const [flaggingId, setFlaggingId] = useState(null);
    const [showFlagModal, setShowFlagModal] = useState(false);

    useEffect(() => {
        setIsNavVisible(true);
    }, [setIsNavVisible]);

    const handleFlagClick = (id) => {
        setFlaggingId(id);
        setShowFlagModal(true);
    };

    const confirmFlag = (reason) => {
        flagItem(flaggingId, reason);
        setShowFlagModal(false);
        setFlaggingId(null);
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
        const [count, setCount] = useState(item.prayedCount);
        const [showMenu, setShowMenu] = useState(false);
        const menuRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (menuRef.current && !menuRef.current.contains(event.target)) {
                    setShowMenu(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const handlePrayClick = (e) => {
            e.stopPropagation();
            if (isPrayed) {
                setCount(c => c - 1);
                setIsPrayed(false);
            } else {
                setCount(c => c + 1);
                setIsPrayed(true);
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
                        background: getAvatarColor(item.name),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <span style={{ color: 'var(--bg-surface)', fontWeight: 300, fontSize: '18px' }}>
                            {item.name.charAt(0)}
                        </span>
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
                        placeholder="Share a prayer request..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '16px',
                            fontWeight: 300,
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                    <button style={{
                        color: '#06b6d4',
                        transition: 'color 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#0891b2'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#06b6d4'}
                    >
                        <Send size={20} strokeWidth={2} />
                    </button>
                </div>

                {/* Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {feedItems.map(item => <FeedItem key={item.id} item={item} />)}
                </div>

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
