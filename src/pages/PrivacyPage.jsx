import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PrivacyPage = () => {
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
                <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Privacy Policy</h1>
            </div>

            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                <p style={{ marginBottom: '20px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    Last Updated: January 2026
                </p>

                <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 600 }}>Information We Collect</h3>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                    We collect information you provide directly to us, such as when you create an account, post a prayer request, or communicate with us. This may include your name, email address, and content of your posts.
                </p>

                <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 600 }}>How We Use Information</h3>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                    We use the information we collect to provide, maintain, and improve our services, to monitor and analyze trends, and to facilitate connection within the community.
                </p>

                <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 600 }}>Data Security</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPage;
