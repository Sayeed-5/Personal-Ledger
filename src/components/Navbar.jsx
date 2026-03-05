import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

/* ─── Hamburger icon (mobile menu) ─── */
function IconHamburger() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

/* ─── Close icon (mobile menu) ─── */
function IconClose() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

/* ─── Sun icon (light mode) ─── */
function IconSun() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
    );
}

/* ─── Moon icon (dark mode) ─── */
function IconMoon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try { await logout(); } catch (err) { console.error(err); }
        setMenuOpen(false);
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 24px',
            backgroundColor: 'var(--bg-panel)',
            borderBottom: '1px solid var(--line)',
            flexShrink: 0,
            transition: 'background-color 0.25s, border-color 0.25s',
            position: 'sticky', top: 0, zIndex: 50,
        }}>

            {/* ── Brand — always links to landing page ── */}
            <Link to="/" style={{
                fontSize: '1.25rem', fontWeight: 700,
                color: 'var(--text)', textDecoration: 'none',
                transition: 'color 0.2s',
            }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
                onClick={closeMenu}
            >
                Personal Ledger
            </Link>

            {/* ── Hamburger (visible only on mobile) ── */}
            <button
                type="button"
                className="navbar-toggler"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
            >
                {menuOpen ? <IconClose /> : <IconHamburger />}
            </button>

            {/* ── Right side (desktop: inline; mobile: expandable panel) ── */}
            <div className={`navbar-menu ${menuOpen ? 'navbar-menu-open' : ''}`}>

                {/* ── Theme toggle ── */}
                <button
                    onClick={toggleTheme}
                    className="theme-toggle"
                    title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                    aria-label="Toggle theme"
                >
                    {isDark ? <IconSun /> : <IconMoon />}
                </button>

                {user ? (
                    <>
                        {/* Dashboard button */}
                        <Link to="/dashboard" className="btn-primary" style={{
                            padding: '8px 16px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
                        }} onClick={closeMenu}>
                            Dashboard
                        </Link>

                        {/* User identity */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.displayName || user.email?.split('@')[0] || 'User'}
                            </span>
                        </div>

                        {/* Logout */}
                        <LogoutButton onClick={handleLogout} />
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{
                            fontSize: '0.95rem', fontWeight: 500,
                            color: 'var(--text-dim)', textDecoration: 'none',
                            padding: '8px 14px',
                            transition: 'color 0.2s',
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
                            onClick={closeMenu}
                        >
                            Login
                        </Link>
                        <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', textDecoration: 'none', fontSize: '0.95rem' }} onClick={closeMenu}>
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

/* ─── Logout button (isolated to contain hover state) ─── */
function LogoutButton({ onClick }) {
    return (
        <button onClick={onClick} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '8px 14px', borderRadius: 12,
            background: 'transparent',
            border: '1px solid var(--line)',
            color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--negative)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.background = 'transparent';
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
        </button>
    );
}
