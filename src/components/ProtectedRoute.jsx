import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: 'var(--color-bg-dark)',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 40, height: 40,
                        border: '3px solid rgba(6,182,212,0.2)',
                        borderTopColor: 'var(--color-accent)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>Loading…</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    return children;
}
