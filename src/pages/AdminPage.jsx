import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import {
    ChevronLeft, Plus, Calendar, Save, Send, Pencil, Trash2, Bold, Italic, List, Music, Upload,
    LayoutDashboard, FileText, Users, ShieldAlert, Settings, LogOut, Search, MoreVertical, CheckCircle, XCircle, ShieldCheck, MessageCircle
} from 'lucide-react';

// --- Shared Components ---

const RichTextEditor = ({ value, onChange, placeholder, style }) => {
    const insertFormat = (symbol, closeSymbol = null) => {
        const textarea = document.getElementById('rich-textarea-' + placeholder?.replace(/\s/g, '-'));
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = value || '';
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const effectiveClose = closeSymbol || symbol;
        const newText = before + symbol + selection + effectiveClose + after;

        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + symbol.length, end + symbol.length);
        }, 0);
    };

    return (
        <div className="glass" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', ...style }}>
            <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)' }}>
                <button onClick={() => insertFormat('**')} style={{ padding: '4px', borderRadius: '4px', color: 'var(--text-secondary)' }} title="Bold"><Bold size={16} /></button>
                <button onClick={() => insertFormat('*')} style={{ padding: '4px', borderRadius: '4px', color: 'var(--text-secondary)' }} title="Italic"><Italic size={16} /></button>
                <button onClick={() => insertFormat('\n- ', '')} style={{ padding: '4px', borderRadius: '4px', color: 'var(--text-secondary)' }} title="Bullet List"><List size={16} /></button>
            </div>
            <textarea
                id={'rich-textarea-' + placeholder?.replace(/\s/g, '-')}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', padding: '16px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical', minHeight: '120px', outline: 'none' }}
            />
        </div>
    );
};

const AudioUpload = ({ label, value, onChange }) => (
    <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</h3>
        <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <Music size={20} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <input type="file" accept="audio/*" onChange={(e) => { const file = e.target.files[0]; if (file) onChange(file.name); }} style={{ display: 'none' }} id={`audio-upload-${label}`} />
                <label htmlFor={`audio-upload-${label}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{value ? value : 'Upload Audio File'}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{value ? 'Click to change' : 'MP3 or WAV'}</span>
                </label>
            </div>
            {value && <Upload size={16} color="var(--accent-cyan)" />}
        </div>
    </div>
);

// --- Sub-Views ---

const AnalyticsGraph = () => {
    const [timeline, setTimeline] = useState('Month');
    const [activeMetrics, setActiveMetrics] = useState({
        total: true,
        premium: true,
        prayers: true
    });

    // Dummy Data Generators
    const formatDayLabel = (h) => {
        if (h === 0) return '12 AM';
        if (h === 12) return '12 PM';
        return h < 12 ? `${h} AM` : `${h - 12} PM`;
    };

    const dataPoints = {
        Day: Array.from({ length: 24 }, (_, i) => ({ label: formatDayLabel(i), total: 1200 + Math.random() * 50, premium: 400 + Math.random() * 30, prayers: 300 + Math.random() * 40 })),
        Week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ label: day, total: 1100 + Math.random() * 200, premium: 350 + Math.random() * 100, prayers: 250 + Math.random() * 150 })),
        Month: Array.from({ length: 30 }, (_, i) => ({
            label: i % 7 === 0 ? `Jan ${i + 1}` : i + 1,
            total: 1000 + i * 10 + Math.random() * 50,
            premium: 300 + i * 4 + Math.random() * 30,
            prayers: 200 + i * 5 + Math.random() * 80
        })),
        Year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(mon => ({ label: mon, total: 500 + Math.random() * 1000, premium: 100 + Math.random() * 400, prayers: 150 + Math.random() * 500 })),
    };

    const currentData = dataPoints[timeline];
    // Filter labels to keep graph clean
    const step = timeline === 'Day' ? 4 : timeline === 'Month' ? 7 : 1;
    const labels = currentData.filter((_, i) => i % step === 0);

    const maxVal = Math.max(...currentData.map(d => Math.max(d.total, d.premium, d.prayers))) * 1.2;

    const getPath = (data, key) => {
        if (data.length < 2) return '';
        const width = 1000;
        const height = 260; // Leave 40px for labels at bottom
        const points = data.map((d, i) => ({
            x: (i / (data.length - 1)) * width,
            y: height - (d[key] / maxVal) * height
        }));

        let path = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            path += ` C ${cp1x},${p0.y} ${cp1x},${p1.y} ${p1.x},${p1.y}`;
        }
        return path;
    };

    const MetricToggle = ({ id, label, color, active }) => (
        <button
            onClick={() => setActiveMetrics(prev => ({ ...prev, [id]: !prev[id] }))}
            style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                borderRadius: 'var(--radius-md)', background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: active ? `1px solid ${color}` : '1px solid transparent',
                opacity: active ? 1 : 0.5, transition: 'all 0.2s', cursor: 'pointer'
            }}
        >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        </button>
    );

    return (
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <MetricToggle id="total" label="Total Users" color="var(--accent-cyan)" active={activeMetrics.total} />
                    <MetricToggle id="premium" label="Premium Users" color="var(--accent-pink)" active={activeMetrics.premium} />
                    <MetricToggle id="prayers" label="Active Prayers" color="#10b981" active={activeMetrics.prayers} />
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
                    {['Day', 'Week', 'Month', 'Year'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTimeline(t)}
                            style={{
                                padding: '6px 16px', borderRadius: 'var(--radius-sm)', border: 'none',
                                background: timeline === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: timeline === t ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                <svg viewBox="0 0 1000 300" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    {/* Horizontal Grid Lines */}
                    {[0, 0.25, 0.5, 0.75].map(v => (
                        <line
                            key={v} x1="0" y1={v * 260} x2="1000" y2={v * 260}
                            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
                        />
                    ))}
                    {/* Baseline */}
                    <line x1="0" y1="260" x2="1000" y2="260" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                    {/* Vertical Markers aligned with labels */}
                    {labels.map((d, i) => {
                        const x = (currentData.indexOf(d) / (currentData.length - 1)) * 1000;
                        return (
                            <React.Fragment key={i}>
                                <line
                                    x1={x} y1="0" x2={x} y2="260"
                                    stroke="rgba(255,255,255,0.03)" strokeWidth="1"
                                />
                                <text
                                    x={x} y="285"
                                    textAnchor="middle"
                                    fill="var(--text-tertiary)"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                >
                                    {d.label}
                                </text>
                            </React.Fragment>
                        );
                    })}

                    {/* Premium Area Fill */}
                    {activeMetrics.premium && (
                        <>
                            <path
                                d={`${getPath(currentData, 'premium')} L 1000,260 L 0,260 Z`}
                                fill="url(#grad-premium)" opacity="0.1"
                            />
                            <path d={getPath(currentData, 'premium')} fill="none" stroke="var(--accent-pink)" strokeWidth="3" />
                        </>
                    )}

                    {/* Prayers Area Fill */}
                    {activeMetrics.prayers && (
                        <>
                            <path
                                d={`${getPath(currentData, 'prayers')} L 1000,260 L 0,260 Z`}
                                fill="url(#grad-prayers)" opacity="0.1"
                            />
                            <path d={getPath(currentData, 'prayers')} fill="none" stroke="#10b981" strokeWidth="3" />
                        </>
                    )}

                    {/* Total Area Fill */}
                    {activeMetrics.total && (
                        <>
                            <path
                                d={`${getPath(currentData, 'total')} L 1000,260 L 0,260 Z`}
                                fill="url(#grad-total)" opacity="0.1"
                            />
                            <path d={getPath(currentData, 'total')} fill="none" stroke="var(--accent-cyan)" strokeWidth="3" />
                        </>
                    )}

                    <defs>
                        <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-cyan)" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                        <linearGradient id="grad-premium" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-pink)" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                        <linearGradient id="grad-prayers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
};

const Overview = ({ dashboardStats, posts }) => {
    const recentPublished = (posts || [])
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Dashboard Overview</h2>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {dashboardStats.map((stat, index) => (
                    <div key={index} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ padding: '8px', borderRadius: '50%', background: 'var(--bg-surface-active)', color: 'var(--accent-cyan)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon size={18} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>{stat.trend}</span>
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '28px', fontWeight: 700 }}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics Graph */}
            <AnalyticsGraph />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface-active)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={18} color="var(--text-tertiary)" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', margin: 0 }}>New user registered: <strong>Sarah M.</strong></p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Recent Published</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {recentPublished.length === 0 ? (
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No published posts yet.</p>
                        ) : recentPublished.map(post => {
                            const rate = post.opens > 0 ? Math.round((post.prayers / post.opens) * 100) : 0;
                            return (
                                <div key={post.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{post.title}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>{post.date}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{rate}%</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Engagement</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContentView = ({ posts, onEdit, onDelete, onCreate }) => (
    <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px' }}>Content Management</h2>
            <button onClick={onCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--primary-gradient)', color: 'white', fontWeight: 600 }}>
                <Plus size={20} />
                <span>New Entry</span>
            </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.map(post => (
                <div key={post.id} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: post.status === 'published' ? 'var(--accent-cyan)' : 'var(--text-tertiary)', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', background: post.status === 'published' ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.05)' }}>
                                {post.status}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{post.date || 'No Date'}</span>
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 600 }}>{post.title}</span>
                    </div>

                    {/* Engagement Stats */}
                    {post.status === 'published' && (
                        <div style={{ display: 'flex', gap: '24px', marginRight: '32px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{post.opens || 0}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Reads</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{post.prayers || 0}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Prayers</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>
                                    {post.opens > 0 ? Math.round((post.prayers / post.opens) * 100) : 0}%
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Rate</div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => onEdit(post)} style={{ padding: '8px', color: 'var(--text-secondary)' }}><Pencil size={18} /></button>
                        <button onClick={() => onDelete(post.id)} style={{ padding: '8px', color: 'var(--accent-pink)' }}><Trash2 size={18} /></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const UsersView = ({ users }) => (
    <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px' }}>User Management</h2>
            <div className="glass" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', width: '300px' }}>
                <Search size={18} color="var(--text-tertiary)" />
                <input type="text" placeholder="Search users..." style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none' }} />
            </div>
        </div>

        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <tr>
                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>User</th>
                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Role</th>
                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Joined</th>
                        <th style={{ padding: '16px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{user.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '16px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 500, color: user.role === 'Premium' ? 'var(--accent-pink)' : 'var(--text-secondary)' }}>
                                    {user.role}
                                </span>
                            </td>
                            <td style={{ padding: '16px' }}>
                                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', background: user.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: user.status === 'Active' ? '#10b981' : '#ef4444' }}>
                                    {user.status}
                                </span>
                            </td>
                            <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>{user.joined}</td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                <button style={{ color: 'var(--text-tertiary)' }}><MoreVertical size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const PrayersView = () => {
    const { feedItems } = useCommunity();
    const [comments, setComments] = useState({});

    const handleComment = (id) => {
        const comment = comments[id];
        if (!comment?.trim()) return;
        // In a real app, this would dispatch an action or API call
        alert(`Admin reply sent to prayer request #${id}`);
        setComments({ ...comments, [id]: '' });
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Community Prayer Requests</h2>
                <p style={{ color: 'var(--text-tertiary)' }}>Monitor and engage with requests from the community feed.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {feedItems.map(item => (
                    <div key={item.id} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{item.time}</div>
                                </div>
                            </div>
                        </div>
                        <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                            {item.content}
                        </p>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <textarea
                                    placeholder="Write a supportive reply..."
                                    className="glass"
                                    value={comments[item.id] || ''}
                                    onChange={(e) => setComments({ ...comments, [item.id]: e.target.value })}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    style={{
                                        flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)',
                                        border: 'none', color: 'var(--text-primary)', outline: 'none',
                                        resize: 'none', minHeight: '44px', maxHeight: '150px',
                                        fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.5'
                                    }}
                                />
                                <button
                                    onClick={() => handleComment(item.id)}
                                    style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--accent-cyan)', color: '#000', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ModerationView = () => {
    const { flaggedItems, approveItem, rejectItem } = useCommunity();

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Moderation Queue</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {flaggedItems.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No flagged items. Good job!</div>
                ) : flaggedItems.map(item => (
                    <div key={item.id} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 600 }}>{item.reason}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Reported by {item.reporter} • {item.time}</span>
                            </div>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '14px', color: 'var(--text-primary)' }}>
                            "{item.content}"
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => approveItem(item.id)}
                                style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <CheckCircle size={18} /> Keep
                            </button>
                            <button
                                onClick={() => rejectItem(item.id)}
                                style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <XCircle size={18} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Admin Page ---

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, content, users, moderation, settings
    const [viewMode, setViewMode] = useState('list'); // list, editor (for content tab)
    const [editingId, setEditingId] = useState(null);

    // Bypass desktop restriction
    React.useEffect(() => {
        document.body.classList.add('admin-view');
        return () => document.body.classList.remove('admin-view');
    }, []);

    // --- Data & Handlers ---

    const [posts, setPosts] = useState([
        { id: 1, status: 'published', date: '2026-01-04', title: 'Walking in Faith', opens: 842, prayers: 512, devotionalTitle: 'Walking in Faith' },
        { id: 2, status: 'published', date: '2026-01-03', title: 'The Power of Prayer', opens: 750, prayers: 380, devotionalTitle: 'The Power of Prayer' },
        { id: 3, status: 'draft', date: '2026-01-05', title: 'Trusting God', opens: 0, prayers: 0, devotionalTitle: 'Trusting God' },
    ]);

    const initialForm = { date: '', verseText: '', verseReference: '', prayerText: '', prayerAudio: '', devotionalTitle: '', devotionalContent: '', devotionalAudio: '', prompt1: '', prompt2: '', prompt3: '', adImage: null, adLink: '', showAd: true, adDuration: 5 };
    const [formData, setFormData] = useState(initialForm);

    const handleCreateNew = () => { setEditingId(null); setFormData(initialForm); setViewMode('editor'); };
    const handleEdit = (post) => { setEditingId(post.id); setFormData({ ...initialForm, ...post, title: post.devotionalTitle || post.title }); setViewMode('editor'); };
    const handleDelete = (id) => { if (window.confirm('Delete this post?')) setPosts(posts.filter(p => p.id !== id)); };
    const { setDailyPost } = useCommunity();

    const handleSavePost = (status) => {
        const newPostData = {
            id: editingId || Date.now(),
            status,
            date: formData.date,
            title: formData.devotionalTitle || 'Untitled',
            opens: formData.opens || 0,
            prayers: formData.prayers || 0,
            ...formData
        };

        if (editingId) setPosts(posts.map(p => p.id === editingId ? newPostData : p));
        else setPosts([newPostData, ...posts]);

        if (status === 'published') {
            setDailyPost({
                adImage: formData.adImage,
                adLink: formData.adLink,
                showAd: formData.showAd,
                adDuration: formData.adDuration || 5,
                title: formData.devotionalTitle,
                content: formData.devotionalContent
            });
        }

        setViewMode('list');
    };

    const dashboardStats = [
        { label: 'Total Users', value: '1,284', trend: '+12% this month', icon: Users },
        { label: 'Premium Users', value: '412', trend: '32% of total', icon: ShieldCheck },
        { label: 'Engagement Rate', value: '62%', trend: '+4% vs avg', icon: CheckCircle },
        { label: 'Today\'s Prayers', value: '342', trend: '+15% from avg', icon: FileText },
    ];

    const dummyUsers = [
        { id: 1, name: 'Sarah M.', email: 'sarah@example.com', role: 'Premium', status: 'Active', joined: 'Jan 2025' },
        { id: 2, name: 'David K.', email: 'david@example.com', role: 'Free', status: 'Active', joined: 'Dec 2024' },
        { id: 3, name: 'Troll User', email: 'troll@example.com', role: 'Free', status: 'Suspended', joined: 'Jan 2026' },
    ];

    const dummyFlagged = [
        { id: 1, content: "This is spam content...", reporter: 'John D.', time: '2h ago', reason: 'Spam' },
        { id: 2, content: "Inappropriate language here...", reporter: 'Emily W.', time: '5h ago', reason: 'Harassment' },
        { id: 3, content: "Buy my crypto!", reporter: 'Mike T.', time: '1d ago', reason: 'Spam' },
    ];

    // --- Render ---

    const SidebarItem = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => { setActiveTab(id); setViewMode('list'); }}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                color: activeTab === id ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: activeTab === id ? 'var(--bg-surface-active)' : 'transparent',
                fontWeight: activeTab === id ? 600 : 500,
                transition: 'all 0.2s',
                marginBottom: '4px'
            }}
        >
            <Icon size={20} color={activeTab === id ? 'var(--accent-cyan)' : 'currentColor'} />
            {label}
        </button>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>

            {/* Sidebar */}
            <div className="glass" style={{ width: '280px', borderRight: '1px solid var(--border-surface)', borderTop: 'none', borderBottom: 'none', borderLeft: 'none', padding: '24px', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50 }}>
                <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#000' }}>Prayer For Me</h1>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', letterSpacing: '2px', textTransform: 'uppercase' }}>Admin Panel</span>
                </div>

                <div style={{ flex: 1 }}>
                    <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
                    <SidebarItem id="content" label="Content" icon={FileText} />
                    <SidebarItem id="prayers" label="Prayers" icon={MessageCircle} />
                    <SidebarItem id="users" label="Users" icon={Users} />
                    <SidebarItem id="moderation" label="Moderation" icon={ShieldAlert} />
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                    <button onClick={() => navigate('/')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-tertiary)' }}>
                        <LogOut size={20} />
                        Exit Admin
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ marginLeft: '280px', flex: 1, padding: '40px', maxWidth: '1200px' }}>

                {activeTab === 'dashboard' && <Overview dashboardStats={dashboardStats} posts={posts} />}

                {activeTab === 'prayers' && <PrayersView />}

                {activeTab === 'users' && <UsersView users={dummyUsers} />}

                {activeTab === 'moderation' && <ModerationView />}

                {activeTab === 'content' && (
                    viewMode === 'list' ? (
                        <ContentView posts={posts} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreateNew} />
                    ) : (
                        // Embedded Editor for Content Tab
                        <div className="fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <button onClick={() => setViewMode('list')} className="glass" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                    <ChevronLeft size={24} />
                                </button>
                                <span style={{ fontWeight: 600 }}>{editingId ? 'Edit Entry' : 'New Entry'}</span>
                                <div style={{ width: '40px' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
                                <section>
                                    <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Schedule</h3>
                                    <input type="date" className="glass" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Verse</h3>
                                    <textarea placeholder="Verse Text..." className="glass" value={formData.verseText} onChange={e => setFormData({ ...formData, verseText: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', color: 'var(--text-primary)', fontFamily: 'inherit', minHeight: '100px', resize: 'vertical', marginBottom: '12px' }} />
                                    <input type="text" placeholder="Reference" className="glass" value={formData.verseReference} onChange={e => setFormData({ ...formData, verseReference: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Prayer</h3>
                                    <RichTextEditor placeholder="Prayer Text..." value={formData.prayerText} onChange={val => setFormData({ ...formData, prayerText: val })} style={{ marginBottom: '16px' }} />
                                    <AudioUpload label="Prayer Audio" value={formData.prayerAudio} onChange={val => setFormData({ ...formData, prayerAudio: val })} />
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Devotional</h3>
                                    <input type="text" placeholder="Title" className="glass" value={formData.devotionalTitle} onChange={e => setFormData({ ...formData, devotionalTitle: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }} />
                                    <RichTextEditor placeholder="Devotional Content..." value={formData.devotionalContent} onChange={val => setFormData({ ...formData, devotionalContent: val })} style={{ minHeight: '200px', marginBottom: '16px' }} />
                                    <AudioUpload label="Devotional Audio" value={formData.devotionalAudio} onChange={val => setFormData({ ...formData, devotionalAudio: val })} />
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Journal Prompts</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                                        {[1, 2, 3].map(num => (
                                            <RichTextEditor key={num} placeholder={`Prompt ${num}`} value={formData[`prompt${num}`]} onChange={val => setFormData({ ...formData, [`prompt${num}`]: val })} style={{ minHeight: '60px' }} />
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Ad Content (Free Users Only)</h3>
                                    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Include Ad Today</h4>
                                                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Show this ad to free users between Devotional and Journal</p>
                                            </div>
                                            <button
                                                onClick={() => setFormData({ ...formData, showAd: !formData.showAd })}
                                                style={{
                                                    width: '50px', height: '26px', borderRadius: '13px',
                                                    background: formData.showAd ? 'var(--accent-cyan)' : 'var(--bg-surface-active)',
                                                    position: 'relative', transition: 'background 0.3s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                                                    position: 'absolute', top: '3px', left: formData.showAd ? '27px' : '3px',
                                                    transition: 'left 0.3s'
                                                }} />
                                            </button>
                                        </div>

                                        {formData.showAd && (
                                            <>
                                                <div>
                                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Recommended Size: 1080x1920 (Vertical)</p>
                                                    <div
                                                        onClick={() => document.getElementById('ad-image-upload').click()}
                                                        style={{
                                                            width: '100%', height: '120px', borderRadius: 'var(--radius-sm)', border: '2px dashed rgba(255,255,255,0.1)',
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                            background: formData.adImage ? `url(${formData.adImage}) center/cover no-repeat` : 'transparent'
                                                        }}
                                                    >
                                                        {!formData.adImage && (
                                                            <>
                                                                <Upload size={24} color="var(--text-tertiary)" />
                                                                <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Upload Ad Image</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input
                                                        id="ad-image-upload" type="file" accept="image/*" style={{ display: 'none' }}
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setFormData({ ...formData, adImage: reader.result });
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                    {formData.adImage && (
                                                        <button
                                                            onClick={() => setFormData({ ...formData, adImage: null })}
                                                            style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent-pink)' }}
                                                        >
                                                            Remove Image
                                                        </button>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', gap: '20px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Ad Destination Link</h4>
                                                        <input
                                                            type="text"
                                                            placeholder="https://youstore.com/product"
                                                            className="glass"
                                                            value={formData.adLink || ''}
                                                            onChange={e => setFormData({ ...formData, adLink: e.target.value })}
                                                            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                                                        />
                                                    </div>
                                                    <div style={{ width: '150px' }}>
                                                        <h4 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Duration (s)</h4>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="30"
                                                            placeholder="5"
                                                            className="glass"
                                                            value={formData.adDuration || 5}
                                                            onChange={e => setFormData({ ...formData, adDuration: parseInt(e.target.value) || 5 })}
                                                            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </section>

                                <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                                    <button onClick={() => handleSavePost('draft')} className="glass" style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        <Save size={20} /> Save Draft
                                    </button>
                                    <button onClick={() => handleSavePost('published')} className="glass" style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, color: 'white' }}>
                                        <Send size={20} /> Publish
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )}

            </div>
        </div>
    );
};

export default AdminPage;
