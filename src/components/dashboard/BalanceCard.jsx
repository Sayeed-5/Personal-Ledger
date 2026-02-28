/**
 * BalanceCard — Summary card matching old design exactly
 * Large name, large colored balance, status text
 */
export default function BalanceCard({ person, balance }) {
    if (!person) return null;

    let balanceColor = 'var(--color-text-main)';
    let statusText = 'Settled up';

    if (balance > 0) {
        balanceColor = 'var(--color-positive)';
        statusText = 'You will receive';
    } else if (balance < 0) {
        balanceColor = 'var(--color-negative)';
        statusText = 'You owe';
    }

    return (
        <section className="ledger-card">
            <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>{person.name}</h1>
            <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: '3rem', fontWeight: 700, color: balanceColor }}>
                    {Math.abs(balance).toFixed(2)}
                </span>
            </div>
            <p style={{ color: 'var(--color-text-dim)', fontSize: '1rem' }}>{statusText}</p>
        </section>
    );
}
