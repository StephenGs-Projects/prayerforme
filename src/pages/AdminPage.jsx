import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import {
    saveDailyContent,
    getDailyContent,
    getAllDailyContent,
    deleteDailyContent,
    getPrayerRequests,
    addComment,
    getFlaggedRequests,
    approveFlaggedRequest,
    rejectFlaggedRequest,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser
} from '../firebase/firestore';
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

const Overview = ({ dashboardStats, posts, loading }) => {
    const recentPublished = (posts || [])
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Dashboard Overview</h2>

            {/* Stats Grid */}
            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px',
                    fontStyle: 'italic',
                    marginBottom: '32px'
                }}>
                    Loading statistics...
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    {dashboardStats.map((stat, index) => (
                        <div key={index} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ padding: '8px', borderRadius: '50%', background: 'var(--bg-surface-active)', color: 'var(--accent-cyan)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <stat.icon size={18} />
                                </div>
                                {stat.trend && <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>{stat.trend}</span>}
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{stat.label}</p>
                                <h3 style={{ fontSize: '28px', fontWeight: 700 }}>{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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

const ContentView = ({ posts, loading, onEdit, onDelete, onCreate }) => (
    <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px' }}>Content Management</h2>
            <button onClick={onCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--primary-gradient)', color: 'white', fontWeight: 600 }}>
                <Plus size={20} />
                <span>New Entry</span>
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
                Loading daily content...
            </div>
        ) : posts.length === 0 ? (
            <div style={{
                textAlign: 'center',
                padding: '48px',
                color: 'var(--text-tertiary)',
                fontSize: '16px'
            }}>
                No daily content yet. Click "New Entry" to create your first one!
            </div>
        ) : (
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
        )}
    </div>
);

const UsersView = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionMenuOpen, setActionMenuOpen] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const allUsers = await getAllUsers();
                setUsers(allUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (actionMenuOpen) {
                setActionMenuOpen(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [actionMenuOpen]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setActionMenuOpen(null);
            alert(`User role updated to ${newRole}`);
        } catch (error) {
            console.error('Error updating role:', error);
            alert(`Failed to update role: ${error.message}`);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await updateUserStatus(userId, newStatus);
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            setActionMenuOpen(null);
            alert(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`Failed to update status: ${error.message}`);
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (!window.confirm(`Are you sure you want to delete user ${userEmail}?\n\nThis will remove their Firestore data but not their Firebase Auth account.`)) {
            return;
        }

        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            setActionMenuOpen(null);
            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(`Failed to delete user: ${error.message}`);
        }
    };

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            (user.displayName?.toLowerCase() || '').includes(query) ||
            (user.email?.toLowerCase() || '').includes(query)
        );
    });

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px' }}>User Management</h2>
                <div className="glass" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', width: '300px' }}>
                    <Search size={18} color="var(--text-tertiary)" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none' }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px',
                    fontStyle: 'italic'
                }}>
                    Loading users...
                </div>
            ) : (
                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'visible' }}>
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
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                        No users found
                                    </td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                                                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 500 }}>{user.displayName || 'Anonymous'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{user.email || 'No email'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 500, color: user.role === 'premium' ? 'var(--accent-pink)' : user.role === 'admin' ? 'var(--accent-cyan)' : 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                            {user.role || 'free'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', background: (user.status === 'active' || !user.status) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: (user.status === 'active' || !user.status) ? '#10b981' : '#ef4444', textTransform: 'capitalize' }}>
                                            {user.status || 'active'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>{formatDate(user.createdAt)}</td>
                                    <td style={{ padding: '16px', textAlign: 'right', position: 'relative' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActionMenuOpen(actionMenuOpen === user.id ? null : user.id);
                                            }}
                                            style={{ color: 'var(--text-tertiary)', position: 'relative' }}
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                        {actionMenuOpen === user.id && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                position: 'absolute',
                                                right: '0px',
                                                top: '100%',
                                                marginTop: '4px',
                                                background: 'var(--bg-surface)',
                                                border: '1px solid var(--border-surface)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '8px',
                                                zIndex: 1000,
                                                minWidth: '200px',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                                            }}>
                                                <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                                                    Change Role
                                                </div>
                                                {['free', 'premium', 'admin'].map(role => (
                                                    <button
                                                        key={role}
                                                        onClick={() => handleRoleChange(user.id, role)}
                                                        disabled={user.role === role}
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px 12px',
                                                            textAlign: 'left',
                                                            borderRadius: '4px',
                                                            background: user.role === role ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                            color: user.role === role ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                                            fontSize: '14px',
                                                            textTransform: 'capitalize',
                                                            cursor: user.role === role ? 'not-allowed' : 'pointer',
                                                            opacity: user.role === role ? 0.5 : 1
                                                        }}
                                                    >
                                                        {role}
                                                    </button>
                                                ))}
                                                <div style={{ height: '1px', background: 'var(--border-surface)', margin: '8px 0' }} />
                                                <button
                                                    onClick={() => handleStatusToggle(user.id, user.status || 'active')}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        textAlign: 'left',
                                                        borderRadius: '4px',
                                                        background: 'transparent',
                                                        color: (user.status === 'suspended') ? '#10b981' : '#f59e0b',
                                                        fontSize: '14px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {(user.status === 'suspended') ? 'Activate User' : 'Suspend User'}
                                                </button>
                                                <div style={{ height: '1px', background: 'var(--border-surface)', margin: '8px 0' }} />
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        textAlign: 'left',
                                                        borderRadius: '4px',
                                                        background: 'transparent',
                                                        color: '#ef4444',
                                                        fontSize: '14px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete User
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const PrayersView = () => {
    const { currentUser } = useAuth();
    const [prayerRequests, setPrayerRequests] = useState([]);
    const [comments, setComments] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState({});

    useEffect(() => {
        const fetchPrayerRequests = async () => {
            try {
                setLoading(true);
                const requests = await getPrayerRequests();
                setPrayerRequests(requests);
            } catch (error) {
                console.error('Error fetching prayer requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrayerRequests();
    }, []);

    const handleComment = async (requestId) => {
        const comment = comments[requestId];
        if (!comment?.trim() || !currentUser) return;

        try {
            setSubmitting({ ...submitting, [requestId]: true });

            await addComment(requestId, {
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Admin',
                content: comment.trim()
            });

            setComments({ ...comments, [requestId]: '' });
            alert('Reply sent successfully!');
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Failed to send reply. Please try again.');
        } finally {
            setSubmitting({ ...submitting, [requestId]: false });
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const getAvatarColor = (name) => {
        const colors = ['var(--accent-cyan)', 'var(--accent-pink)', '#10b981', '#f59e0b', '#8b5cf6'];
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Community Prayer Requests</h2>
                <p style={{ color: 'var(--text-tertiary)' }}>Monitor and engage with requests from the community feed.</p>
            </div>

            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px',
                    fontStyle: 'italic'
                }}>
                    Loading prayer requests...
                </div>
            ) : prayerRequests.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px'
                }}>
                    No prayer requests yet.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {prayerRequests.map(item => (
                        <div key={item.id} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: getAvatarColor(item.userName || 'Anonymous'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        color: '#fff'
                                    }}>
                                        {(item.userName || 'A').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {item.userName || 'Anonymous'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                            {formatTime(item.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                    {item.prayedCount || 0} prayers • {item.commentCount || 0} comments
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
                                        disabled={submitting[item.id]}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: 'var(--radius-md)',
                                            background: submitting[item.id] ? 'var(--bg-surface-active)' : 'var(--accent-cyan)',
                                            color: submitting[item.id] ? 'var(--text-tertiary)' : '#000',
                                            fontWeight: 700,
                                            cursor: submitting[item.id] ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {submitting[item.id] ? 'Sending...' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ModerationView = () => {
    const [flaggedItems, setFlaggedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlaggedRequests = async () => {
            try {
                setLoading(true);
                const requests = await getFlaggedRequests();
                setFlaggedItems(requests);
            } catch (error) {
                console.error('Error fetching flagged requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFlaggedRequests();
    }, []);

    const handleApprove = async (requestId) => {
        try {
            await approveFlaggedRequest(requestId);
            // Remove from local state after approval
            setFlaggedItems(flaggedItems.filter(item => item.id !== requestId));
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to approve request. Please try again.');
        }
    };

    const handleReject = async (requestId) => {
        try {
            await rejectFlaggedRequest(requestId);
            // Remove from local state after rejection
            setFlaggedItems(flaggedItems.filter(item => item.id !== requestId));
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request. Please try again.');
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Moderation Queue</h2>
            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px',
                    fontStyle: 'italic'
                }}>
                    Loading flagged requests...
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {flaggedItems.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No flagged items. Good job!</div>
                    ) : flaggedItems.map(item => (
                        <div key={item.id} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 600 }}>
                                        {item.flagReason || 'Flagged'}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                        Reported by {item.flaggedBy || 'Anonymous'} • {formatTime(item.flaggedAt)}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '14px', color: 'var(--text-primary)' }}>
                                "{item.content}"
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => handleApprove(item.id)}
                                    style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <CheckCircle size={18} /> Keep
                                </button>
                                <button
                                    onClick={() => handleReject(item.id)}
                                    style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <XCircle size={18} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Admin Page ---

const AdminPage = () => {
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, content, users, moderation, settings
    const [viewMode, setViewMode] = useState('list'); // list, editor (for content tab)
    const [editingId, setEditingId] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Check if user is admin
    useEffect(() => {
        const checkAdminAccess = () => {
            if (!currentUser) {
                // Not logged in, redirect to login
                navigate('/login');
                return;
            }

            if (userRole !== 'admin') {
                // Not an admin, redirect to home
                alert('Access Denied: You must be an admin to access this page.');
                navigate('/');
                return;
            }

            // User is admin
            setIsAuthorized(true);
            setCheckingAuth(false);
        };

        checkAdminAccess();
    }, [currentUser, userRole, navigate]);

    // Bypass desktop restriction
    React.useEffect(() => {
        document.body.classList.add('admin-view');
        return () => document.body.classList.remove('admin-view');
    }, []);

    // --- Data & Handlers ---

    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [dashboardStats, setDashboardStats] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    // Fetch dashboard statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const prayerRequests = await getPrayerRequests();

                // Calculate statistics
                const totalRequests = prayerRequests.length;
                const totalPrayers = prayerRequests.reduce((sum, req) => sum + (req.prayedCount || 0), 0);
                const totalComments = prayerRequests.reduce((sum, req) => sum + (req.commentCount || 0), 0);
                const avgPrayersPerRequest = totalRequests > 0 ? Math.round(totalPrayers / totalRequests) : 0;

                setDashboardStats([
                    { label: 'Prayer Requests', value: totalRequests.toString(), icon: MessageCircle },
                    { label: 'Total Prayers', value: totalPrayers.toString(), icon: CheckCircle },
                    { label: 'Avg Prayers/Request', value: avgPrayersPerRequest.toString(), icon: ShieldCheck },
                    { label: 'Total Comments', value: totalComments.toString(), icon: FileText },
                ]);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    // Fetch all daily content on mount
    useEffect(() => {
        const fetchDailyContent = async () => {
            try {
                setLoadingPosts(true);
                const content = await getAllDailyContent();

                // Transform Firestore data to match UI format
                const formattedPosts = content.map(item => ({
                    id: item.id,
                    date: item.date,
                    title: item.devotional?.title || 'Untitled',
                    status: item.published ? 'published' : 'draft',
                    opens: item.opens || 0,
                    prayers: item.prayers || 0,
                    devotionalTitle: item.devotional?.title || '',
                    verseText: item.verse?.text || '',
                    verseReference: item.verse?.reference || '',
                    prayerText: item.prayer?.text || '',
                    prayerAudio: item.prayer?.audioUrl || '',
                    devotionalContent: item.devotional?.content || '',
                    devotionalAudio: item.devotional?.audioUrl || '',
                    prompt1: item.journalPrompts?.[0] || '',
                    prompt2: item.journalPrompts?.[1] || '',
                    prompt3: item.journalPrompts?.[2] || '',
                    adImage: item.ad?.imageUrl || null,
                    adLink: item.ad?.link || '',
                    showAd: item.ad?.show || false,
                    adDuration: item.ad?.duration || 5
                }));

                setPosts(formattedPosts);
            } catch (error) {
                console.error('Error fetching daily content:', error);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchDailyContent();
    }, []);

    const initialForm = { date: '', verseText: '', verseReference: '', prayerText: '', prayerAudio: '', devotionalTitle: '', devotionalContent: '', devotionalAudio: '', prompt1: '', prompt2: '', prompt3: '', adImage: null, adLink: '', showAd: true, adDuration: 5 };
    const [formData, setFormData] = useState(initialForm);

    const handleCreateNew = () => { setEditingId(null); setFormData(initialForm); setViewMode('editor'); };
    const handleEdit = (post) => { setEditingId(post.id); setFormData({ ...initialForm, ...post, title: post.devotionalTitle || post.title }); setViewMode('editor'); };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this daily content entry?\n\nThis action cannot be undone.')) {
            return;
        }

        try {
            // Delete from Firestore
            await deleteDailyContent(id);

            // Update local state
            setPosts(posts.filter(p => p.id !== id));

            alert('Daily content deleted successfully!');
        } catch (error) {
            console.error('Error deleting daily content:', error);
            alert(`Failed to delete content: ${error.message}`);
        }
    };

    const { setDailyPost } = useCommunity();

    const handleSavePost = async (status) => {
        // Validate required fields
        if (!formData.date) {
            alert('Please select a date for this content.');
            return;
        }

        // Validate Ad content if toggle is ON
        if (formData.showAd) {
            if (!formData.adImage) {
                alert('Ad Image is required when "Include Ad Today" is enabled.\n\nPlease upload an ad image or turn off the ad toggle.');
                return;
            }
            if (!formData.adLink || !formData.adLink.trim()) {
                alert('Ad Destination Link is required when "Include Ad Today" is enabled.\n\nPlease provide a link or turn off the ad toggle.');
                return;
            }
        }

        try {
            const contentData = {
                verse: {
                    text: formData.verseText || '',
                    reference: formData.verseReference || ''
                },
                prayer: {
                    text: formData.prayerText || '',
                    audioUrl: formData.prayerAudio || ''
                },
                devotional: {
                    title: formData.devotionalTitle || 'Daily Devotional',
                    content: formData.devotionalContent || '',
                    audioUrl: formData.devotionalAudio || ''
                },
                journalPrompts: [
                    formData.prompt1 || '',
                    formData.prompt2 || '',
                    formData.prompt3 || ''
                ],
                ad: {
                    imageUrl: formData.adImage || '',
                    link: formData.adLink || '',
                    show: formData.showAd || false,
                    duration: formData.adDuration || 5
                }
            };

            // Save to Firestore (both draft and published)
            await saveDailyContent(formData.date, contentData);

            // Refresh the posts list
            const allContent = await getAllDailyContent();
            const formattedPosts = allContent.map(item => ({
                id: item.id,
                date: item.date,
                title: item.devotional?.title || 'Untitled',
                status: item.published ? 'published' : 'draft',
                opens: item.opens || 0,
                prayers: item.prayers || 0,
                devotionalTitle: item.devotional?.title || '',
                verseText: item.verse?.text || '',
                verseReference: item.verse?.reference || '',
                prayerText: item.prayer?.text || '',
                prayerAudio: item.prayer?.audioUrl || '',
                devotionalContent: item.devotional?.content || '',
                devotionalAudio: item.devotional?.audioUrl || '',
                prompt1: item.journalPrompts?.[0] || '',
                prompt2: item.journalPrompts?.[1] || '',
                prompt3: item.journalPrompts?.[2] || '',
                adImage: item.ad?.imageUrl || null,
                adLink: item.ad?.link || '',
                showAd: item.ad?.show || false,
                adDuration: item.ad?.duration || 5
            }));
            setPosts(formattedPosts);

            // Update local context for immediate UI feedback (if published)
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
        } catch (error) {
            console.error('Error saving daily content:', error);
            console.error('Error details:', error.code, error.message);

            // Create detailed error message
            let errorMessage = 'Failed to save content\n\n';

            if (error.code === 'permission-denied') {
                errorMessage += '❌ Permission Denied\n\n';
                errorMessage += 'Your account may not have admin permissions.\n\n';
                errorMessage += 'Troubleshooting:\n';
                errorMessage += '1. Check your role in Firestore: users/{uid}/role should be "admin"\n';
                errorMessage += '2. Firestore security rules may need updating\n';
                errorMessage += '3. Try signing out and signing back in\n\n';
                errorMessage += `Technical details: ${error.message}`;
            } else if (error.code === 'unauthenticated') {
                errorMessage += '❌ Not Authenticated\n\n';
                errorMessage += 'You are not signed in or your session has expired.\n\n';
                errorMessage += 'Please sign out and sign back in.';
            } else if (error.code === 'unavailable') {
                errorMessage += '❌ Network Error\n\n';
                errorMessage += 'Could not connect to Firestore.\n\n';
                errorMessage += 'Check your internet connection and try again.';
            } else {
                errorMessage += `❌ ${error.code || 'Unknown Error'}\n\n`;
                errorMessage += `${error.message}\n\n`;
                errorMessage += 'Check the browser console for more details.';
            }

            alert(errorMessage);
        }
    };


    // --- Render ---

    // Show loading state while checking authorization
    if (checkingAuth) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-app)'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                    fontSize: '16px'
                }}>
                    <div style={{ marginBottom: '16px', fontSize: '18px' }}>Verifying admin access...</div>
                </div>
            </div>
        );
    }

    // Don't render anything if not authorized (will redirect)
    if (!isAuthorized) {
        return null;
    }

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

                {activeTab === 'dashboard' && <Overview dashboardStats={dashboardStats} posts={posts} loading={loadingStats} />}

                {activeTab === 'prayers' && <PrayersView />}

                {activeTab === 'users' && <UsersView />}

                {activeTab === 'moderation' && <ModerationView />}

                {activeTab === 'content' && (
                    viewMode === 'list' ? (
                        <ContentView posts={posts} loading={loadingPosts} onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreateNew} />
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
