import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, MoreHorizontal } from 'lucide-react';
import PrayerHandsIcon from '../components/PrayerHandsIcon';
import { useAuth } from '../context/AuthContext';
import { getUserPrayerRequests } from '../firebase/firestore';

const UserRequestsPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const requests = await getUserPrayerRequests(currentUser.uid);

                // Format requests for display
                const formattedRequests = requests.map(req => ({
                    id: req.id,
                    date: formatDate(req.createdAt),
                    content: req.content || '',
                    prayedCount: req.prayedCount || 0,
                    commentCount: req.commentCount || 0
                }));

                setMyRequests(formattedRequests);
            } catch (error) {
                console.error('Error fetching user prayer requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [currentUser]);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

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

            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px',
                    fontStyle: 'italic'
                }}>
                    Loading your prayer requests...
                </div>
            ) : !currentUser ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px'
                }}>
                    Please sign in to view your prayer requests
                </div>
            ) : myRequests.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px'
                }}>
                    No prayer requests yet. Share your first request in the Community!
                </div>
            ) : (
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
            )}
        </div>
    );
};

export default UserRequestsPage;
