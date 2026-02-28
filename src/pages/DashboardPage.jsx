import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToPeople, subscribeToTransactions } from '../services/firestore';
import PeopleList from '../components/dashboard/PeopleList';
import BalanceCard from '../components/dashboard/BalanceCard';
import TransactionForm from '../components/dashboard/TransactionForm';
import TransactionList from '../components/dashboard/TransactionList';

/**
 * DashboardPage — exact replica of old layout
 * Grid: 30% sidebar | 70% main content
 */
export default function DashboardPage() {
    const { user } = useAuth();
    const uid = user?.uid;

    const [people, setPeople] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [activePersonId, setActivePersonId] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);

    useEffect(() => {
        if (!uid) return;
        const unsub1 = subscribeToPeople(uid, setPeople);
        const unsub2 = subscribeToTransactions(uid, setTransactions);
        return () => { unsub1(); unsub2(); };
    }, [uid]);

    const activePerson = people.find((p) => p.id === activePersonId) || null;
    const activeTransactions = transactions.filter((t) => t.personId === activePersonId);

    const activeBalance = activeTransactions.reduce((acc, t) => {
        const amt = parseFloat(t.amount) || 0;
        if (t.type === 'GIVEN') return acc + amt;
        if (t.type === 'RECEIVED') return acc - amt;
        return acc;
    }, 0);

    return (
        <div className="dashboard-layout" style={{
            width: '100%', flex: 1, minHeight: 0,
            maxWidth: 1600, margin: '0 auto',
            display: 'grid', gridTemplateColumns: '30% 70%',
            padding: 24, gap: 24,
            height: 'calc(100vh - 57px)',
        }}>
            <PeopleList
                uid={uid} people={people} transactions={transactions}
                activePersonId={activePersonId}
                onSelectPerson={(id) => { setActivePersonId(id); setEditingTransaction(null); }}
            />

            <main style={{ minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
                {!activePerson ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-dim)', fontSize: '1.1rem' }}>
                        <p>Select a person to view details</p>
                    </div>
                ) : (
                    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <BalanceCard person={activePerson} balance={activeBalance} />
                        <TransactionForm uid={uid} personId={activePersonId} editingTransaction={editingTransaction} onCancelEdit={() => setEditingTransaction(null)} />
                        <TransactionList uid={uid} transactions={activeTransactions} onEditTransaction={(tx) => setEditingTransaction(tx)} />
                    </div>
                )}
            </main>
        </div>
    );
}
