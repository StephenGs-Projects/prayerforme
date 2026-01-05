import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, LogOut, Trash2, Camera, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { currentUser, userRole, logout, updateProfile, changeEmail, changePassword, deleteAccount } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        newPassword: '',
        profileImage: null
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Load user data from Firebase Auth
    useEffect(() => {
        if (currentUser) {
            const displayName = currentUser.displayName || '';
            const nameParts = displayName.split(' ');
            setFormData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: currentUser.email || '',
                newPassword: '',
                profileImage: currentUser.photoURL || null
            });
        }
    }, [currentUser]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profileImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            const updates = {};

            // Update display name if changed
            const newDisplayName = `${formData.firstName} ${formData.lastName}`.trim();
            if (newDisplayName && newDisplayName !== currentUser.displayName) {
                updates.displayName = newDisplayName;
            }

            // Update photo URL if changed
            if (formData.profileImage && formData.profileImage !== currentUser.photoURL) {
                updates.photoURL = formData.profileImage;
            }

            // Update profile
            if (Object.keys(updates).length > 0) {
                await updateProfile(updates);
            }

            // Update email if changed
            if (formData.email && formData.email !== currentUser.email) {
                await changeEmail(formData.email);
            }

            // Update password if provided
            if (formData.newPassword) {
                await changePassword(formData.newPassword);
                setFormData({ ...formData, newPassword: '' });
            }

            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (window.confirm("Are you sure you want to log out?")) {
            try {
                await logout();
                navigate('/');
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to log out' });
            }
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmed) {
            try {
                await deleteAccount();
                navigate('/');
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to delete account. You may need to re-authenticate.' });
            }
        }
    };

    // If user is not logged in, show login prompt
    if (!currentUser) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
            }}>
                <div style={{
                    maxWidth: '400px',
                    width: '100%',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 300,
                        color: 'var(--text-primary)',
                        marginBottom: '16px'
                    }}>
                        Sign in to view settings
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-tertiary)',
                        marginBottom: '32px'
                    }}>
                        You need to be logged in to manage your account settings
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link
                            to="/login"
                            style={{
                                padding: '14px',
                                borderRadius: '8px',
                                background: '#06b6d4',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: 500,
                                textDecoration: 'none',
                                display: 'block'
                            }}
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            style={{
                                padding: '14px',
                                borderRadius: '8px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-surface)',
                                color: 'var(--text-primary)',
                                fontSize: '16px',
                                fontWeight: 500,
                                textDecoration: 'none',
                                display: 'block'
                            }}
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', paddingTop: '40px', paddingBottom: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="glass"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', color: 'var(--text-secondary)' }}
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '24px', margin: 0 }}>Settings</h1>
            </div>

            {/* Success/Error Messages */}
            {message.text && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    color: message.type === 'success' ? '#10b981' : '#ef4444'
                }}>
                    {message.text}
                </div>
            )}

            {/* Profile Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <section>
                    <h2 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase' }}>Profile Information</h2>
                    <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Profile Image Upload */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                            <div
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: formData.profileImage ? `url(${formData.profileImage}) no-repeat center/cover` : '#ed7b66',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                {!formData.profileImage && formData.firstName && formData.lastName && (
                                    <span style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>
                                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                                    </span>
                                )}
                                {!formData.profileImage && (!formData.firstName || !formData.lastName) && (
                                    <Camera size={32} color="white" />
                                )}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'rgba(0,0,0,0.5)',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Camera size={16} color="white" />
                                </div>
                            </div>
                            <input
                                id="fileInput"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Tap to change photo</p>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                                New Password <span style={{ color: 'var(--text-light)' }}>(leave blank to keep current)</span>
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            style={{
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                background: loading ? 'var(--border-surface)' : 'var(--primary-gradient)',
                                color: 'white',
                                fontWeight: 600,
                                marginTop: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </section>

                {/* Membership Section */}
                <section>
                    <h2 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase' }}>Membership</h2>
                    <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: userRole === 'premium' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: userRole === 'premium' ? 'var(--accent-cyan)' : 'var(--text-tertiary)'
                            }}>
                                {userRole === 'premium' ? <ShieldCheck size={24} /> : <CreditCard size={24} />}
                            </div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {userRole === 'premium' ? 'Premium Member' : 'Free Account'}
                                    {userRole === 'premium' && <span style={{ fontSize: '10px', background: 'var(--accent-cyan)', color: '#000', padding: '2px 6px', borderRadius: '10px', textTransform: 'uppercase' }}>Active</span>}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                    {userRole === 'premium' ? 'Pro access enabled • No ads' : 'Upgrade for an ad-free experience'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => alert('Upgrade feature coming soon!')}
                            style={{
                                padding: '10px 20px', borderRadius: 'var(--radius-md)',
                                background: userRole === 'premium' ? 'rgba(255,255,255,0.05)' : 'var(--primary-gradient)',
                                color: userRole === 'premium' ? 'var(--text-secondary)' : 'white',
                                fontSize: '14px', fontWeight: 600, transition: 'all 0.2s'
                            }}
                        >
                            {userRole === 'premium' ? 'Manage' : 'Upgrade'}
                        </button>
                    </div>
                </section>

                {/* Account Actions */}
                <section>
                    <h2 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase' }}>Account Actions</h2>
                    <div className="glass" style={{ padding: '8px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <button
                            onClick={handleLogout}
                            style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <LogOut size={20} color="var(--text-secondary)" />
                            <span>Log Out</span>
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-pink)' }}
                        >
                            <Trash2 size={20} />
                            <span>Delete Account</span>
                        </button>
                    </div>
                </section>
            </div>

        </div>
    );
};

export default SettingsPage;
