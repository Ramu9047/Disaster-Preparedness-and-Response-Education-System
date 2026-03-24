import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
    ADMIN:     '#ef4444',
    OFFICER:   '#f97316',
    RESCUE:    '#22c55e',
    CITIZEN:   '#3b82f6',
    VOLUNTEER: '#a855f7',
};
const ROLE_ICONS = {
    ADMIN:     'fa-crown',
    OFFICER:   'fa-user-shield',
    RESCUE:    'fa-person-running',
    CITIZEN:   'fa-user',
    VOLUNTEER: 'fa-hands-helping',
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

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
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    { pageLanguage: 'en' },
                    'google_translate_element'
                );
            };
        }
    }, []);

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/login');
    };

    const linkCls = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');
    const roleColor = user ? (ROLE_COLORS[user.role] || '#3b82f6') : '#3b82f6';
    const roleIcon  = user ? (ROLE_ICONS[user.role]  || 'fa-user')   : 'fa-user';

    return (
        <header className="glass-nav" style={{
            position: 'sticky', top: 0, zIndex: 1000,
            padding: '10px 20px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', gap: 12
        }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <button
                    className="lg-hidden"
                    onClick={() => setMenuOpen(o => !o)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
                    aria-label="Toggle Menu"
                >
                    <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
                </button>
                <i className="fa-solid fa-shield-halved" style={{ color: '#3b82f6', fontSize: '1.4rem', animation: 'pulseGlow 2s infinite' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'white', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#3b82f6' }}>OmniGuard</span> AI
                </span>
            </div>

            {/* Nav Links */}
            <nav id="main-nav" style={{
                ...(typeof window !== 'undefined' && window.innerWidth >= 1024
                    ? { display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }
                    : menuOpen
                        ? { display: 'flex', flexDirection: 'column', gap: '2px', position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(3,7,18,0.98)', padding: '12px 20px', borderBottom: '1px solid var(--color-border)', zIndex: 999 }
                        : { display: 'none' })
            }} className="desktop-nav">
                <NavLink to="/" className={linkCls} end>🗺️ Live Map</NavLink>
                <NavLink to="/guidelines" className={linkCls}>📋 Guidelines</NavLink>
                <NavLink to="/emergency" className={linkCls}>🚨 Emergency</NavLink>
                <NavLink to="/documents" className={linkCls}>📚 Docs</NavLink>
                <NavLink to="/contact" className={linkCls}>📞 Contacts</NavLink>
                
                {user ? (
                    <NavLink to="/command-center" className={linkCls} style={{ color: roleColor, background: `${roleColor}10`, border: `1px solid ${roleColor}30`, borderRadius: 8, padding: '5px 10px', fontWeight: 700, fontSize: '0.78rem' }}>
                        <i className={`fa-solid ${roleIcon}`} style={{ marginRight: 5 }} />
                        Command Center
                    </NavLink>
                ) : null}

                {(!user || user.role === 'CITIZEN' || user.role === 'VOLUNTEER') && (
                    <NavLink to="/volunteer" className={linkCls}>🤝 Volunteer</NavLink>
                )}

                {/* Accessibility tools */}
                <div style={{ display: 'flex', gap: 4, marginLeft: 8, paddingLeft: 8, borderLeft: '1px solid var(--color-border)', alignItems: 'center' }}>
                    <div id="google_translate_element" style={{}} />
                    <button
                        onClick={() => setHighContrast(p => !p)}
                        style={{ width: 30, height: 30, borderRadius: '50%', background: highContrast ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)', border: 'none', color: highContrast ? 'white' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="High Contrast" aria-label="High Contrast"
                    >
                        <i className="fa-solid fa-circle-half-stroke" style={{ fontSize: '0.8rem' }} />
                    </button>
                    <button
                        onClick={() => setLargeText(p => !p)}
                        style={{ width: 30, height: 30, borderRadius: '50%', background: largeText ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)', border: 'none', color: largeText ? 'white' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Larger Text" aria-label="Larger Text"
                    >
                        <i className="fa-solid fa-text-height" style={{ fontSize: '0.8rem' }} />
                    </button>
                </div>
            </nav>

            {/* Right: User profile OR Login button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {user ? (
                    <div style={{ position: 'relative' }}>
                        <button
                            id="user-menu-btn"
                            onClick={() => setShowUserMenu(p => !p)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 30, background: `${roleColor}15`, border: `1px solid ${roleColor}30`, cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = `${roleColor}25`}
                            onMouseLeave={e => e.currentTarget.style.background = `${roleColor}15`}
                        >
                            {/* Avatar circle */}
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}, ${roleColor}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', color: 'white' }}>
                                {user.avatar}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.72rem', color: 'white', fontWeight: 700, lineHeight: 1.2, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                                <div style={{ fontSize: '0.62rem', color: roleColor, fontWeight: 600 }}>{user.role}</div>
                            </div>
                            <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.6rem', color: '#94a3b8', marginLeft: 2 }} />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'rgba(10,15,30,0.98)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 10, minWidth: 220, boxShadow: '0 20px 60px rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', zIndex: 9999 }}>
                                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 8 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{user.username}</div>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}30` }}>{user.role}</span>
                                        {user.badge && <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid var(--color-border)' }}>{user.badge}</span>}
                                    </div>
                                </div>
                                {[
                                    { icon: 'fa-gauge-high', label: 'Command Center', onClick: () => { navigate('/command-center'); setShowUserMenu(false); } },
                                    { icon: 'fa-chart-bar', label: 'Reports & Analytics', onClick: () => { navigate('/reports'); setShowUserMenu(false); } },
                                    { icon: 'fa-map', label: 'Live Map', onClick: () => { navigate('/'); setShowUserMenu(false); } },
                                ].map(item => (
                                    <button key={item.label} onClick={item.onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textAlign: 'left', transition: 'all 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                        <i className={`fa-solid ${item.icon}`} style={{ width: 16, color: '#64748b' }} />{item.label}
                                    </button>
                                ))}
                                <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 8, paddingTop: 8 }}>
                                    <button
                                        id="logout-btn"
                                        onClick={handleLogout}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, textAlign: 'left', transition: 'all 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                    >
                                        <i className="fa-solid fa-right-from-bracket" style={{ width: 16 }} />Sign Out
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Click-outside overlay */}
                        {showUserMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setShowUserMenu(false)} />}
                    </div>
                ) : (
                    <button
                        id="login-nav-btn"
                        onClick={() => navigate('/login')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <i className="fa-solid fa-right-to-bracket" />
                        Sign In
                    </button>
                )}

                {/* Emergency call button (mobile) */}
                <a
                    href="tel:112"
                    className="lg-hidden"
                    style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '0.85rem', flexShrink: 0 }}
                    aria-label="Emergency Call 112"
                >
                    <i className="fa-solid fa-phone" />
                </a>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    #main-nav.desktop-nav { display: flex !important; flex-direction: row !important; align-items: center !important; }
                    .lg-hidden { display: none !important; }
                }
                @media (max-width: 1023px) {
                    #main-nav.desktop-nav:not([style*="flex"]) { display: none; }
                }
            `}</style>
        </header>
    );
}
