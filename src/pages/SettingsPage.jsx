import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Trash2, Camera, CreditCard, ShieldCheck } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { userRole, setUserRole } = useCommunity();

    // Mock initial state
    const [formData, setFormData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        profileImage: null
    });

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

    const handleSave = () => {
        alert("Settings saved!");
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            // Logic for logout would go here
            alert("Logged out!");
            navigate('/');
        }
    };

    const handleDeleteAccount = () => {
        const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmed) {
            // Logic for account deletion
            alert("Account deleted.");
            navigate('/');
        }
    };

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
                                {!formData.profileImage && (
                                    <span style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>
                                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                                    </span>
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
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--primary-gradient)', color: 'white', fontWeight: 600, marginTop: '8px' }}
                        >
                            Save Changes
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
                            onClick={() => setUserRole(userRole === 'premium' ? 'free' : 'premium')}
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
