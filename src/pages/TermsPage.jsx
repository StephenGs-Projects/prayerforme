import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const TermsPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '20px', paddingTop: '40px', paddingBottom: '100px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="glass"
                    style={{
                        width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', color: 'var(--text-secondary)'
                    }}
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Terms of Use</h1>
            </div>

            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 600 }}>1. Acceptance of Terms</h3>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                    By accessing and using the Prayer For Me application, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 600 }}>2. Use of Service</h3>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                    You agree to use this service only for lawful purposes. Harassment, hate speech, or inappropriate content in prayer requests or comments is strictly prohibited and will result in account termination.
                </p>

                <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 600 }}>3. Artificial Intelligence</h3>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                    Portions of this application may utilize AI to assist in content generation or moderation. While we strive for accuracy, AI-generated content should be viewed as a tool rather than a definitive authority.
                </p>

                <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 600 }}>4. User Content</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    You retain ownership of the content you post but grant Prayer For Me a license to use, display, and distribute said content within the platform.
                </p>
            </div>
        </div>
    );
};

export default TermsPage;
