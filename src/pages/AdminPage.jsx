import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    saveDailyContent,
    saveDailyContentWithSchedule,
    getAllDailyContentWithStatus,
    checkAndPublishScheduledContent,
    getDailyContent,
    getAllDailyContent,
    deleteDailyContent,
    getPrayerRequests,
    addComment,
    getComments,
    getAllComments,
    deleteComment,
    searchComments,
    flagPrayerRequest,
    getFlaggedRequests,
    approveFlaggedRequest,
    rejectFlaggedRequest,
    getRecentUsers,
    getAdminStats,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    getPrayerRequestTrends,
    getMostActiveUsers,
    getContentEngagement
} from '../firebase/firestore';
import { uploadFile } from '../firebase/storage';
import {
    ChevronLeft, Plus, Calendar, Save, Send, Pencil, Trash2, Bold, Italic, List, Music, Upload, Loader2,
    LayoutDashboard, FileText, Users, ShieldAlert, Settings, LogOut, Search, MoreVertical, CheckCircle, XCircle, ShieldCheck, MessageCircle, MessageSquare, ChevronDown, ChevronUp, Flag, AlertTriangle, X, Menu, PanelLeft, PanelLeftClose
} from 'lucide-react';

// --- Shared Components ---

const ConfirmModal = ({ show, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmColor = '#ef4444' }) => {
    if (!show) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '24px',
                borderRadius: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
                    <button onClick={onClose} style={{ color: 'var(--text-tertiary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '14px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            background: confirmColor,
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '14px'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AlertModal = ({ show, onClose, title, message, type = 'info' }) => {
    if (!show) return null;

    const iconColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : 'var(--accent-cyan)';
    const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertTriangle;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '24px',
                borderRadius: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={24} color={iconColor} />
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {message}
                </p>

                <button
                    onClick={onClose}
                    style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-cyan)',
                        color: '#000',
                        fontWeight: 600,
                        fontSize: '14px'
                    }}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

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

const AudioUpload = ({ label, value, onChange, onUploadStart, onUploadEnd }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            onUploadStart?.();
            const path = `audio/${Date.now()}_${file.name}`;
            const url = await uploadFile(file, path);
            onChange(url);
        } catch (error) {
            console.error('Error uploading audio:', error);
            // Note: This is in AudioUpload component, we can't easily access parent modal state
            // Could pass it as prop, but for now leaving as is since it's less critical
            alert('Failed to upload audio file.');
        } finally {
            setUploading(false);
            onUploadEnd?.();
        }
    };

    return (
        <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</h3>
            <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Music size={20} />}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <input type="file" accept="audio/*" onChange={handleFileChange} style={{ display: 'none' }} id={`audio-upload-${label}`} disabled={uploading} />
                    <label htmlFor={`audio-upload-${label}`} style={{ cursor: uploading ? 'default' : 'pointer', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {uploading ? 'Uploading...' : (value ? 'Audio Uploaded' : 'Upload Audio File')}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                            {value ? 'Click to change' : 'MP3 or WAV'}
                        </span>
                    </label>
                </div>
                {value && !uploading && <CheckCircle size={16} color="#10b981" />}
            </div>
        </div>
    );
};

const ScheduleSelector = ({ publishStatus, scheduledDateTime, onStatusChange, onDateTimeChange }) => {
    return (
        <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase' }}>Publishing Options</h3>
            <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                {/* Radio Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: 'var(--radius-md)', background: publishStatus === 'published' ? 'rgba(0, 209, 255, 0.1)' : 'transparent', border: `2px solid ${publishStatus === 'published' ? 'var(--accent-cyan)' : 'transparent'}`, transition: 'all 0.2s' }}>
                        <input
                            type="radio"
                            name="publishStatus"
                            value="published"
                            checked={publishStatus === 'published'}
                            onChange={(e) => onStatusChange(e.target.value)}
                            style={{ accentColor: 'var(--accent-cyan)' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Publish Now</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Content will be immediately available to users</div>
                        </div>
                        <Send size={18} color={publishStatus === 'published' ? 'var(--accent-cyan)' : 'var(--text-tertiary)'} />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: 'var(--radius-md)', background: publishStatus === 'draft' ? 'rgba(255, 255, 255, 0.05)' : 'transparent', border: `2px solid ${publishStatus === 'draft' ? 'rgba(255, 255, 255, 0.3)' : 'transparent'}`, transition: 'all 0.2s' }}>
                        <input
                            type="radio"
                            name="publishStatus"
                            value="draft"
                            checked={publishStatus === 'draft'}
                            onChange={(e) => onStatusChange(e.target.value)}
                            style={{ accentColor: 'var(--text-secondary)' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Save as Draft</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Content will be saved but not published</div>
                        </div>
                        <Save size={18} color={publishStatus === 'draft' ? 'var(--text-secondary)' : 'var(--text-tertiary)'} />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: 'var(--radius-md)', background: publishStatus === 'scheduled' ? 'rgba(251, 146, 60, 0.1)' : 'transparent', border: `2px solid ${publishStatus === 'scheduled' ? '#fb923c' : 'transparent'}`, transition: 'all 0.2s' }}>
                        <input
                            type="radio"
                            name="publishStatus"
                            value="scheduled"
                            checked={publishStatus === 'scheduled'}
                            onChange={(e) => onStatusChange(e.target.value)}
                            style={{ accentColor: '#fb923c' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Schedule for Later</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Content will auto-publish at specified time</div>
                        </div>
                        <Calendar size={18} color={publishStatus === 'scheduled' ? '#fb923c' : 'var(--text-tertiary)'} />
                    </label>
                </div>

                {/* Date Picker - Only show when "Schedule for Later" is selected */}
                {publishStatus === 'scheduled' && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            Publish Date (12:00 AM Central Time)
                        </label>
                        <input
                            type="date"
                            value={scheduledDateTime}
                            onChange={(e) => onDateTimeChange(e.target.value)}
                            min={new Date().toISOString().slice(0, 10)}
                            className="glass"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(251, 146, 60, 0.3)',
                                color: 'var(--text-primary)',
                                fontFamily: 'inherit',
                                fontSize: '14px',
                                background: 'rgba(251, 146, 60, 0.05)'
                            }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#fb923c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertTriangle size={14} />
                            <span>Content will automatically publish at this time</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-Views ---

const AnalyticsGraph = () => {
    const [timeline, setTimeline] = useState('Week');
    const [trendsData, setTrendsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                setLoading(true);
                const days = timeline === 'Week' ? 7 : timeline === 'Month' ? 30 : 7;
                const data = await getPrayerRequestTrends(days);

                // Format data for display
                const formattedData = data.map(item => ({
                    label: timeline === 'Week'
                        ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
                        : new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    prayers: item.count
                }));

                setTrendsData(formattedData);
            } catch (error) {
                console.error('Error fetching prayer trends:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, [timeline]);

    const currentData = trendsData;
    // Filter labels to keep graph clean
    const step = timeline === 'Month' ? 3 : 1;
    const labels = currentData.filter((_, i) => i % step === 0);

    const maxVal = currentData.length > 0 ? Math.max(...currentData.map(d => d.prayers)) * 1.2 : 10;

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

    return (
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Prayer Request Trends</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Prayer Requests</span>
                    </div>
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
                    {['Week', 'Month'].map(t => (
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

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
                    Loading trends...
                </div>
            ) : currentData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
                    No prayer request data available
                </div>
            ) : (
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
                            const x = currentData.length > 1 ? (currentData.indexOf(d) / (currentData.length - 1)) * 1000 : 500;
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

                        {/* Prayers Area Fill */}
                        <path
                            d={`${getPath(currentData, 'prayers')} L 1000,260 L 0,260 Z`}
                            fill="url(#grad-prayers)" opacity="0.1"
                        />
                        <path d={getPath(currentData, 'prayers')} fill="none" stroke="#10b981" strokeWidth="3" />

                        <defs>
                            <linearGradient id="grad-prayers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            )}
        </div>
    );
};

const MostActiveUsersWidget = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                setLoading(true);
                const activeUsers = await getMostActiveUsers(5);
                setUsers(activeUsers);
            } catch (error) {
                console.error('Error fetching most active users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveUsers();
    }, []);

    const getAvatarColor = (name) => {
        const colors = ['var(--accent-cyan)', 'var(--accent-pink)', '#10b981', '#f59e0b', '#8b5cf6'];
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Most Active Users</h3>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                    Loading users...
                </div>
            ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                    No user data available
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {users.map((user, index) => (
                        <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-tertiary)', width: '24px' }}>
                                #{index + 1}
                            </div>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: user.photoURL ? `url(${user.photoURL}) center/cover` : getAvatarColor(user.displayName || 'User'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                color: '#fff'
                            }}>
                                {!user.photoURL && (user.displayName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                                    {user.displayName}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                    {user.requestsCount} requests • {user.prayersCount} prayers • {user.commentsCount} comments
                                </div>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                                {user.totalInteractions}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ContentEngagementTable = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEngagement = async () => {
            try {
                setLoading(true);
                const engagement = await getContentEngagement(10);
                setContent(engagement);
            } catch (error) {
                console.error('Error fetching content engagement:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEngagement();
    }, []);

    return (
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Content Engagement</h3>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                    Loading engagement data...
                </div>
            ) : content.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                    No content engagement data available
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Title</th>
                                <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Opens</th>
                                <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Prayers</th>
                                <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Engagement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {content.map((item, index) => (
                                <tr key={item.id} style={{ borderBottom: index < content.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                        {item.title}
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                                        {item.opens}
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                                        {item.prayers}
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, textAlign: 'center', color: parseFloat(item.engagementRate) > 50 ? '#10b981' : parseFloat(item.engagementRate) > 25 ? '#f59e0b' : 'var(--text-tertiary)' }}>
                                        {item.engagementRate}%
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

const Overview = ({ dashboardStats, posts, loading, recentUsers, loadingRecentUsers }) => {
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

            {/* Most Active Users */}
            <MostActiveUsersWidget />

            {/* Content Engagement */}
            <ContentEngagementTable />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {loadingRecentUsers ? (
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', fontStyle: 'italic' }}>Loading recent users...</p>
                        ) : (!recentUsers || recentUsers.length === 0) ? (
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No recent user activity.</p>
                        ) : recentUsers.map(user => {
                            const timeAgo = user.createdAt ? (user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt)) : null;

                            let formattedTime = 'recently';
                            if (timeAgo && !isNaN(timeAgo.getTime())) {
                                const diffMinutes = Math.round((timeAgo.getTime() - Date.now()) / (1000 * 60));
                                if (Math.abs(diffMinutes) < 1) {
                                    formattedTime = 'just now';
                                } else {
                                    try {
                                        formattedTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                                            diffMinutes, 'minute'
                                        ).replace('in ', '').replace(' ago', ' ago') + ' ago';
                                    } catch (e) {
                                        formattedTime = 'recently';
                                    }
                                }
                            }

                            return (
                                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '14px', margin: 0 }}>New user registered: <strong>{user.displayName || user.email?.split('@')[0] || 'Unknown User'}</strong></p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>{formattedTime}</p>
                                    </div>
                                </div>
                            );
                        })}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: post.status === 'published' ? 'var(--accent-cyan)' : post.status === 'scheduled' ? '#fb923c' : 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    background: post.status === 'published' ? 'rgba(6,182,212,0.1)' : post.status === 'scheduled' ? 'rgba(251, 146, 60, 0.1)' : 'rgba(255,255,255,0.05)'
                                }}>
                                    {post.status || 'draft'}
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{post.date || 'No Date'}</span>
                                {post.status === 'scheduled' && post.publishDate && (
                                    <span style={{ fontSize: '10px', color: '#fb923c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} />
                                        Auto-publishes: {new Date(post.publishDate.seconds * 1000).toLocaleString()}
                                    </span>
                                )}
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
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

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
            setAlertModal({ show: true, title: 'Success', message: `User role updated to ${newRole}`, type: 'success' });
        } catch (error) {
            console.error('Error updating role:', error);
            setAlertModal({ show: true, title: 'Error', message: `Failed to update role: ${error.message}`, type: 'error' });
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await updateUserStatus(userId, newStatus);
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            setActionMenuOpen(null);
            setAlertModal({ show: true, title: 'Success', message: `User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`, type: 'success' });
        } catch (error) {
            console.error('Error updating status:', error);
            setAlertModal({ show: true, title: 'Error', message: `Failed to update status: ${error.message}`, type: 'error' });
        }
    };

    const handleDeleteUser = (userId, userEmail) => {
        setConfirmModal({
            show: true,
            title: 'Delete User',
            message: `Are you sure you want to delete user ${userEmail}?\n\nThis will remove their Firestore data but not their Firebase Auth account.`,
            onConfirm: async () => {
                try {
                    await deleteUser(userId);
                    setUsers(users.filter(u => u.id !== userId));
                    setActionMenuOpen(null);
                    setAlertModal({ show: true, title: 'Success', message: 'User deleted successfully', type: 'success' });
                } catch (error) {
                    console.error('Error deleting user:', error);
                    setAlertModal({ show: true, title: 'Error', message: `Failed to delete user: ${error.message}`, type: 'error' });
                }
            }
        });
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontSize: '24px', minWidth: '200px' }}>User Management</h2>
                <div className="glass" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '300px', minWidth: '200px' }}>
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
                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
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
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: user.photoURL ? `url(${user.photoURL}) center/cover` : 'var(--bg-surface-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                                                {!user.photoURL && (user.displayName || user.email || 'U').charAt(0).toUpperCase()}
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

            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />

            <ConfirmModal
                show={confirmModal.show}
                onClose={() => setConfirmModal({ ...confirmModal, show: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Delete"
                confirmColor="#ef4444"
            />
        </div>
    );
};

const PrayersView = () => {
    const { currentUser } = useAuth();
    const [prayerRequests, setPrayerRequests] = useState([]);
    const [comments, setComments] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState({});
    const [showingComments, setShowingComments] = useState({});
    const [fetchedComments, setFetchedComments] = useState({});
    const [loadingComments, setLoadingComments] = useState({});
    const [showFlagModal, setShowFlagModal] = useState(false);
    const [flaggingRequestId, setFlaggingRequestId] = useState(null);
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

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

            // Refresh comments if they're currently showing
            if (showingComments[requestId]) {
                await toggleComments(requestId);
            }

            setAlertModal({ show: true, title: 'Success', message: 'Reply sent successfully!', type: 'success' });
        } catch (error) {
            console.error('Error sending reply:', error);
            setAlertModal({ show: true, title: 'Error', message: 'Failed to send reply. Please try again.', type: 'error' });
        } finally {
            setSubmitting({ ...submitting, [requestId]: false });
        }
    };

    const toggleComments = async (requestId) => {
        // If already showing, just hide
        if (showingComments[requestId]) {
            setShowingComments({ ...showingComments, [requestId]: false });
            return;
        }

        // Otherwise, fetch and show
        try {
            setLoadingComments({ ...loadingComments, [requestId]: true });
            const commentsData = await getComments(requestId);
            setFetchedComments({ ...fetchedComments, [requestId]: commentsData });
            setShowingComments({ ...showingComments, [requestId]: true });
        } catch (error) {
            console.error('Error fetching comments:', error);
            setAlertModal({ show: true, title: 'Error', message: 'Failed to load comments. Please try again.', type: 'error' });
        } finally {
            setLoadingComments({ ...loadingComments, [requestId]: false });
        }
    };

    const handleFlag = (requestId) => {
        setFlaggingRequestId(requestId);
        setShowFlagModal(true);
    };

    const confirmFlag = async (reason) => {
        if (!flaggingRequestId) return;

        try {
            await flagPrayerRequest(flaggingRequestId, currentUser.uid, reason);

            // Remove from the list since it's now flagged
            setPrayerRequests(prayerRequests.filter(req => req.id !== flaggingRequestId));

            setShowFlagModal(false);
            setFlaggingRequestId(null);

            setAlertModal({ show: true, title: 'Success', message: 'Prayer request has been flagged and moved to the moderation queue.', type: 'success' });
        } catch (error) {
            console.error('Error flagging prayer request:', error);
            setAlertModal({ show: true, title: 'Error', message: 'Failed to flag prayer request. Please try again.', type: 'error' });
            setShowFlagModal(false);
            setFlaggingRequestId(null);
        }
    };

    const handleDeleteComment = (prayerRequestId, commentId, commentText) => {
        setConfirmModal({
            show: true,
            title: 'Delete Comment',
            message: `Are you sure you want to delete this comment? "${commentText?.substring(0, 100)}..."`,
            onConfirm: async () => {
                try {
                    await deleteComment(prayerRequestId, commentId);

                    // Remove comment from local state
                    const updatedComments = { ...fetchedComments };
                    if (updatedComments[prayerRequestId]) {
                        updatedComments[prayerRequestId] = updatedComments[prayerRequestId].filter(c => c.id !== commentId);
                        setFetchedComments(updatedComments);
                    }

                    // Update comment count in prayer requests
                    const updatedRequests = prayerRequests.map(req => {
                        if (req.id === prayerRequestId) {
                            return { ...req, commentCount: (req.commentCount || 1) - 1 };
                        }
                        return req;
                    });
                    setPrayerRequests(updatedRequests);

                    setAlertModal({ show: true, title: 'Deleted', message: 'Comment deleted successfully', type: 'success' });
                } catch (error) {
                    console.error('Error deleting comment:', error);
                    setAlertModal({ show: true, title: 'Error', message: 'Failed to delete comment. Please try again.', type: 'error' });
                }
                setConfirmModal({ ...confirmModal, show: false });
            }
        });
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
                                        background: item.photoURL ? `url(${item.photoURL}) center/cover` : getAvatarColor(item.userName || 'Anonymous'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        color: '#fff'
                                    }}>
                                        {!item.photoURL && (item.userName || 'A').charAt(0).toUpperCase()}
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                        {item.prayedCount || 0} prayers • {item.commentCount || 0} comments
                                    </div>
                                    <button
                                        onClick={() => handleFlag(item.id)}
                                        title="Flag this prayer request"
                                        style={{
                                            padding: '8px',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#ef4444',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Flag size={16} />
                                    </button>
                                </div>
                            </div>
                            <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                                {item.content}
                            </p>

                            {/* View Comments Button */}
                            {(item.commentCount > 0) && (
                                <button
                                    onClick={() => toggleComments(item.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 12px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-secondary)',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        marginBottom: '16px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {showingComments[item.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    {loadingComments[item.id] ? 'Loading...' : showingComments[item.id] ? 'Hide Comments' : `View ${item.commentCount} Comment${item.commentCount !== 1 ? 's' : ''}`}
                                </button>
                            )}

                            {/* Display Comments */}
                            {showingComments[item.id] && fetchedComments[item.id] && (
                                <div style={{ marginBottom: '20px', paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                    {fetchedComments[item.id].length === 0 ? (
                                        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No comments yet.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {fetchedComments[item.id].map(comment => (
                                                <div key={comment.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                                {comment.userName || 'Anonymous'}
                                                            </span>
                                                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                                                {formatTime(comment.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteComment(item.id, comment.id, comment.content)}
                                                        title="Delete comment"
                                                        style={{
                                                            padding: '6px 10px',
                                                            borderRadius: 'var(--radius-md)',
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            color: '#ef4444',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            whiteSpace: 'nowrap',
                                                            height: 'fit-content',
                                                            alignSelf: 'flex-start'
                                                        }}
                                                    >
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                                    <textarea
                                        placeholder="Write a supportive reply..."
                                        className="glass"
                                        value={comments[item.id] || ''}
                                        onChange={(e) => setComments({ ...comments, [item.id]: e.target.value })}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                            resize: 'none',
                                            minHeight: '44px',
                                            maxHeight: '120px',
                                            fontFamily: 'inherit',
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            background: 'rgba(0, 0, 0, 0.05)'
                                        }}
                                    />
                                    <button
                                        onClick={() => handleComment(item.id)}
                                        disabled={submitting[item.id] || !comments[item.id]?.trim()}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: 'var(--radius-md)',
                                            background: submitting[item.id] ? 'var(--bg-surface-active)' : 'var(--accent-cyan)',
                                            color: '#000',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            cursor: (submitting[item.id] || !comments[item.id]?.trim()) ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            opacity: (submitting[item.id] || !comments[item.id]?.trim()) ? 0.5 : 1,
                                            whiteSpace: 'nowrap',
                                            height: '44px'
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

            {/* Flag Modal */}
            {showFlagModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '340px',
                        padding: '24px',
                        borderRadius: '12px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ec4899' }}>
                                <AlertTriangle size={24} />
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Report Content</h3>
                            </div>
                            <button onClick={() => setShowFlagModal(false)} style={{ color: 'var(--text-tertiary)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 300 }}>
                            Why are you flagging this request? It will be moved to the moderation queue.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {['Inappropriate Content', 'Spam / Scam', 'Harassment', 'False Information'].map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => confirmFlag(reason)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        background: 'var(--bg-app)',
                                        border: '1px solid var(--border-surface)',
                                        textAlign: 'left',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        fontWeight: 400,
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-active)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
            <ConfirmModal
                show={confirmModal.show}
                onClose={() => setConfirmModal({ ...confirmModal, show: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    );
};

const ModerationView = () => {
    const [flaggedItems, setFlaggedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        const fetchFlaggedRequests = async () => {
            try {
                setLoading(true);
                const requests = await getFlaggedRequests();

                // Fetch reporter names for each flagged item
                const requestsWithNames = await Promise.all(
                    requests.map(async (item) => {
                        if (item.reporterUid) {
                            try {
                                const userRef = doc(db, 'users', item.reporterUid);
                                const userSnap = await getDoc(userRef);
                                if (userSnap.exists()) {
                                    const userData = userSnap.data();
                                    return {
                                        ...item,
                                        reporterName: userData.displayName || userData.email || 'Anonymous'
                                    };
                                }
                            } catch (error) {
                                console.error('Error fetching reporter info:', error);
                            }
                        }
                        return { ...item, reporterName: 'Anonymous' };
                    })
                );

                setFlaggedItems(requestsWithNames);
            } catch (error) {
                console.error('Error fetching flagged requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFlaggedRequests();
    }, []);

    const handleApprove = async (flaggedId, originalRequestId) => {
        try {
            await approveFlaggedRequest(flaggedId, originalRequestId);
            // Remove from local state after approval
            setFlaggedItems(flaggedItems.filter(item => item.id !== flaggedId));
            setAlertModal({ show: true, title: 'Approved', message: 'Prayer request approved and restored to feed', type: 'success' });
        } catch (error) {
            console.error('Error approving request:', error);
            setAlertModal({ show: true, title: 'Error', message: 'Failed to approve request. Please try again.', type: 'error' });
        }
    };

    const handleReject = async (flaggedId, originalRequestId) => {
        try {
            await rejectFlaggedRequest(flaggedId, originalRequestId);
            // Remove from local state after rejection
            setFlaggedItems(flaggedItems.filter(item => item.id !== flaggedId));
            setAlertModal({ show: true, title: 'Deleted', message: 'Prayer request deleted permanently', type: 'success' });
        } catch (error) {
            console.error('Error rejecting request:', error);
            setAlertModal({ show: true, title: 'Error', message: 'Failed to reject request. Please try again.', type: 'error' });
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
                                        {item.reason || 'Flagged'}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                        Reported by {item.reporterName || 'Anonymous'} • {formatTime(item.createdAt)}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '14px', color: 'var(--text-primary)' }}>
                                "{item.content}"
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => handleApprove(item.id, item.originalRequestId)}
                                    style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <CheckCircle size={18} /> Keep
                                </button>
                                <button
                                    onClick={() => handleReject(item.id, item.originalRequestId)}
                                    style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <XCircle size={18} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
};

// --- Comments View ---

const CommentsView = () => {
    const [comments, setComments] = useState([]);
    const [filteredComments, setFilteredComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const allComments = await getAllComments('all');

            // Fetch user info for each comment
            const commentsWithUserInfo = await Promise.all(
                allComments.map(async (comment) => {
                    if (comment.userId) {
                        try {
                            const userRef = doc(db, 'users', comment.userId);
                            const userSnap = await getDoc(userRef);
                            if (userSnap.exists()) {
                                const userData = userSnap.data();
                                return {
                                    ...comment,
                                    userName: userData.displayName || userData.email || 'Anonymous',
                                    userEmail: userData.email
                                };
                            }
                        } catch (error) {
                            console.error('Error fetching user info:', error);
                        }
                    }
                    return { ...comment, userName: comment.userName || 'Anonymous' };
                })
            );

            setComments(commentsWithUserInfo);
            setFilteredComments(commentsWithUserInfo);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setAlertModal({ show: true, title: 'Error', message: 'Failed to load comments. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        if (!term.trim()) {
            setFilteredComments(comments);
            return;
        }

        const lowerTerm = term.toLowerCase();
        const filtered = comments.filter(comment =>
            comment.text?.toLowerCase().includes(lowerTerm) ||
            comment.userName?.toLowerCase().includes(lowerTerm) ||
            comment.prayerRequestTitle?.toLowerCase().includes(lowerTerm)
        );
        setFilteredComments(filtered);
    };

    const handleDeleteComment = (prayerRequestId, commentId, commentText) => {
        setConfirmModal({
            show: true,
            title: 'Delete Comment',
            message: `Are you sure you want to delete this comment? "${commentText?.substring(0, 100)}..."`,
            onConfirm: async () => {
                try {
                    await deleteComment(prayerRequestId, commentId);
                    // Remove from local state
                    const updatedComments = comments.filter(c => c.id !== commentId);
                    setComments(updatedComments);
                    setFilteredComments(updatedComments.filter(c =>
                        !searchTerm ||
                        c.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.prayerRequestTitle?.toLowerCase().includes(searchTerm.toLowerCase())
                    ));
                    setAlertModal({ show: true, title: 'Deleted', message: 'Comment deleted successfully', type: 'success' });
                } catch (error) {
                    console.error('Error deleting comment:', error);
                    setAlertModal({ show: true, title: 'Error', message: 'Failed to delete comment. Please try again.', type: 'error' });
                }
                setConfirmModal({ ...confirmModal, show: false });
            }
        });
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontSize: '24px', margin: 0 }}>Comments ({filteredComments.length})</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: 'var(--radius-md)', maxWidth: '300px', width: '100%' }}>
                    <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        placeholder="Search comments..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                        }}
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
                    Loading comments...
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredComments.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            {searchTerm ? 'No comments found matching your search.' : 'No comments yet.'}
                        </div>
                    ) : filteredComments.map(comment => (
                        <div key={comment.id} className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '14px' }}>
                                        {comment.userName}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                        • {formatTime(comment.createdAt)}
                                    </span>
                                    {comment.prayerRequestTitle && (
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: 'rgba(251, 146, 60, 0.1)',
                                            color: '#fb923c',
                                            marginLeft: '4px'
                                        }}>
                                            On: {comment.prayerRequestTitle}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                    {comment.text}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteComment(comment.prayerRequestId, comment.id, comment.text)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    height: 'fit-content'
                                }}
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
            <ConfirmModal
                show={confirmModal.show}
                onClose={() => setConfirmModal({ ...confirmModal, show: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
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
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    // Auto-publish scheduled content on admin page load
    useEffect(() => {
        const autoPublishScheduledContent = async () => {
            try {
                await checkAndPublishScheduledContent();
            } catch (error) {
                console.error('Error auto-publishing scheduled content:', error);
            }
        };

        autoPublishScheduledContent();
    }, []);

    // --- Data & Handlers ---

    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [dashboardStats, setDashboardStats] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loadingRecentUsers, setLoadingRecentUsers] = useState(true);

    // Fetch dashboard statistics
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoadingStats(true);
                setLoadingRecentUsers(true);

                // Fetch Stats
                const stats = await getAdminStats();
                setDashboardStats([
                    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users },
                    { label: 'Premium Users', value: stats.premiumUsers.toString(), icon: CheckCircle },
                    { label: 'Total Prayers', value: stats.totalPrayers.toString(), icon: MessageCircle },
                    { label: 'Today\'s Requests', value: stats.todayPrayers.toString(), icon: Calendar },
                ]);

                // Fetch Recent Users
                const users = await getRecentUsers(3);
                setRecentUsers(users);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoadingStats(false);
                setLoadingRecentUsers(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Fetch all daily content on mount
    useEffect(() => {
        const fetchDailyContent = async () => {
            try {
                setLoadingPosts(true);
                const content = await getAllDailyContentWithStatus('all');

                // Transform Firestore data to match UI format
                const formattedPosts = content.map(item => ({
                    id: item.id,
                    date: item.date,
                    title: item.devotional?.title || 'Untitled',
                    status: item.status || 'draft',
                    publishDate: item.publishDate,
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
                    adTitle: item.ad?.title || '',
                    adContent: item.ad?.content || '',
                    adButtonText: item.ad?.buttonText || '',
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

    const initialForm = {
        date: '',
        verseText: '',
        verseReference: '',
        prayerText: '',
        prayerAudio: '',
        devotionalTitle: '',
        devotionalContent: '',
        devotionalAudio: '',
        prompt1: '',
        prompt2: '',
        prompt3: '',
        adImage: null,
        adLink: '',
        adTitle: '',
        adContent: '',
        showAd: true,
        adDuration: 5,
        publishStatus: 'published', // 'published' | 'draft' | 'scheduled'
        scheduledDateTime: ''
    };
    const [formData, setFormData] = useState(initialForm);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);

    const handleCreateNew = () => { setEditingId(null); setFormData(initialForm); setViewMode('editor'); };
    const handleEdit = (post) => { setEditingId(post.id); setFormData({ ...initialForm, ...post, title: post.devotionalTitle || post.title }); setViewMode('editor'); };

    const handleDelete = (id) => {
        setConfirmModal({
            show: true,
            title: 'Delete Content',
            message: 'Are you sure you want to delete this daily content entry?\n\nThis action cannot be undone.',
            onConfirm: async () => {
                try {
                    // Delete from Firestore
                    await deleteDailyContent(id);

                    // Update local state
                    setPosts(posts.filter(p => p.id !== id));

                    setAlertModal({ show: true, title: 'Success', message: 'Daily content deleted successfully!', type: 'success' });
                } catch (error) {
                    console.error('Error deleting daily content:', error);
                    setAlertModal({ show: true, title: 'Error', message: `Failed to delete content: ${error.message}`, type: 'error' });
                }
            }
        });
    };

    const { setDailyPost } = useCommunity();

    const handleSavePost = async () => {
        // Validate required fields
        if (!formData.date) {
            setAlertModal({ show: true, title: 'Validation Error', message: 'Please select a date for this content.', type: 'error' });
            return;
        }

        // Validate scheduled content
        if (formData.publishStatus === 'scheduled') {
            if (!formData.scheduledDateTime) {
                setAlertModal({ show: true, title: 'Validation Error', message: 'Please select a publish date for scheduled content.', type: 'error' });
                return;
            }

            // Check if the selected date is today or in the future
            const today = new Date().toISOString().slice(0, 10);
            if (formData.scheduledDateTime < today) {
                setAlertModal({ show: true, title: 'Validation Error', message: 'Scheduled publish date must be today or in the future.', type: 'error' });
                return;
            }
        }

        // Validate Ad content if toggle is ON
        if (formData.showAd) {
            if (!formData.adImage && !formData.adVideo) {
                setAlertModal({ show: true, title: 'Validation Error', message: 'Ad Image or Video is required when "Include Ad Today" is enabled.\n\nPlease upload an ad image/video or turn off the ad toggle.', type: 'error' });
                return;
            }
            if (!formData.adLink || !formData.adLink.trim()) {
                setAlertModal({ show: true, title: 'Validation Error', message: 'Ad Destination Link is required when "Include Ad Today" is enabled.\n\nPlease provide a link or turn off the ad toggle.', type: 'error' });
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
                    videoUrl: formData.adVideo || '',
                    link: formData.adLink || '',
                    title: formData.adTitle || '',
                    content: formData.adContent || '',
                    buttonText: formData.adButtonText || '',
                    show: formData.showAd || false,
                    duration: formData.adDuration || 5
                }
            };

            // Prepare publish date for scheduled content (12am Central Time)
            let publishDate = null;
            if (formData.publishStatus === 'scheduled') {
                // Parse the date string (YYYY-MM-DD format from date input)
                const dateStr = formData.scheduledDateTime;
                // Create UTC date at 6:00 AM (which is 12:00 AM CST / UTC-6)
                // Note: During CDT (Daylight Saving Time), Central is UTC-5, so this would be 5:00 AM UTC
                // Using 6:00 AM UTC as standard (CST)
                publishDate = new Date(`${dateStr}T06:00:00Z`);
            }

            // Save to Firestore with scheduling support
            await saveDailyContentWithSchedule(
                formData.date,
                contentData,
                formData.publishStatus,
                publishDate
            );

            // Refresh the posts list
            const allContent = await getAllDailyContentWithStatus('all');
            const formattedPosts = allContent.map(item => ({
                id: item.id,
                date: item.date,
                title: item.devotional?.title || 'Untitled',
                status: item.status || 'draft',
                publishDate: item.publishDate,
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
                adVideo: item.ad?.videoUrl || null,
                adLink: item.ad?.link || '',
                adTitle: item.ad?.title || '',
                adContent: item.ad?.content || '',
                adButtonText: item.ad?.buttonText || '',
                showAd: item.ad?.show || false,
                adDuration: item.ad?.duration || 5
            }));
            setPosts(formattedPosts);

            // Update local context for immediate UI feedback (if published)
            if (status === 'published') {
                setDailyPost({
                    adImage: formData.adImage,
                    adVideo: formData.adVideo,
                    adLink: formData.adLink,
                    adTitle: formData.adTitle,
                    adContent: formData.adContent,
                    adButtonText: formData.adButtonText,
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

            setAlertModal({ show: true, title: 'Error Saving Content', message: errorMessage, type: 'error' });
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

    const SidebarItem = ({ id, label, icon: Icon, onClick }) => (
        <button
            onClick={() => { setActiveTab(id); setViewMode('list'); onClick?.(); }}
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

            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="glass mobile-menu-btn"
                style={{
                    position: 'fixed',
                    top: '16px',
                    left: '16px',
                    zIndex: 100,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                }}
            >
                {sidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeft size={24} />}
            </button>

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 60,
                        display: 'none'
                    }}
                    className="sidebar-overlay"
                />
            )}

            {/* Sidebar */}
            <div
                className="glass admin-sidebar"
                style={{
                    width: '280px',
                    borderRight: '1px solid var(--border-surface)',
                    borderTop: 'none',
                    borderBottom: 'none',
                    borderLeft: 'none',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 70,
                    transition: 'left 0.3s ease'
                }}
            >
                <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#000' }}>Prayer For Me</h1>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', letterSpacing: '2px', textTransform: 'uppercase' }}>Admin Panel</span>
                </div>

                <div style={{ flex: 1 }}>
                    <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} onClick={() => setSidebarOpen(false)} />
                    <SidebarItem id="content" label="Content" icon={FileText} onClick={() => setSidebarOpen(false)} />
                    <SidebarItem id="prayers" label="Prayers" icon={MessageCircle} onClick={() => setSidebarOpen(false)} />
                    <SidebarItem id="users" label="Users" icon={Users} onClick={() => setSidebarOpen(false)} />
                    <SidebarItem id="moderation" label="Moderation" icon={ShieldAlert} onClick={() => setSidebarOpen(false)} />
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                    <button onClick={() => navigate('/')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-tertiary)' }}>
                        <LogOut size={20} />
                        Exit Admin
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="admin-content" style={{ marginLeft: '280px', flex: 1, padding: '40px 20px', maxWidth: '100%', width: '100%' }}>

                {activeTab === 'dashboard' && (
                    <Overview
                        dashboardStats={dashboardStats}
                        posts={posts}
                        loading={loadingStats}
                        recentUsers={recentUsers}
                        loadingRecentUsers={loadingRecentUsers}
                    />
                )}

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
                                    <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Content Date</h3>
                                    <input type="date" className="glass" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                                </section>

                                {/* Publishing Options */}
                                <ScheduleSelector
                                    publishStatus={formData.publishStatus}
                                    scheduledDateTime={formData.scheduledDateTime}
                                    onStatusChange={(status) => setFormData({ ...formData, publishStatus: status })}
                                    onDateTimeChange={(dateTime) => setFormData({ ...formData, scheduledDateTime: dateTime })}
                                />

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
                                                    <h4 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Image Ad (Optional)</h4>
                                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Recommended Size: 1080x1920 (Vertical)</p>
                                                    <div
                                                        onClick={() => document.getElementById('ad-image-upload').click()}
                                                        style={{
                                                            width: '100%', height: '120px', borderRadius: 'var(--radius-sm)', border: '2px dashed rgba(255,255,255,0.1)',
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                            background: formData.adImage ? `url(${formData.adImage}) center/cover no-repeat` : 'transparent'
                                                        }}
                                                    >
                                                        {isUploadingMedia ? (
                                                            <Loader2 size={24} className="animate-spin" color="var(--text-tertiary)" />
                                                        ) : !formData.adImage && (
                                                            <>
                                                                <Upload size={24} color="var(--text-tertiary)" />
                                                                <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Upload Ad Image</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input
                                                        id="ad-image-upload" type="file" accept="image/*" style={{ display: 'none' }}
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;

                                                            try {
                                                                setIsUploadingMedia(true);
                                                                const path = `ads/${Date.now()}_${file.name}`;
                                                                const url = await uploadFile(file, path);
                                                                setFormData({ ...formData, adImage: url });
                                                            } catch (error) {
                                                                console.error('Error uploading ad image:', error);
                                                                setAlertModal({ show: true, title: 'Upload Error', message: 'Failed to upload ad image.', type: 'error' });
                                                            } finally {
                                                                setIsUploadingMedia(false);
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

                                                <div>
                                                    <h4 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Video Ad (Optional)</h4>
                                                    <div
                                                        onClick={() => document.getElementById('ad-video-upload').click()}
                                                        style={{
                                                            width: '100%', height: '120px', borderRadius: 'var(--radius-sm)', border: '2px dashed rgba(255,255,255,0.1)',
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                            overflow: 'hidden', position: 'relative'
                                                        }}
                                                    >
                                                        {isUploadingMedia ? (
                                                            <Loader2 size={24} className="animate-spin" color="var(--text-tertiary)" />
                                                        ) : formData.adVideo ? (
                                                            <video 
                                                                src={formData.adVideo} 
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                muted
                                                                playsInline
                                                            />
                                                        ) : (
                                                            <>
                                                                <Upload size={24} color="var(--text-tertiary)" />
                                                                <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Upload Ad Video</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input
                                                        id="ad-video-upload" type="file" accept="video/*" style={{ display: 'none' }}
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;

                                                            try {
                                                                setIsUploadingMedia(true);
                                                                const path = `ads/${Date.now()}_${file.name}`;
                                                                const url = await uploadFile(file, path);
                                                                setFormData({ ...formData, adVideo: url });
                                                            } catch (error) {
                                                                console.error('Error uploading ad video:', error);
                                                                setAlertModal({ show: true, title: 'Upload Error', message: 'Failed to upload ad video.', type: 'error' });
                                                            } finally {
                                                                setIsUploadingMedia(false);
                                                            }
                                                        }}
                                                    />
                                                    {formData.adVideo && (
                                                        <button
                                                            onClick={() => setFormData({ ...formData, adVideo: null })}
                                                            style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent-pink)' }}
                                                        >
                                                            Remove Video
                                                        </button>
                                                    )}
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Ad Title (Optional)</h4>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Daily Inspiration"
                                                            className="glass"
                                                            value={formData.adTitle || ''}
                                                            onChange={e => setFormData({ ...formData, adTitle: e.target.value })}
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

                                                <div>
                                                    <h4 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Ad Text (Optional)</h4>
                                                    <textarea
                                                        placeholder="A short message from our partners..."
                                                        className="glass"
                                                        value={formData.adContent || ''}
                                                        onChange={e => setFormData({ ...formData, adContent: e.target.value })}
                                                        style={{ width: '100%', height: '80px', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'none' }}
                                                    />
                                                </div>

                                                <div>
                                                    <h4 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Button Text (Optional)</h4>
                                                    <input
                                                        type="text"
                                                        placeholder="Learn More"
                                                        className="glass"
                                                        value={formData.adButtonText || ''}
                                                        onChange={e => setFormData({ ...formData, adButtonText: e.target.value })}
                                                        style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                                                    />
                                                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Default: "Learn More"</p>
                                                </div>

                                                <div style={{ display: 'flex', gap: '20px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Ad Destination Link</h4>
                                                        <input
                                                            type="text"
                                                            placeholder="https://yourstore.com/product"
                                                            className="glass"
                                                            value={formData.adLink || ''}
                                                            onChange={e => setFormData({ ...formData, adLink: e.target.value })}
                                                            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </section>

                                <div style={{ marginTop: '20px' }}>
                                    <button
                                        onClick={handleSavePost}
                                        className="glass"
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            borderRadius: 'var(--radius-md)',
                                            background: formData.publishStatus === 'published' ? 'var(--primary-gradient)' : formData.publishStatus === 'scheduled' ? '#fb923c' : 'var(--bg-surface-active)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            fontWeight: 600,
                                            color: formData.publishStatus === 'draft' ? 'var(--text-secondary)' : 'white',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {formData.publishStatus === 'published' && <><Send size={20} /> Publish Now</>}
                                        {formData.publishStatus === 'draft' && <><Save size={20} /> Save as Draft</>}
                                        {formData.publishStatus === 'scheduled' && <><Calendar size={20} /> Schedule Content</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )}

            </div>

            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />

            <ConfirmModal
                show={confirmModal.show}
                onClose={() => setConfirmModal({ ...confirmModal, show: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Delete"
                confirmColor="#ef4444"
            />

            {/* Responsive Styles */}
            <style>{`
                /* Desktop styles */
                @media (min-width: 769px) {
                    .admin-sidebar {
                        left: 0 !important;
                    }
                }

                /* Mobile and tablet styles */
                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: flex !important;
                    }

                    .sidebar-overlay {
                        display: ${sidebarOpen ? 'block' : 'none'} !important;
                    }

                    .admin-sidebar {
                        left: ${sidebarOpen ? '0' : '-280px'} !important;
                    }

                    .admin-content {
                        margin-left: 0 !important;
                        padding: 80px 16px 20px !important;
                    }

                    /* Stack buttons vertically on mobile */
                    .admin-content > * > div > div[style*="display: flex"][style*="gap: 16px"] {
                        flex-direction: column;
                    }

                    /* Make stat cards stack */
                    .admin-content > * > div[style*="display: grid"] {
                        grid-template-columns: 1fr !important;
                    }

                    /* Reduce font sizes on mobile */
                    h1 {
                        font-size: 24px !important;
                    }

                    h2 {
                        font-size: 20px !important;
                    }

                    h3 {
                        font-size: 16px !important;
                    }

                    /* Reduce padding on cards */
                    .glass {
                        padding: 16px !important;
                    }

                    /* Make content editor full width on mobile */
                    .admin-content > * > div[style*="maxWidth: '800px'"] {
                        max-width: 100% !important;
                    }

                    /* Ensure text wraps properly */
                    * {
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }

                    /* Stack form buttons */
                    button[style*="flex: 1"] {
                        flex: 1 1 100% !important;
                    }

                    /* Make modals full width on mobile */
                    div[style*="maxWidth: '400px'"],
                    div[style*="maxWidth: '340px'"] {
                        max-width: calc(100vw - 40px) !important;
                    }
                }

                @media (max-width: 480px) {
                    .admin-content {
                        padding: 70px 12px 16px !important;
                    }

                    /* Further reduce padding on very small screens */
                    .glass {
                        padding: 12px !important;
                    }

                    /* Stack prayer request header info */
                    div[style*="justifyContent: 'space-between'"] {
                        flex-direction: column;
                        align-items: flex-start !important;
                    }

                    /* Hide table columns on very small screens */
                    table th:nth-child(4),
                    table td:nth-child(4) {
                        display: none;
                    }

                    /* Make sure long email addresses wrap */
                    td, th {
                        max-width: 150px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    /* Stack Save Draft and Publish buttons */
                    div[style*="display: flex"][style*="gap: '16px'"] > button {
                        min-width: 100% !important;
                    }

                    /* Smaller font sizes for very small screens */
                    h1 {
                        font-size: 20px !important;
                    }

                    h2 {
                        font-size: 18px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminPage;
