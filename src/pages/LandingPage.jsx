import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ══════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════ */
const I = (d, size = 26) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {d}
    </svg>
);

const IconSync = () => I(<><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" /></>);
const IconDevices = () => I(<><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>);
const IconShield = () => I(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />);
const IconScale = () => I(<><line x1="12" y1="3" x2="12" y2="21" /><polyline points="8 8 4 12 8 16" /><polyline points="16 8 20 12 16 16" /></>);
const IconHeart = () => I(<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />);
const IconSimple = () => I(<><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>);
const IconEye = () => I(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>);
const IconStudent = () => I(<><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>);
const IconFamily = () => I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>);
const IconFreelance = () => I(<><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>);
const IconGroup = () => I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>);
const IconLock = () => I(<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>);
const IconChevron = ({ open }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'transform 0.3s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

/* ══════════════════════════════════════════════════════
   REUSABLE CARD COMPONENTS
══════════════════════════════════════════════════════ */

/* Icon Box used in all cards */
const IconBox = ({ children }) => (
    <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'rgba(6,182,212,0.1)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
    }}>
        {children}
    </div>
);

/* Section heading */
const SectionHead = ({ title, subtitle }) => (
    <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.01em' }}>
            {title}
        </h2>
        {subtitle && (
            <p style={{ color: 'var(--text-dim)', fontSize: '1rem', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
                {subtitle}
            </p>
        )}
    </div>
);

/* Feature card (hover border effect) */
function Card({ icon, title, desc, wide = false }) {
    return (
        <div className="ledger-card" style={{ cursor: 'default', transition: 'all 0.25s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.background = 'var(--bg-panel)'; }}
        >
            <IconBox>{icon}</IconBox>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{title}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.65 }}>{desc}</p>
        </div>
    );
}

/* Step card */
function StepCard({ number, title, desc }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(6,182,212,0.12)', border: '2px solid rgba(6,182,212,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
            }}>
                <span style={{ color: 'var(--accent)', fontSize: '1.25rem', fontWeight: 700 }}>{number}</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{title}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.65, maxWidth: 240 }}>{desc}</p>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════════════════════ */
function AccordionItem({ question, answer, isOpen, onToggle }) {
    const bodyRef = useRef(null);

    return (
        <div className="ledger-card" style={{ padding: 0, overflow: 'hidden', transition: 'border-color 0.2s', borderColor: isOpen ? 'var(--accent-border)' : 'var(--card-border)' }}>
            {/* Header / trigger */}
            <button
                onClick={onToggle}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '18px 22px', background: 'transparent', border: 'none',
                    color: 'var(--text)', fontSize: '0.97rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', gap: 12,
                }}
            >
                {question}
                <span style={{ color: isOpen ? 'var(--accent)' : 'var(--text-dim)', transition: 'color 0.25s' }}>
                    <IconChevron open={isOpen} />
                </span>
            </button>

            {/* Collapsible body — grid trick for smooth animation */}
            <div style={{
                display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.32s ease',
            }}>
                <div style={{ overflow: 'hidden' }}>
                    <p ref={bodyRef} style={{ padding: '0 22px 20px', color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}

function FAQAccordion({ items }) {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item, i) => (
                <AccordionItem
                    key={i}
                    question={item.q}
                    answer={item.a}
                    isOpen={openIndex === i}
                    onToggle={() => toggle(i)}
                />
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   SCROLL REVEAL (lightweight intersection observer)
══════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0 }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.12 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        }}>
            {children}
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   SECTION DIVIDER
══════════════════════════════════════════════════════ */
const Divider = () => (
    <div style={{ width: '100%', height: 1, background: 'var(--line-faint)', margin: 0 }} />
);

/* ══════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════ */
function Footer() {
    const linkStyle = {
        color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.9rem',
        transition: 'color 0.2s', display: 'inline-block',
    };
    const hover = (e) => { e.currentTarget.style.color = 'var(--accent)'; };
    const unhover = (e) => { e.currentTarget.style.color = 'var(--text-dim)'; };

    return (
        <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-panel)', transition: 'background 0.25s' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>

                {/* Left — Brand */}
                <div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Personal Ledger</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 16, maxWidth: 220 }}>
                        Track every rupee, settle every debt. Real-time sync, completely private.
                    </p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                        © {new Date().getFullYear()} Personal Ledger
                    </p>
                </div>

                {/* Center — Quick Links */}
                <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                        Quick Links
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { label: 'Home', to: '/' },
                            { label: 'Dashboard', to: '/dashboard' },
                            { label: 'Login', to: '/login' },
                            { label: 'Register', to: '/register' },
                        ].map(({ label, to }) => (
                            <Link key={label} to={to} style={linkStyle} onMouseEnter={hover} onMouseLeave={unhover}>
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
            <div style={{ borderTop: '1px solid var(--line-faint)', padding: '16px 24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    Made with ♥ for real people managing real money.
                </p>
            </div>
        </footer>
    );
}

/* ══════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════ */
const MAX = { maxWidth: 1100, margin: '0 auto' };
const SEC = (extra = {}) => ({ padding: '80px 24px', ...extra });
const ALT_BG = {
    background: 'var(--bg-panel)',
    borderTop: '1px solid var(--line-faint)',
    borderBottom: '1px solid var(--line-faint)',
    transition: 'background 0.25s',
};

const FAQ_ITEMS = [
    {
        q: 'Is my data private and secure?',
        a: 'Yes, completely. Every piece of data is stored under your Firebase UID in isolated Firestore collections — users/{uid}/people and users/{uid}/transactions. No one else can ever access your data, not even through shared queries.',
    },
    {
        q: 'Can I use it across multiple devices?',
        a: 'Absolutely. Sign in from any device — phone, tablet, or laptop — and your ledger syncs automatically in real-time using Firebase Firestore listeners. Changes appear instantly everywhere.',
    },
    {
        q: 'Is Personal Ledger free?',
        a: 'Yes, 100% free. There are no subscriptions, premium tiers, or hidden charges. You get full real-time sync and unlimited people and transactions for free.',
    },
    {
        q: 'Does it work offline?',
        a: 'Firebase Firestore provides offline persistence by default. You can view your existing data offline, and any writes you make will automatically sync once you\'re back online.',
    },
    {
        q: 'How is the balance calculated?',
        a: 'Balances are computed dynamically every time — never stored in the database. GIVEN transactions increase the balance (they owe you), RECEIVED transactions decrease it (you owe them). The net determines the status.',
    },
    {
        q: 'Can I install it on my phone?',
        a: 'Yes! Personal Ledger is a Progressive Web App (PWA). Open it in Chrome or Safari, then use "Add to Home Screen" — it will behave exactly like a native app with offline support.',
    },
];

export default function LandingPage() {
    const { user } = useAuth();

    return (
        <div style={{ background: 'var(--bg-dark)', minHeight: 'calc(100vh - 57px)', transition: 'background 0.25s' }}>

            {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
            <section style={{ position: 'relative', padding: '88px 24px 100px', textAlign: 'center', overflow: 'hidden' }}>
                {/* Glow orb */}
                <div style={{
                    position: 'absolute', top: '40%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600, height: 600,
                    background: 'rgba(6,182,212,0.04)', borderRadius: '50%',
                    filter: 'blur(110px)', pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
                    {/* Status pill */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 18px', borderRadius: 9999,
                        background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
                        color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 700,
                        letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 36,
                    }}>
                        <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                        Now with Real-time Sync &amp; PWA Support
                    </div>

                    <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

                    <h1 style={{
                        fontSize: 'clamp(2.2rem, 5.5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.13,
                        color: 'var(--text)', marginBottom: 22, letterSpacing: '-0.025em',
                    }}>
                        Track Every Rupee,{' '}
                        <span style={{ color: 'var(--accent)' }}>Settle Every Debt</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-dim)',
                        maxWidth: 500, margin: '0 auto 44px', lineHeight: 1.75,
                    }}>
                        A minimal personal ledger to manage who owes you and who you owe.
                        Synced in real-time, across all your devices — completely private.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
                        {user ? (
                            <Link to="/dashboard" className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none' }}>
                                Go to Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none' }}>
                                    Get Started — It&apos;s Free
                                </Link>
                                <Link to="/login" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem', textDecoration: 'none' }}>
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <Divider />

            {/* ════════════════════════════════════
          FEATURES — Everything You Need
      ════════════════════════════════════ */}
            <section style={SEC()}>
                <div style={MAX}>
                    <Reveal>
                        <SectionHead title="Everything You Need" subtitle="Simple, fast, and secure — designed for real people managing real money." />
                    </Reveal>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
                        {[
                            { icon: <IconSync />, title: 'Real-time Sync', desc: 'All changes sync instantly across every device. No refresh needed — ever.' },
                            { icon: <IconDevices />, title: 'Multi-device', desc: 'Use on phone, tablet, or laptop. Your ledger follows you everywhere.' },
                            { icon: <IconShield />, title: 'Secure & Private', desc: 'Data stored privately under your account. Nobody else can see it.' },
                            { icon: <IconScale />, title: 'Debt Tracking', desc: 'Auto-calculated balances — always know exactly who owes what.' },
                        ].map((c, i) => (
                            <Reveal key={c.title} delay={i * 80}>
                                <Card {...c} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <Divider />

            {/* ════════════════════════════════════
          WHY PERSONAL LEDGER?
      ════════════════════════════════════ */}
            <section style={{ ...SEC(), ...ALT_BG }}>
                <div style={MAX}>
                    <Reveal>
                        <SectionHead title="Why Personal Ledger?" subtitle="No spreadsheets, no banking apps — just a clean tool built for how people actually lend money." />
                    </Reveal>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                        {[
                            {
                                icon: <IconHeart />,
                                title: 'Built for Real-life Lending',
                                desc: 'Whether it\'s splitting a dinner bill or lending money to family, Personal Ledger tracks the exact amounts between you and each person.',
                            },
                            {
                                icon: <IconSimple />,
                                title: 'No Complicated Finance Terms',
                                desc: 'Just "GIVEN" and "RECEIVED". No ledger jargon, no confusing debit/credit columns — everyone understands it immediately.',
                            },
                            {
                                icon: <IconEye />,
                                title: 'Crystal Clear Debt Visibility',
                                desc: 'A single glance shows you who owes you, who you owe, and exactly how much. Positive, negative, or settled — always clear.',
                            },
                        ].map((c, i) => (
                            <Reveal key={c.title} delay={i * 80}>
                                <Card {...c} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <Divider />

            {/* ════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════ */}
            <section style={SEC()}>
                <div style={{ maxWidth: 860, margin: '0 auto' }}>
                    <Reveal>
                        <SectionHead title="How It Works" subtitle="Three simple steps to financial clarity." />
                    </Reveal>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 40 }}>
                        {[
                            { number: '1', title: 'Add People', desc: 'Create entries for friends, family, or colleagues you exchange money with.' },
                            { number: '2', title: 'Log Transactions', desc: 'Record each exchange as GIVEN or RECEIVED with an amount, date, and optional note.' },
                            { number: '3', title: 'Track Balances', desc: 'See auto-calculated balances instantly — know exactly who owes what at all times.' },
                        ].map((s, i) => (
                            <Reveal key={s.number} delay={i * 100}>
                                <StepCard {...s} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <Divider />

            {/* ════════════════════════════════════
          WHO IS IT FOR?
      ════════════════════════════════════ */}
            <section style={{ ...SEC(), ...ALT_BG }}>
                <div style={MAX}>
                    <Reveal>
                        <SectionHead title="Who Is It For?" subtitle="Anyone who lends or borrows money regularly and wants a clear picture." />
                    </Reveal>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
                        {[
                            { icon: <IconStudent />, title: 'Students', desc: 'Track shared expenses with roommates, split food bills, and keep hostel lending organized.' },
                            { icon: <IconFamily />, title: 'Families', desc: 'Keep track of money exchanged between family members without awkward conversations.' },
                            { icon: <IconFreelance />, title: 'Freelancers', desc: 'Log client payments, advances, and outstanding dues in one place — simple and clean.' },
                            { icon: <IconGroup />, title: 'Small Groups', desc: 'Friends who travel or dine together can track who owes what without a group chat argument.' },
                        ].map((c, i) => (
                            <Reveal key={c.title} delay={i * 80}>
                                <Card {...c} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <Divider />

            {/* ════════════════════════════════════
          DATA & SECURITY
      ════════════════════════════════════ */}
            <section style={SEC()}>
                <div style={{ maxWidth: 760, margin: '0 auto' }}>
                    <Reveal>
                        <SectionHead title="Your Data. Your Privacy." />
                    </Reveal>
                    <Reveal delay={80}>
                        <div className="ledger-card" style={{ padding: '32px 36px', borderColor: 'rgba(6,182,212,0.18)', position: 'relative', overflow: 'hidden' }}>
                            {/* Subtle accent glow */}
                            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(6,182,212,0.05)', filter: 'blur(40px)', pointerEvents: 'none' }} />

                            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>
                                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconLock />
                                </div>
                                <div style={{ flex: 1, minWidth: 220 }}>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                                        Isolated, User-scoped Storage
                                    </h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: 20 }}>
                                        All your data lives under <code style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--accent)', padding: '2px 7px', borderRadius: 6, fontSize: '0.85rem', fontFamily: 'monospace' }}>users/{'{uid}'}/...</code> in Firestore.
                                        There are no global collections. Nobody can access your records — not other users, not administrators.
                                        Your Firebase UID is the only key that unlocks your data.
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                        {['No shared data', 'Private by design', 'Firebase Auth protected', 'No analytics tracking'].map((tag) => (
                                            <span key={tag} style={{
                                                padding: '5px 12px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600,
                                                background: 'rgba(6,182,212,0.08)', color: 'var(--accent)', border: '1px solid rgba(6,182,212,0.2)',
                                            }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            <Divider />

            {/* ════════════════════════════════════
          FAQ ACCORDION
      ════════════════════════════════════ */}
            <section style={{ ...SEC(), ...ALT_BG }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <Reveal>
                        <SectionHead title="Frequently Asked Questions" subtitle="Everything you need to know before getting started." />
                    </Reveal>
                    <Reveal delay={60}>
                        <FAQAccordion items={FAQ_ITEMS} />
                    </Reveal>
                </div>
            </section>

            <Divider />

            {/* ════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════ */}
            {!user && (
                <section style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <Reveal>
                        <div style={{ maxWidth: 560, margin: '0 auto' }}>
                            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.02em' }}>
                                Start Tracking Today
                            </h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1rem', marginBottom: 36, lineHeight: 1.7 }}>
                                Free, private, and available everywhere. No credit card required.
                            </p>
                            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link to="/register" className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none' }}>
                                    Create a Free Account
                                </Link>
                                <Link to="/login" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem', textDecoration: 'none' }}>
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </Reveal>
                </section>
            )}

            {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
            <Footer />
        </div>
    );
}
