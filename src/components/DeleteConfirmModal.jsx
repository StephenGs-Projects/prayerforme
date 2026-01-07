import React from 'react';
import { Trash2, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onClose}>
            <div
                className="glass"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    borderRadius: 'var(--radius-lg)',
                    padding: '28px',
                    position: 'relative',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    backgroundColor: 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        color: 'var(--text-tertiary)',
                        padding: '4px',
                        borderRadius: '50%',
                        transition: 'backgroundColor 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <X size={20} />
                </button>

                {/* Icon & Title */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444'
                    }}>
                        <Trash2 size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {title || 'Delete Journal Entry?'}
                        </h2>
                        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            {message || 'This action cannot be undone. This entry will be permanently removed from your history.'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--border-surface)',
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '15px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)';
                            e.currentTarget.style.borderColor = 'var(--border-accent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--border-surface)';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '15px',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(239, 68, 68, 0.2)';
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
