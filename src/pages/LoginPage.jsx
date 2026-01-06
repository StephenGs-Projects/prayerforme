import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { signin, signinWithGoogle, error: authError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await signin(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            await signinWithGoogle();
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div style={{ maxWidth: '400px', width: '100%' }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 300,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    textAlign: 'center'
                }}>
                    Welcome Back
                </h1>
                <p style={{
                    fontSize: '14px',
                    color: 'var(--text-tertiary)',
                    marginBottom: '32px',
                    textAlign: 'center'
                }}>
                    Sign in to continue your spiritual journey
                </p>

                {(error || authError) && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <AlertCircle size={20} color="#ef4444" />
                        <span style={{ fontSize: '14px', color: '#ef4444' }}>
                            {error || authError}
                        </span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            marginBottom: '8px',
                            display: 'block'
                        }}>
                            Email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="var(--text-tertiary)" style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-surface)',
                                    background: 'var(--bg-surface)',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            marginBottom: '8px',
                            display: 'block'
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-tertiary)" style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }} />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-surface)',
                                    background: 'var(--bg-surface)',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            background: loading ? 'var(--border-surface)' : '#06b6d4',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 500,
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: '16px'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <Link
                        to="/forgot-password"
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            fontSize: '14px',
                            color: 'var(--accent-cyan)',
                            textDecoration: 'none',
                            marginBottom: '24px'
                        }}
                    >
                        Forgot password?
                    </Link>
                </form>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-surface)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-surface)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-surface)',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/>
                            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z"/>
                            <path fill="#FBBC05" d="M4.5 10.52A4.8 4.8 0 0 1 4.5 7.48V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z"/>
                            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3Z"/>
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <p style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: 'var(--text-tertiary)'
                }}>
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        style={{
                            color: 'var(--accent-cyan)',
                            textDecoration: 'none',
                            fontWeight: 500
                        }}
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
