import { useState } from 'react';
import { addPerson, updatePerson, deletePerson } from '../../services/firestore';

/**
 * PeopleList — Left sidebar panel
 * Exact replica of old sidebar design with proper spacing.
 */
export default function PeopleList({ uid, people, transactions, activePersonId, onSelectPerson }) {
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const getBalance = (personId) => {
        return transactions
            .filter((t) => t.personId === personId)
            .reduce((acc, t) => {
                const amt = parseFloat(t.amount) || 0;
                if (t.type === 'GIVEN') return acc + amt;
                if (t.type === 'RECEIVED') return acc - amt;
                return acc;
            }, 0);
    };

    const handleAdd = async () => {
        const trimmed = newName.trim();
        if (!trimmed) return;
        await addPerson(uid, trimmed);
        setNewName('');
    };

    const handleStartEdit = (e, person) => {
        e.stopPropagation();
        setEditingId(person.id);
        setEditName(person.name);
    };

    const handleSaveEdit = async (e) => {
        e.stopPropagation();
        const trimmed = editName.trim();
        if (trimmed) await updatePerson(uid, editingId, trimmed);
        setEditingId(null);
    };

    const handleCancelEdit = (e) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const handleDelete = async (e, personId) => {
        e.stopPropagation();
        if (window.confirm('Delete this person and all their transactions?')) {
            await deletePerson(uid, personId);
            if (activePersonId === personId) onSelectPerson(null);
        }
    };

    return (
        <aside className="dashboard-sidebar" style={{
            backgroundColor: 'var(--color-bg-panel)',
            borderRadius: 16, padding: 20,
            border: '1px solid rgba(255,255,255,0.03)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', minHeight: 0,
        }}>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>People</h2>
            </div>

            {/* Add person form */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                <input
                    type="text"
                    placeholder="Add new person..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="ledger-input"
                    style={{ flex: 1 }}
                />
                <button onClick={handleAdd} className="btn-primary">Add</button>
            </div>

            {/* People list */}
            <div style={{
                flex: 1, overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: 8,
                paddingRight: 4,
            }}>
                {people.length === 0 && (
                    <p style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem', textAlign: 'center', padding: '32px 0' }}>
                        No people added yet
                    </p>
                )}

                {people.map((person) => {
                    const balance = getBalance(person.id);
                    const isActive = activePersonId === person.id;
                    const isEditing = editingId === person.id;

                    let badgeClass = 'badge badge-neutral';
                    if (balance > 0) badgeClass = 'badge badge-positive';
                    if (balance < 0) badgeClass = 'badge badge-negative';

                    return (
                        <div
                            key={person.id}
                            onClick={() => !isEditing && onSelectPerson(person.id)}
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px',
                                backgroundColor: isActive ? 'rgba(6,182,212,0.15)' : 'transparent',
                                border: isActive ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent',
                                borderRadius: 16, cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'; }}
                            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            {/* Left: Name + Balance */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                {isEditing ? (
                                    <input
                                        type="text" value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveEdit(e);
                                            if (e.key === 'Escape') handleCancelEdit(e);
                                        }}
                                        autoFocus
                                        className="ledger-input"
                                        style={{ flex: 1, padding: '6px 10px', fontSize: '0.9rem', borderColor: 'var(--color-accent)' }}
                                    />
                                ) : (
                                    <span style={{ fontWeight: 500 }}>{person.name}</span>
                                )}
                                <span className={badgeClass}>{balance.toFixed(2)}</span>
                            </div>

                            {/* Right: Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                {isEditing ? (
                                    <>
                                        <button onClick={handleSaveEdit} className="icon-btn edit" title="Save">
                                            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </button>
                                        <button onClick={handleCancelEdit} className="icon-btn delete" title="Cancel">
                                            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={(e) => handleStartEdit(e, person)} className="icon-btn edit" title="Edit Name">
                                            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                        </button>
                                        <button onClick={(e) => handleDelete(e, person.id)} className="icon-btn delete" title="Delete">
                                            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
