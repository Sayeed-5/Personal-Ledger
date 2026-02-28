import { deleteTransaction } from '../../services/firestore';

/**
 * TransactionList — Table exactly matching old design
 * Compact table headers, type badges, row hover, action buttons.
 */
export default function TransactionList({ uid, transactions, onEditTransaction }) {
    const handleDelete = async (txId) => {
        if (window.confirm('Delete this transaction?')) {
            await deleteTransaction(uid, txId);
        }
    };

    const sorted = [...transactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    return (
        <section className="ledger-card">
            <h3 style={{
                marginBottom: 20, fontWeight: 500, color: 'var(--color-text-dim)',
                textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em',
            }}>
                Transactions
            </h3>

            {sorted.length === 0 ? (
                <p style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>
                    No transactions yet
                </p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                        <thead>
                            <tr>
                                {['DATE', 'TYPE', 'AMOUNT', 'NOTE', 'ACTIONS'].map((h) => (
                                    <th key={h} style={{
                                        textAlign: 'left', padding: '12px 16px',
                                        color: 'var(--color-text-dim)', fontWeight: 600,
                                        fontSize: '0.75rem', textTransform: 'uppercase',
                                        borderBottom: '1px solid var(--color-line)',
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((tx) => {
                                const isGiven = tx.type === 'GIVEN';
                                return (
                                    <tr key={tx.id}
                                        style={{ transition: 'background-color 0.15s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <td style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.03)', verticalAlign: 'middle' }}>
                                            {tx.date}
                                        </td>
                                        <td style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.03)', verticalAlign: 'middle' }}>
                                            <span className={`type-badge ${isGiven ? 'type-given' : 'type-received'}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: 16, borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            verticalAlign: 'middle',
                                            color: isGiven ? 'var(--color-text-main)' : 'var(--color-negative)',
                                        }}>
                                            {parseFloat(tx.amount).toFixed(2)}
                                        </td>
                                        <td style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.03)', verticalAlign: 'middle' }}>
                                            {tx.note || '—'}
                                        </td>
                                        <td style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.03)', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <button onClick={() => onEditTransaction(tx)} className="icon-btn edit" title="Edit"
                                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 8 }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleDelete(tx.id)} className="icon-btn delete" title="Delete"
                                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 8 }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
