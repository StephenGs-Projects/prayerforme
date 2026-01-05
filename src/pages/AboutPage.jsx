import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const AboutPage = () => {
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
                <h1 style={{ fontSize: '24px', fontWeight: 700 }}>About Us</h1>
            </div>

            <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                <p style={{ marginBottom: '16px' }}>
                    <strong>Prayer For Me</strong> is a dedicated space for spiritual connection and support. Our mission is to bridge the gap between those in need of prayer and those willing to pray, fostering a global community of faith and encouragement.
                </p>
                <p style={{ marginBottom: '16px' }}>
                    In a fast-paced world, it's easy to feel isolated in our struggles. We believe that no one should have to carry their burdens alone. Through this app, you can share your prayer requests, receive encouragement, and lift others up in prayer.
                </p>
                <p>
                    Thank you for being a part of this journey. Together, we can make a difference through the power of prayer.
                </p>
            </div>
        </div>
    );
};

export default AboutPage;
