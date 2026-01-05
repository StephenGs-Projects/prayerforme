import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Play } from 'lucide-react';

const EntryDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('verse'); // 'verse', 'prayer', 'devotional'

    // Mock data - normally would fetch based on ID
    const entryData = {
        date: 'Jan 4, 2026',
        verse: {
            text: '"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."',
            reference: 'Philippians 4:6'
        },
        prayer: 'Lord, thank you for this new day. Help me to trust You with all my heart and lean not on my own understanding. Guide my steps and fill me with Your peace that surpasses all understanding. Amen.',
        devotional: {
            title: 'Walking in Faith',
            content: ['Faith is not just a feeling; it is a choice to trust God even when we cannot see the path ahead.', 'In our daily lives, we are often faced with challenges that test our resolve. It is in these moments that our faith is truly refined.']
        },
        journalPrompt: 'What are you grateful for today?',
        journalEntry: 'Today I felt a strong sense of peace regarding the decisions I have to make. I am grateful for the support of my friends and the clarity that comes from prayer.'
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
                <span style={{ fontSize: '14px', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '1px' }}>{entryData.date}</span>
            </div>

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
                        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'right' }}>— {entryData.verse.reference}</p>
                    </div>
                )}

                {activeTab === 'prayer' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-cyan)', fontWeight: 600 }}>Today's Prayer</span>
                            <button style={{ color: 'var(--accent-cyan)' }}><Play size={20} /></button>
                        </div>
                        <p style={{ lineHeight: '1.8', color: 'var(--text-primary)' }}>{entryData.prayer}</p>
                    </div>
                )}

                {activeTab === 'devotional' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-pink)', fontWeight: 600 }}>Daily Devotional</span>
                            <button style={{ color: 'var(--accent-cyan)' }}><Play size={20} /></button>
                        </div>
                        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{entryData.devotional.title}</h2>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {entryData.devotional.content.map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                    </div>
                )}
            </div>

            {/* Journal Section */}
            <div>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Your Reflection</h3>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '12px', fontStyle: 'italic' }}>
                        {entryData.journalPrompt}
                    </p>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
                        {entryData.journalEntry}
                    </p>
                </div>
            </div>

        </div>
    );
};

export default EntryDetailPage;
