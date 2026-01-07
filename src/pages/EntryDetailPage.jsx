import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Play, Save, X, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getJournalEntry, updateJournalEntry, getDailyContent } from '../firebase/firestore';
import { markdownToSafeHTML } from '../utils/markdown';

const EntryDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('verse'); // 'verse', 'prayer', 'devotional'
    const [entryData, setEntryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchEntry = async () => {
            if (!currentUser || !id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getJournalEntry(currentUser.uid, id);
                if (data) {
                    let verse = data.verse;
                    let prayer = data.prayer;
                    let devotional = data.devotional;

                    // If snapshot content is missing, try to fetch from dailyContent for that date
                    if ((!verse || !prayer || !devotional) && data.date) {
                        try {
                            const dailyContent = await getDailyContent(data.date);
                            if (dailyContent) {
                                verse = verse || dailyContent.verse;
                                prayer = prayer || dailyContent.prayer?.text;
                                devotional = devotional || dailyContent.devotional;
                            }
                        } catch (err) {
                            console.error('Error fetching historical daily content:', err);
                        }
                    }

                    setEntryData({
                        date: formatDate(data.date),
                        verse: verse || { text: 'No verse recorded for this day.', reference: '' },
                        prayer: prayer || 'No prayer recorded for this day.',
                        devotional: devotional || { title: 'No Devotional', content: 'No devotional content recorded for this day.' },
                        journalPrompt: data.prompt || 'Journal Entry',
                        journalEntry: data.content || ''
                    });
                    setEditedContent(data.content || '');
                }
            } catch (error) {
                console.error('Error fetching journal entry:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEntry();
    }, [currentUser, id]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleSave = async () => {
        if (!currentUser || !id || !editedContent.trim()) return;

        try {
            setSaving(true);
            await updateJournalEntry(currentUser.uid, id, { content: editedContent.trim() });
            setEntryData(prev => ({ ...prev, journalEntry: editedContent.trim() }));
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating journal entry:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const TabButton = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                flex: 1,
                padding: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: activeTab === id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                borderBottom: activeTab === id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                transition: 'all 0.3s ease',
                background: 'transparent'
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ padding: '20px', paddingTop: '40px', paddingBottom: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
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
                {entryData && (
                    <span style={{ fontSize: '14px', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '1px' }}>{entryData.date}</span>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
                    Loading entry...
                </div>
            ) : !entryData ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
                    Entry not found.
                </div>
            ) : (
                <>
                    {/* Tabs Container */}
                    <div className="glass" style={{ marginBottom: '24px', borderRadius: 'var(--radius-md)', display: 'flex', overflow: 'hidden' }}>
                        <TabButton id="verse" label="Verse" />
                        <TabButton id="prayer" label="Prayer" />
                        <TabButton id="devotional" label="Devotional" />
                    </div>

                    {/* Tab Content Area */}
                    <div className="glass fade-in" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px', minHeight: '200px' }}>
                        {activeTab === 'verse' && (
                            <div className="fade-in">
                                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-cyan)', display: 'block', marginBottom: '16px', fontWeight: 600 }}>Verse of the Day</span>
                                <h3 style={{ fontSize: '20px', lineHeight: '1.6', marginBottom: '16px', fontWeight: 500 }}>{entryData.verse.text}</h3>
                                {entryData.verse.reference && <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'right' }}>— {entryData.verse.reference}</p>}
                            </div>
                        )}

                        {activeTab === 'prayer' && (
                            <div className="fade-in" style={{ borderLeft: '2px solid var(--border-surface)', paddingLeft: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-cyan)', fontWeight: 600 }}>Today's Prayer</span>
                                    <button style={{ color: 'var(--accent-cyan)', background: 'transparent' }}><Play size={20} /></button>
                                </div>
                                <div
                                    style={{ lineHeight: '1.8', color: 'var(--text-primary)' }}
                                    dangerouslySetInnerHTML={{ __html: markdownToSafeHTML(entryData.prayer) }}
                                />
                            </div>
                        )}

                        {activeTab === 'devotional' && (
                            <div className="fade-in" style={{ borderLeft: '2px solid var(--border-surface)', paddingLeft: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-pink)', fontWeight: 600 }}>Daily Devotional</span>
                                    <button style={{ color: 'var(--accent-cyan)', background: 'transparent' }}><Play size={20} /></button>
                                </div>
                                <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{entryData.devotional.title}</h2>
                                <div
                                    style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}
                                    dangerouslySetInnerHTML={{ __html: markdownToSafeHTML(entryData.devotional.content || '') }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Journal Section */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', margin: 0 }}>Your Reflection</h3>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={{ color: 'var(--text-tertiary)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}
                                >
                                    <Edit2 size={16} /> Edit
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => { setIsEditing(false); setEditedContent(entryData.journalEntry); }}
                                        style={{ color: 'var(--text-tertiary)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}
                                    >
                                        <X size={16} /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || !editedContent.trim()}
                                        style={{ color: 'var(--accent-cyan)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', opacity: saving ? 0.5 : 1 }}
                                    >
                                        <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{
                                borderLeft: '2px solid var(--border-surface)',
                                paddingLeft: '16px',
                                marginBottom: '24px'
                            }}>
                                <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontStyle: 'italic', margin: 0 }}>
                                    {entryData.journalPrompt}
                                </p>
                            </div>
                            {isEditing ? (
                                <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    style={{
                                        width: '100%',
                                        minHeight: '200px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-primary)',
                                        fontSize: '16px',
                                        lineHeight: '1.6',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        resize: 'vertical',
                                        paddingLeft: '0'
                                    }}
                                    autoFocus
                                />
                            ) : (
                                <p style={{ lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                                    {entryData.journalEntry}
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default EntryDetailPage;
