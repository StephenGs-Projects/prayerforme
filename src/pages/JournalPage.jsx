import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveJournalEntry } from '../firebase/firestore';

const JournalPage = () => {
    const [selectedPrompt, setSelectedPrompt] = useState(0);
    const [entry, setEntry] = useState('');
    const [saving, setSaving] = useState(false);
    const { showNav } = useFlow();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const prompts = [
        "What are you grateful for today?",
        "Where did you see God work this week?",
        "What is burdening your heart right now?"
    ];

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

        showNav();
        navigate('/community');
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
                    {prompts.map((prompt, index) => {
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
                    <span>{saving ? 'Saving...' : (entry.trim() ? 'Complete' : 'Skip')}</span>
                    <ArrowRight size={16} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};

export default JournalPage;
