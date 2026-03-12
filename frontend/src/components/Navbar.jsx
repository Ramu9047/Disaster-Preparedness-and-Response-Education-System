import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const linkCls = ({ isActive }) =>
        'nav-link' + (isActive ? ' active' : '');

    return (
        <header className="glass-nav" style={{
            position: 'sticky', top: 0, zIndex: 1000,
            padding: '12px 24px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center'
        }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                    className="lg-hidden"
                    onClick={() => setMenuOpen(o => !o)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
                    aria-label="Toggle Menu"
                >
                    <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
                </button>
                <i className="fa-solid fa-earth-americas" style={{ color: 'var(--color-blue)', fontSize: '1.4rem', animation: 'pulseGlow 2s infinite' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>
                    <span style={{ color: 'var(--color-blue)' }}>OmniGuard</span> AI
                </span>
            </div>

            {/* Nav Links */}
            <nav id="main-nav" style={{
                display: menuOpen ? 'flex' : undefined,
                flexDirection: menuOpen ? 'column' : undefined,
                gap: '4px',
                ...(typeof window !== 'undefined' && window.innerWidth >= 1024
                    ? { display: 'flex', flexDirection: 'row', gap: '4px' }
                    : menuOpen
                        ? { display: 'flex' }
                        : { display: 'none' })
            }} className="desktop-nav">
                <NavLink to="/" className={linkCls} end>Dashboard</NavLink>
                <NavLink to="/guidelines" className={linkCls}>Guidelines</NavLink>
                <NavLink to="/emergency" className={linkCls}>Emergency</NavLink>
                <NavLink to="/contact" className={linkCls}>Contacts</NavLink>

                <div style={{ display: 'flex', gap: '6px', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid var(--color-border)' }}>
                    <button
                        style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="High Contrast" aria-label="High Contrast"
                    >
                        <i className="fa-solid fa-circle-half-stroke" style={{ fontSize: '0.85rem' }} />
                    </button>
                    <button
                        style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Larger Text" aria-label="Larger Text"
                    >
                        <i className="fa-solid fa-text-height" style={{ fontSize: '0.85rem' }} />
                    </button>
                </div>
            </nav>

            {/* Emergency CTA (mobile) */}
            <a
                href="tel:911"
                className="lg-hidden"
                style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '0.85rem' }}
                aria-label="Emergency Call"
            >
                <i className="fa-solid fa-phone" />
            </a>

            <style>{`
        @media (min-width: 1024px) {
          #main-nav.desktop-nav { display: flex !important; flex-direction: row !important; }
          .lg-hidden { display: none !important; }
        }
        @media (max-width: 1023px) {
          #main-nav.desktop-nav:not([style*="flex"]) { display: none; }
        }
      `}</style>
        </header>
    );
}
