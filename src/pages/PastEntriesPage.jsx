import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const PastEntriesPage = () => {
    const navigate = useNavigate();

    // Dummy data for past entries
    const entries = [
        { id: 1, date: 'Jan 4, 2026', title: 'Walking in Faith', preview: 'Today I felt a strong sense of peace regarding...' },
        { id: 2, date: 'Jan 3, 2026', title: 'The Power of Prayer', preview: 'Struggling with patience, but God is teaching me...' },
        { id: 3, date: 'Jan 2, 2026', title: 'New Beginnings', preview: 'A fresh start. I am grateful for...' },
    ];

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
        </div>
    );
};

export default PastEntriesPage;
