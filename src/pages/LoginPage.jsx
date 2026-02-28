import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ─── Google SVG logo ─── */
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.1-6.1C34.46 3.06 29.53 1 24 1 14.62 1 6.62 6.48 2.96 14.34l7.13 5.54C11.89 13.66 17.46 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.9-2.2 5.36-4.67 7.01l7.14 5.55C43.25 37.13 46.5 31.27 46.5 24.5z" />
            <path fill="#FBBC05" d="M10.09 28.8A14.6 14.6 0 0 1 9.5 24c0-1.67.28-3.28.79-4.8L3.16 13.66A22.96 22.96 0 0 0 1 24c0 3.68.88 7.16 2.43 10.24l6.66-5.44z" />
            <path fill="#34A853" d="M24 47c5.53 0 10.17-1.83 13.56-4.96l-7.14-5.55C28.81 37.88 26.54 38.5 24 38.5c-6.53 0-12.08-4.15-14.14-9.93l-7.13 5.54C6.6 41.5 14.61 47 24 47z" />
        </svg>
    );
}

/* ─── Divider with "or" ─── */
function OrDivider() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>
    );
}

/* ─── Google button ─── */
function GoogleButton({ onClick, loading, label }) {
    return (
        <button type="button" onClick={onClick} disabled={loading} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '11px 16px', borderRadius: 12,
            background: 'var(--bg-hover)', border: '1px solid var(--line)',
            color: 'var(--text)', fontSize: '0.95rem', fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1,
        }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = 'rgba(66,133,244,0.4)'; e.currentTarget.style.background = 'rgba(66,133,244,0.06)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
        >
            <GoogleIcon />
            {label}
        </button>
    );
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [gLoading, setGLoading] = useState(false);

    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    /* ─── Email login ─── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await login(email.trim(), password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(friendlyError(err.code));
        } finally { setLoading(false); }
    };

    /* ─── Google login ─── */
    const handleGoogle = async () => {
        setError(''); setGLoading(true);
        try {
            await loginWithGoogle();
            navigate('/dashboard', { replace: true });
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(friendlyError(err.code));
            }
        } finally { setGLoading(false); }
    };

    return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-dark)', minHeight: 'calc(100vh - 57px)' }}>
            <div className="ledger-card anim-fade" style={{ width: '100%', maxWidth: 400, padding: 32 }}>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Welcome back</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: 24 }}>Sign in to your Personal Ledger</p>

                {/* ── Google button ── */}
                <GoogleButton onClick={handleGoogle} loading={gLoading} label={gLoading ? 'Signing in…' : 'Sign in with Google'} />

                <OrDivider />

                {/* ── Email form ── */}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        <label htmlFor="le" style={{ fontSize: '0.88rem', color: 'var(--text-dim)', fontWeight: 500 }}>Email</label>
                        <input id="le" type="email" placeholder="you@example.com" required autoComplete="email"
                            value={email} onChange={(e) => setEmail(e.target.value)} className="ledger-input" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                        <label htmlFor="lp" style={{ fontSize: '0.88rem', color: 'var(--text-dim)', fontWeight: 500 }}>Password</label>
                        <input id="lp" type="password" placeholder="••••••••" required autoComplete="current-password"
                            value={password} onChange={(e) => setPassword(e.target.value)} className="ledger-input" />
                    </div>

                    {error && (
                        <div style={{ background: 'var(--negative-bg)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                            <p style={{ color: 'var(--negative)', fontSize: '0.88rem', margin: 0 }}>{error}</p>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: 12, fontSize: '1rem' }}>
                        {loading ? 'Signing in…' : 'Login'}
                    </button>
                </form>

                <p style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    Don&apos;t have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
                </p>
            </div>
        </div>
    );
}

/* Map Firebase error codes to friendly messages */
function friendlyError(code) {
    const map = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'auth/popup-blocked': 'Popup blocked. Allow popups for this site.',
    };
    return map[code] || 'Something went wrong. Please try again.';
}
