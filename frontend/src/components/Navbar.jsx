import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);

    useEffect(() => {
        if (highContrast) document.body.classList.add('high-contrast');
        else document.body.classList.remove('high-contrast');
    }, [highContrast]);

    useEffect(() => {
        if (largeText) document.body.classList.add('large-text');
        else document.body.classList.remove('large-text');
    }, [largeText]);

    useEffect(() => {
        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);

            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement({pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
            };
        }
    }, []);


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
                <NavLink to="/documents" className={linkCls}>Doc Library</NavLink>
                <NavLink to="/contact" className={linkCls}>Contacts</NavLink>
                <a href="/pages/preparedness.html" className="nav-link">Kit Planner</a>
                <a href="/pages/training.html" className="nav-link">Training</a>
                <a href="/pages/news.html" className="nav-link">News</a>
                <a href="/pages/volunteer.html" className="nav-link">Volunteer</a>
                <a href="/pages/report.html" className="nav-link">Report</a>
                <a href="/pages/risk.html" className="nav-link">Risk Map</a>
                <a href="/pages/resources.html" className="nav-link">Shelters</a>
                <a href="/pages/predict.html" className="nav-link">AI Predict</a>

                <div style={{ display: 'flex', gap: '6px', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid var(--color-border)', alignItems: 'center' }}>
                    <div id="google_translate_element" style={{ transform: 'scale(0.8)', transformOrigin: 'center right', marginRight: '4px' }}></div>
                    <button
                        onClick={() => setHighContrast(p => !p)}
                        style={{ width: 32, height: 32, borderRadius: '50%', background: highContrast ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', border: 'none', color: highContrast ? 'white' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="High Contrast" aria-label="High Contrast"
                    >
                        <i className="fa-solid fa-circle-half-stroke" style={{ fontSize: '0.85rem' }} />
                    </button>
                    <button
                        onClick={() => setLargeText(p => !p)}
                        style={{ width: 32, height: 32, borderRadius: '50%', background: largeText ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', border: 'none', color: largeText ? 'white' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
