import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, MoreHorizontal } from 'lucide-react';
import PrayerHandsIcon from '../components/PrayerHandsIcon';

const UserRequestsPage = () => {
    const navigate = useNavigate();

    // Dummy data for "My Requests"
    const myRequests = [
        {
            id: 101,
            date: 'Jan 4, 2026',
            content: "Praying for guidance in my new job role...",
            prayedCount: 12,
            commentCount: 3
        },
        {
            id: 102,
            date: 'Dec 28, 2025',
            content: "Health and healing for my friend who is sick.",
            prayedCount: 45,
            commentCount: 8
        },
    ];

    return (
        <div style={{ padding: '20px', paddingTop: '40px', paddingBottom: '100px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="glass"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', color: 'var(--text-secondary)' }}
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '24px', margin: 0 }}>My Requests</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {myRequests.map(req => (
                    <div
                        key={req.id}
                        onClick={() => navigate(`/community/${req.id}`)}
                        className="glass"
                        style={{ padding: '20px', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{req.date}</span>
                            <MoreHorizontal size={18} color="var(--text-tertiary)" />
                        </div>

                        <p style={{ marginBottom: '16px', fontSize: '15px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {req.content}
                        </p>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--accent-cyan)' }}>
                                <PrayerHandsIcon size={16} color="var(--accent-cyan)" />
                                <span>{req.prayedCount} Prayed</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                <MessageCircle size={16} />
                                <span>{req.commentCount} Comments</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserRequestsPage;
