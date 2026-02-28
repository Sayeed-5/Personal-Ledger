import { useState, useEffect } from 'react';
import { addTransaction, updateTransaction } from '../../services/firestore';

/**
 * TransactionForm — matches old 3-column layout exactly
 * Amount | Date | Type (radio group in bordered box)
 * Note field
 * Full-width submit button
 */
export default function TransactionForm({ uid, personId, editingTransaction, onCancelEdit }) {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState('GIVEN');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!editingTransaction) setDate(new Date().toISOString().split('T')[0]);
    }, [editingTransaction]);

    useEffect(() => {
        if (editingTransaction) {
            setAmount(editingTransaction.amount?.toString() || '');
            setDate(editingTransaction.date || '');
            setType(editingTransaction.type || 'GIVEN');
            setNote(editingTransaction.note || '');
        }
    }, [editingTransaction]);

    const resetForm = () => {
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setType('GIVEN');
        setNote('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const parsed = parseFloat(amount);
        if (!parsed || parsed <= 0) { alert('Please enter a valid amount greater than 0.'); return; }
        setLoading(true);
        try {
            const payload = { personId, amount, date, type, note };
            if (editingTransaction) {
                await updateTransaction(uid, editingTransaction.id, payload);
                onCancelEdit();
            } else {
                await addTransaction(uid, payload);
            }
            resetForm();
        } catch (err) {
            console.error(err);
            alert('Failed to save transaction.');
        } finally { setLoading(false); }
    };

    return (
        <section className="ledger-card">
            <h3 style={{
                marginBottom: 20, fontWeight: 500, color: 'var(--color-text-dim)',
                textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em',
            }}>
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h3>

            <form onSubmit={handleSubmit}>
                {/* 3-column row */}
                <div className="form-grid-3" style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr',
                    gap: 16, marginBottom: 16,
                }}>
                    {/* Amount */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>Amount</label>
                        <input type="number" step="0.01" placeholder="0.00" required
                            value={amount} onChange={(e) => setAmount(e.target.value)}
                            className="ledger-input" />
                    </div>

                    {/* Date */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>Date</label>
                        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                            className="ledger-input" />
                    </div>

                    {/* Type */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>Type</label>
                        <div style={{
                            display: 'flex', gap: 16, alignItems: 'center', height: '100%',
                            backgroundColor: 'var(--color-bg-dark)',
                            border: '1px solid var(--color-line)', borderRadius: 12, padding: '0 12px',
                        }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}
                                onClick={() => setType('GIVEN')}>
                                <span className={`custom-radio ${type === 'GIVEN' ? 'checked' : ''}`} />
                                Given
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}
                                onClick={() => setType('RECEIVED')}>
                                <span className={`custom-radio ${type === 'RECEIVED' ? 'checked' : ''}`} />
                                Received
                            </label>
                        </div>
                    </div>
                </div>

                {/* Note */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>Note (optional)</label>
                    <input type="text" placeholder="e.g. Dinner, Movie tickets"
                        value={note} onChange={(e) => setNote(e.target.value)}
                        className="ledger-input" />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                    <button type="submit" disabled={loading} className="btn-primary"
                        style={{ flex: 1, minWidth: 140, padding: 12, fontSize: '1rem' }}>
                        {loading ? 'Saving…' : editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                    </button>
                    {editingTransaction && (
                        <button type="button" onClick={() => { resetForm(); onCancelEdit(); }}
                            className="btn-secondary" style={{ padding: '10px 16px' }}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}
