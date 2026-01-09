import { Link, useLocation } from 'react-router-dom';
import { BookOpen, PenLine, Users, Menu } from 'lucide-react';
import PrayerHandsIcon from './PrayerHandsIcon';
import { useFlow } from '../context/FlowContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const { isNavVisible } = useFlow();

    const isActive = (path) => location.pathname === path;

    // Hide navigation on login and signup pages
    const hideNavPages = ['/login', '/signup'];
    const shouldHideNav = hideNavPages.includes(location.pathname);

    // We only hide the BottomNav items, but we might want to keep the padding
    // if we don't want the content to jump. However, for "Full Screen Experience"
    // logic, it might be better to remove padding when nav is hidden.
    const containerStyle = {
        paddingBottom: (isNavVisible && !shouldHideNav) ? 'var(--nav-height)' : '0',
        minHeight: '100vh',
        transition: 'padding-bottom 0.5s ease'
    };

    const navItems = [
        { path: '/', icon: PrayerHandsIcon, label: 'Prayer' },
        { path: '/devotional', icon: BookOpen, label: 'Devotional' },
        { path: '/journal', icon: PenLine, label: 'Journal' },
        { path: '/community', icon: Users, label: 'Community' },
        { path: '/more', icon: Menu, label: 'More' },
    ];

    return (
        <div style={containerStyle}>
            <main className="fade-in">
                {children}
            </main>

            {!shouldHideNav && (
                <nav
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        left: '20px',
                        right: '20px',
                        transform: isNavVisible ? 'translateY(0)' : 'translateY(120%)',
                        height: '64px',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        padding: '0 8px',
                        zIndex: 1000,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-surface)',
                        borderRadius: '100px',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                        opacity: isNavVisible ? 1 : 0,
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    color: active ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                                    background: active ? 'var(--bg-surface-active)' : 'transparent',
                                    transition: 'all 0.3s ease',
                                    textDecoration: 'none'
                                }}
                            >
                                <Icon
                                    size={22}
                                    strokeWidth={active ? 2.5 : 2}
                                    color={active ? 'var(--accent-cyan)' : 'var(--text-tertiary)'}
                                />
                            </Link>
                        );
                    })}
                </nav>
            )}
        </div>
    );
};

export default Layout;
