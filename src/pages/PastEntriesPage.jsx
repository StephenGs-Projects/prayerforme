import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserJournalEntries, deleteJournalEntry } from '../firebase/firestore';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const PastEntriesPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

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

    const handleDelete = (e, entryId) => {
        e.stopPropagation();
        setEntryToDelete(entryId);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!entryToDelete) return;

        try {
            await deleteJournalEntry(currentUser.uid, entryToDelete);
            setEntries(entries.filter(entry => entry.id !== entryToDelete));
            setIsModalOpen(false);
            setEntryToDelete(null);
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Failed to delete entry. Please try again.');
        }
    };

    return (
        <div style={{ padding: '20px', paddingTop: '40px', paddingBottom: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate('/more')}
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

                <button
                    onClick={() => navigate('/journal?manual=true')}
                    className="glass"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-cyan)'
                    }}
                >
                    <Plus size={24} />
                </button>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {entries.map(entry => (
                        <div
                            key={entry.id}
                            className="glass"
                            style={{
                                padding: '24px',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                flexDirection: 'column',
                                textAlign: 'left',
                                width: '100%',
                                transition: 'transform 0.2s ease, background 0.2s ease',
                                cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                            onClick={() => navigate(`/history/${entry.id}`)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'var(--bg-surface)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px' }}>
                                    <Calendar size={14} />
                                    <span>{entry.date}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        onClick={(e) => handleDelete(e, entry.id)}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-tertiary)',
                                            background: 'transparent',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.stopPropagation();
                                            e.currentTarget.style.color = '#ef4444';
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.stopPropagation();
                                            e.currentTarget.style.color = 'var(--text-tertiary)';
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <ChevronRight size={18} color="var(--text-tertiary)" />
                                </div>
                            </div>

                            <p style={{
                                fontSize: '17px',
                                color: 'var(--text-primary)',
                                lineHeight: '1.6',
                                marginBottom: '16px',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                fontWeight: 400
                            }}>
                                {entry.preview}
                            </p>

                            <div style={{
                                paddingLeft: '16px',
                                borderLeft: '2px solid var(--border-surface)',
                                marginTop: '4px'
                            }}>
                                <p style={{
                                    fontSize: '13px',
                                    color: 'var(--text-tertiary)',
                                    lineHeight: '1.5',
                                    fontStyle: 'italic',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {entry.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DeleteConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default PastEntriesPage;
