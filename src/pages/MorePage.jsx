import React, { useState } from 'react';
import { Share2, FileText, MapPin, Settings as SettingsIcon, ChevronRight, ChevronDown, Moon, Sun, Smartphone, History, Info, Mail, MessageSquare, Shield, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrayerHandsIcon from '../components/PrayerHandsIcon';

const MorePage = () => {
    const { theme, setTheme, fontSize, setFontSize } = useTheme();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [expandedSection, setExpandedSection] = useState(null);

    const handleShareApp = async () => {
        const shareData = {
            title: 'Prayer For Me',
            text: 'Take a look at this prayer website!',
            url: 'https://app.prayerforme.org'
        };

        try {
            // Try Web Share API first
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                const textToCopy = `${shareData.text} ${shareData.url}`;

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(textToCopy);
                    alert('Link copied to clipboard!');
                } else {
                    // Ultimate fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        alert('Link copied to clipboard!');
                    } catch (err) {
                        alert('Unable to share. Please copy: ' + textToCopy);
                    }
                    document.body.removeChild(textArea);
                }
            }
        } catch (err) {
            // User cancelled or error occurred
            if (err.name !== 'AbortError') {
                console.error('Share error:', err);
                alert('Unable to share. Please try again.');
            }
        }
    };

    const handleSharePrayerRequest = async () => {
        const shareData = {
            title: 'Prayer For Me',
            text: 'Take a look at this prayer website!',
            url: 'https://prayerforme.org'
        };

        try {
            // Try Web Share API first
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                const textToCopy = `${shareData.text} ${shareData.url}`;

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(textToCopy);
                    alert('Link copied to clipboard!');
                } else {
                    // Ultimate fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        alert('Link copied to clipboard!');
                    } catch (err) {
                        alert('Unable to share. Please copy: ' + textToCopy);
                    }
                    document.body.removeChild(textArea);
                }
            }
        } catch (err) {
            // User cancelled or error occurred
            if (err.name !== 'AbortError') {
                console.error('Share error:', err);
                alert('Unable to share. Please try again.');
            }
        }
    };

    const SectionHeader = ({ title }) => (
        <h2 style={{
            fontSize: '11px',
            letterSpacing: '0.3em',
            color: 'var(--text-light)',
            textTransform: 'uppercase',
            marginBottom: '24px',
            fontWeight: 400
        }}>
            {title}
        </h2>
    );

    const MenuItem = ({ icon: Icon, label, action }) => (
        <button
            onClick={action}
            style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-surface)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-surface)'}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Icon size={20} color="#06b6d4" strokeWidth={2} />
                <span style={{ fontSize: '16px', fontWeight: 300, color: 'var(--text-primary)' }}>
                    {label}
                </span>
            </div>
            <ChevronRight size={20} color="var(--text-light)" strokeWidth={2} />
        </button>
    );

    const ExpandableMenuItem = ({ icon: Icon, label, section, options }) => {
        const isExpanded = expandedSection === section;

        return (
            <div>
                <button
                    onClick={() => setExpandedSection(isExpanded ? null : section)}
                    style={{
                        width: '100%',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-surface)',
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'border-color 0.2s',
                        cursor: 'pointer',
                        marginBottom: isExpanded ? '12px' : '0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-surface)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Icon size={20} color="#06b6d4" strokeWidth={2} />
                        <span style={{ fontSize: '16px', fontWeight: 300, color: 'var(--text-primary)' }}>
                            {label}
                        </span>
                    </div>
                    {isExpanded ? (
                        <ChevronDown size={20} color="var(--text-light)" strokeWidth={2} />
                    ) : (
                        <ChevronRight size={20} color="var(--text-light)" strokeWidth={2} />
                    )}
                </button>

                {isExpanded && (
                    <div style={{
                        paddingLeft: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginBottom: '12px'
                    }}>
                        {options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={option.action}
                                style={{
                                    padding: '16px',
                                    borderRadius: '8px',
                                    background: 'var(--bg-app)',
                                    border: '1px solid var(--border-surface)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    color: 'var(--text-secondary)',
                                    fontSize: '14px',
                                    fontWeight: 300,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-app)'}
                            >
                                <span>{option.label}</span>
                                <ExternalLink size={14} color="var(--text-light)" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
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
                    marginBottom: '48px',
                    fontFamily: 'var(--font-sans)'
                }}>
                    More
                </h1>

                {/* Appearance Section */}
                <div style={{ marginBottom: '48px' }}>
                    <SectionHeader title="Appearance" />

                    {/* Theme Selector */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        {[
                            { id: 'system', label: 'System', icon: Smartphone },
                            { id: 'light', label: 'Light', icon: Sun },
                            { id: 'dark', label: 'Dark', icon: Moon },
                        ].map((opt) => {
                            const isActive = theme === opt.id;
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setTheme(opt.id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        background: isActive ? 'var(--bg-surface-active)' : 'var(--bg-surface)',
                                        border: isActive ? '2px solid var(--accent-cyan)' : '2px solid var(--border-surface)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Icon size={16} color={isActive ? 'var(--text-active)' : 'var(--text-secondary)'} strokeWidth={2} />
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: 300,
                                        color: isActive ? 'var(--text-active)' : 'var(--text-secondary)'
                                    }}>
                                        {opt.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Font Size Slider */}
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-surface)',
                        borderRadius: '12px',
                        padding: '24px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 300 }}>A</span>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="range"
                                    min="0.8"
                                    max="1.2"
                                    step="0.05"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(parseFloat(e.target.value))}
                                    style={{
                                        width: '100%',
                                        height: '4px',
                                        borderRadius: '4px',
                                        background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((fontSize - 0.8) / 0.4) * 100}%, var(--border-surface) ${((fontSize - 0.8) / 0.4) * 100}%, var(--border-surface) 100%)`,
                                        outline: 'none',
                                        appearance: 'none',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: '20px', color: 'var(--text-primary)', fontWeight: 300 }}>A</span>
                        </div>
                    </div>
                </div>

                {/* Personal Section */}
                <div style={{ marginBottom: '48px' }}>
                    <SectionHeader title="Personal" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <MenuItem
                            icon={History}
                            label="Past Journal Entries"
                            action={() => navigate('/entries')}
                        />
                        <MenuItem
                            icon={PrayerHandsIcon}
                            label="My Prayer Requests"
                            action={() => navigate('/my-requests')}
                        />
                    </div>
                </div>

                {/* Share Section */}
                <div style={{ marginBottom: '48px' }}>
                    <SectionHeader title="Share" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <MenuItem icon={Share2} label="Share App to Friend" action={handleShareApp} />
                        <MenuItem icon={Share2} label="Share Prayer Request" action={handleSharePrayerRequest} />
                    </div>
                </div>

                {/* General Section */}
                <div style={{ marginBottom: '48px' }}>
                    <SectionHeader title="General" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <MenuItem
                            icon={SettingsIcon}
                            label="Account Settings"
                            action={() => navigate('/settings')}
                        />
                        <MenuItem
                            icon={FileText}
                            label="Resources"
                            action={() => window.open('https://www.prayerforme.org/resources?ref=app', '_blank')}
                        />
                        <ExpandableMenuItem
                            icon={MapPin}
                            label="Find a Church"
                            section="church"
                            options={[
                                { label: "Church For Me (Chicago Only)", action: () => window.open('https://churchforme.com?ref=app', '_blank') },
                                { label: "Church Finder", action: () => window.open('https://www.churchfinder.com?ref=prayerforme', '_blank') },
                                { label: "FaithStreet", action: () => window.open('https://www.faithstreet.com/churches?ref=prayerforme', '_blank') }
                            ]}
                        />
                        <MenuItem
                            icon={Smartphone}
                            label="Install App"
                            action={() => navigate('/install')}
                        />
                    </div>
                </div>

                {/* About Section */}
                <div style={{ marginBottom: '48px' }}>
                    <SectionHeader title="About Prayer for Me" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <MenuItem icon={Info} label="About Us" action={() => navigate('/about')} />
                    </div>
                </div>

                {/* Get in Touch Section */}
                <div style={{ marginBottom: '48px' }}>
                    <SectionHeader title="Get in Touch" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <MenuItem
                            icon={Mail}
                            label="Contact Us"
                            action={() => window.open(`https://prayerforme.fillout.com/app-contact-us?email=${encodeURIComponent(currentUser?.email || '')}`, '_blank')}
                        />
                        <MenuItem
                            icon={MessageSquare}
                            label="Leave Feedback"
                            action={() => window.open(`https://prayerforme.fillout.com/app-feedback?email=${encodeURIComponent(currentUser?.email || '')}`, '_blank')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MorePage;
