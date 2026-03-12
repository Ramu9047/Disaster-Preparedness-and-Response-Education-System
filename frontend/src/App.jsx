import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Guidelines from './pages/Guidelines';
import Emergency from './pages/Emergency';
import Contact from './pages/Contact';
import ChatWidget from './components/ChatWidget';

export default function App() {
    return (
        <BrowserRouter>
            <div className="app-bg" />
            <div className="pattern-overlay" style={{ position: 'fixed', inset: 0, zIndex: -1, opacity: 0.15 }} />
            <Navbar />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/guidelines" element={<Guidelines />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>
            <ChatWidget />
        </BrowserRouter>
    );
}
