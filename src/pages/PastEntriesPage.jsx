import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserJournalEntries } from '../firebase/firestore';

const PastEntriesPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntries = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const journalEntries = await getUserJournalEntries(currentUser.uid);

                // Format entries for display
                const formattedEntries = journalEntries.map(entry => ({
                    id: entry.id,
                    date: formatDate(entry.date),
                    title: entry.prompt || 'Journal Entry',
                    preview: entry.content || ''
                }));

                setEntries(formattedEntries);
            } catch (error) {
                console.error('Error fetching journal entries:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, [currentUser]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div style={{ padding: '20px', paddingTop: '40px', paddingBottom: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="glass"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        color: 'var(--text-secondary)'
                    }}
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '24px', margin: 0 }}>Past Entries</h1>
            </div>

            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px',
                    fontStyle: 'italic'
                }}>
                    Loading journal entries...
                </div>
            ) : !currentUser ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px'
                }}>
                    Please sign in to view your journal entries
                </div>
            ) : entries.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px'
                }}>
                    No journal entries yet. Start writing to see them here!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {entries.map(entry => (
                        <button
                            key={entry.id}
                            onClick={() => navigate(`/history/${entry.id}`)}
                            className="glass"
                            style={{
                                padding: '20px',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                textAlign: 'left',
                                width: '100%',
                                transition: 'transform 0.2s ease, background 0.2s ease'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: 600 }}>
                                    <Calendar size={14} />
                                    <span>{entry.date}</span>
                                </div>
                                <h3 style={{ fontSize: '18px', marginBottom: '6px', color: 'var(--text-primary)' }}>{entry.title}</h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {entry.preview}
                                </p>
                            </div>
                            <ChevronRight size={20} color="var(--text-tertiary)" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PastEntriesPage;
