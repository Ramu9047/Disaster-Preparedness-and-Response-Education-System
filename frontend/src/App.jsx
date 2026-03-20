import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DisasterDataProvider } from './context/DisasterDataContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Guidelines from './pages/Guidelines';
import Emergency from './pages/Emergency';
import Contact from './pages/Contact';
import DocumentLibrary from './pages/DocumentLibrary';
import Login from './pages/Login';
import CommandCenter from './pages/CommandCenter';
import Reports from './pages/Reports';
import ChatWidget from './components/ChatWidget';
import EscalationEngine from './components/EscalationEngine';

// Protected route: only accessible when logged in
function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

// Auth route: redirect logged-in users away from login page
function AuthRoute({ children }) {
    const { user } = useAuth();
    if (user) return <Navigate to="/command-center" replace />;
    return children;
}

function AppContent() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallBtn, setShowInstallBtn] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBtn(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setShowInstallBtn(false);
        setDeferredPrompt(null);
    };

    return (
        <>
            <div className="app-bg" />
            <div className="pattern-overlay" style={{ position: 'fixed', inset: 0, zIndex: -1, opacity: 0.15 }} />
            <EscalationEngine />
            <Navbar />
            {showInstallBtn && (
                <div style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', padding: '12px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, zIndex: 1000, position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <i className="fa-solid fa-mobile-screen-button" />
                        Install OmniGuard AI for reliable offline access &amp; push alerts.
                    </div>
                    <button onClick={handleInstallClick} style={{ background: 'white', color: '#2563eb', border: 'none', borderRadius: 20, padding: '6px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Install App</button>
                    <button onClick={() => setShowInstallBtn(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', marginLeft: 'auto' }} aria-label="Dismiss"><i className="fa-solid fa-xmark" /></button>
                </div>
            )}
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/guidelines" element={<Guidelines />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/documents" element={<DocumentLibrary />} />
                <Route path="/contact" element={<Contact />} />

                {/* Auth route (login) */}
                <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />

                {/* Protected routes (require login) */}
                <Route path="/command-center" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ChatWidget />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <DisasterDataProvider>
                    <AppContent />
                </DisasterDataProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
