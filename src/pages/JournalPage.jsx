import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { useAuth } from '../context/AuthContext';
import { saveJournalEntry, getDailyContent, getLatestDailyContent } from '../firebase/firestore';

const JournalPage = () => {
    const [selectedPrompt, setSelectedPrompt] = useState(0);
    const [entry, setEntry] = useState('');
    const [saving, setSaving] = useState(false);
    const [dailyContent, setDailyContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showNav } = useFlow();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse URL params
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const isManual = queryParams.get('manual') === 'true';

    // Fetch daily content for journal prompts
    useEffect(() => {
        const fetchDailyContent = async () => {
            try {
                setLoading(true);

                // Get today's date in YYYY-MM-DD format
                const today = new Date().toISOString().split('T')[0];

                // Try to get today's content first
                let content = await getDailyContent(today);

                // If no content for today, get the latest published content
                if (!content) {
                    content = await getLatestDailyContent();
                }

                setDailyContent(content);
            } catch (err) {
                console.error('Error fetching daily content:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDailyContent();
    }, []);

    // Default prompts as fallback
    const defaultPrompts = [
        "What are you grateful for today?",
        "Where did you see God work this week?",
        "What is burdening your heart right now?"
    ];

    // Use Firestore prompts if available, otherwise use defaults
    const prompts = dailyContent?.journalPrompts?.filter(p => p.trim()) || defaultPrompts;

    const handleComplete = async () => {
        // Save journal entry if user is logged in and has written something
        if (currentUser && entry.trim()) {
            try {
                setSaving(true);

                // Get today's date in YYYY-MM-DD format
                const today = new Date().toISOString().split('T')[0];

                // Save the journal entry
                await saveJournalEntry(currentUser.uid, today, {
                    prompt: prompts[selectedPrompt],
                    content: entry.trim()
                });
            } catch (error) {
                console.error('Error saving journal entry:', error);
                // Continue to navigation even if save fails
            } finally {
                setSaving(false);
            }
        }

        if (isManual) {
            navigate('/entries');
        } else {
            showNav();
            navigate('/community');
        }
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
                    marginBottom: '16px',
                    fontFamily: 'var(--font-sans)'
                }}>
                    Journal
                </h1>
                <p style={{
                    fontSize: '16px',
                    color: 'var(--text-tertiary)',
                    fontWeight: 300,
                    marginBottom: '48px'
                }}>
                    Reflect on today's prayer and devotional.
                </p>

                {/* Prompt Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    {loading ? (
                        <p style={{
                            fontSize: '14px',
                            color: 'var(--text-tertiary)',
                            fontStyle: 'italic',
                            textAlign: 'center',
                            padding: '20px'
                        }}>
                            Loading prompts...
                        </p>
                    ) : prompts.map((prompt, index) => {
                        const isSelected = selectedPrompt === index;
                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedPrompt(index)}
                                style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    background: isSelected ? 'var(--bg-surface-active)' : 'var(--bg-surface)',
                                    border: isSelected ? '2px solid var(--accent-cyan)' : '2px solid var(--border-surface)',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.borderColor = 'var(--border-accent)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.borderColor = 'var(--border-surface)';
                                    }
                                }}
                            >
                                <span style={{
                                    fontSize: '16px',
                                    fontWeight: 300,
                                    color: isSelected ? 'var(--text-active)' : 'var(--text-secondary)',
                                    flex: 1
                                }}>
                                    {prompt}
                                </span>
                                {isSelected && (
                                    <Check
                                        size={20}
                                        color="#06b6d4"
                                        strokeWidth={2}
                                        style={{ flexShrink: 0, marginLeft: '12px' }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Writing Area */}
                <div style={{ marginBottom: '32px' }}>
                    {/* Decorative Line */}
                    <div style={{
                        width: '48px',
                        height: '2px',
                        backgroundColor: '#d97706',
                        marginBottom: '24px'
                    }} />

                    <textarea
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="Start writing..."
                        style={{
                            width: '100%',
                            height: '256px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '16px',
                            fontWeight: 300,
                            lineHeight: 1.8,
                            resize: 'none',
                            outline: 'none',
                            fontFamily: 'var(--font-sans)'
                        }}
                    />
                </div>

                {/* Complete/Skip Button */}
                <button
                    onClick={handleComplete}
                    disabled={saving}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: entry.trim() ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                        background: 'transparent',
                        border: 'none',
                        fontWeight: entry.trim() ? 500 : 300,
                        margin: '0 auto',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        transition: 'color 0.2s',
                        fontSize: '16px',
                        letterSpacing: '0.02em',
                        opacity: saving ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (!saving) {
                            e.currentTarget.style.color = entry.trim() ? '#38bdf8' : 'var(--text-secondary)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!saving) {
                            e.currentTarget.style.color = entry.trim() ? 'var(--accent-cyan)' : 'var(--text-tertiary)';
                        }
                    }}
                >
                    <span>{saving ? 'Saving...' : (entry.trim() ? 'Complete' : (isManual ? 'Cancel' : 'Skip'))}</span>
                    <ArrowRight size={16} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};

export default JournalPage;
