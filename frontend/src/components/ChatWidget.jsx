import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../services/api';

const SESSION_KEY = 'omniguard_session_id';

function getOrCreateSession() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) { id = uuidv4(); localStorage.setItem(SESSION_KEY, id); }
    return id;
}

// ── Language config ──────────────────────────────────────────────────────────
const LANGUAGES = [
    { code: 'en', label: 'English',    flag: '🇬🇧', placeholder: 'Type a message...',           greeting: 'System online. I am **OmniGuard AI**. How can I assist you with disaster protocols today?' },
    { code: 'hi', label: 'हिन्दी',     flag: '🇮🇳', placeholder: 'संदेश टाइप करें...',          greeting: 'सिस्टम ऑनलाइन। मैं **OmniGuard AI** हूँ। आज आपदा प्रोटोकॉल में मैं आपकी कैसे सहायता कर सकता हूँ?' },
    { code: 'ta', label: 'தமிழ்',      flag: '🏳️', placeholder: 'செய்தி தட்டச்சு செய்க...', greeting: 'சிஸ்டம் ஆன்லைன். நான் **OmniGuard AI**. பேரிடர் நெறிமுறைகளில் உங்களுக்கு எப்படி உதவ முடியும்?' },
    { code: 'te', label: 'తెలుగు',     flag: '🏳️', placeholder: 'సందేశం టైప్ చేయండి...',    greeting: 'సిస్టమ్ ఆన్‌లైన్. నేను **OmniGuard AI**. విపత్తు ప్రోటోకాల్‌లలో నేను మీకు ఎలా సహాయం చేయగలను?' },
    { code: 'ml', label: 'മലയാളം',   flag: '🏳️', placeholder: 'സന്ദേശം ടൈപ്പ് ചെയ്യൂ...',  greeting: 'സിസ്റ്റം ഓൺലൈൻ. ഞാൻ **OmniGuard AI** ആണ്. ദുരന്ത പ്രോട്ടോക്കോളുകളിൽ ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?' },
    { code: 'bn', label: 'বাংলা',      flag: '🏳️', placeholder: 'বার্তা টাইপ করুন...',        greeting: 'সিস্টেম অনলাইন। আমি **OmniGuard AI**। আজ দুর্যোগ প্রোটোকলে আপনাকে কীভাবে সাহায্য করতে পারি?' },
    { code: 'mr', label: 'मराठी',      flag: '🏳️', placeholder: 'संदेश टाइप करा...',           greeting: 'सिस्टम ऑनलाइन. मी **OmniGuard AI** आहे. आज आपत्ती प्रोटोकॉलमध्ये मी तुम्हाला कशी मदत करू शकतो?' },
];

// Quick queries per language
const QUICK_QUERIES = {
    en: [
        { label: '⚠️ Earthquake', query: 'What should I do during an earthquake?' },
        { label: '🔥 Fire', query: 'What are fire evacuation guidelines?' },
        { label: '🌊 Flood', query: 'Flood safety measures' },
        { label: '🌀 Cyclone', query: 'Cyclone preparedness steps' },
    ],
    hi: [
        { label: '⚠️ भूकंप', query: 'भूकंप के दौरान क्या करें?' },
        { label: '🔥 आग', query: 'आग से बचाव के उपाय' },
        { label: '🌊 बाढ़', query: 'बाढ़ सुरक्षा उपाय' },
        { label: '🌀 चक्रवात', query: 'चक्रवात की तैयारी' },
    ],
    ta: [
        { label: '⚠️ நிலநடுக்கம்', query: 'நிலநடுக்கம் நேரத்தில் என்ன செய்வது?' },
        { label: '🌊 வெள்ளம்', query: 'வெள்ள பாதுகாப்பு நடவடிக்கைகள்' },
        { label: '🌀 புயல்', query: 'புயல் தயாரிப்பு படிகள்' },
        { label: '🏠 தங்குமிடம்', query: 'அருகிலுள்ள தங்குமிடங்கள் எங்கே?' },
    ],
    te: [
        { label: '⚠️ భూకంపం', query: 'భూకంపం సమయంలో ఏమి చేయాలి?' },
        { label: '🌊 వరద', query: 'వరద భద్రతా చర్యలు' },
        { label: '🌀 తుఫాను', query: 'తుఫాను సంసిద్ధత' },
        { label: '🏠 ఆశ్రయం', query: 'సమీపంలో ఆశ్రయ కేంద్రాలు' },
    ],
    ml: [
        { label: '⚠️ ഭൂകമ്പം', query: 'ഭൂകമ്പ സമയത്ത് എന്ത് ചെയ്യണം?' },
        { label: '🌊 വെള്ളപ്പൊക്കം', query: 'വെള്ളപ്പൊക്ക സുരക്ഷ' },
        { label: '🌀 ചുഴലിക്കാറ്റ്', query: 'ചുഴലിക്കാറ്റ് തയ്യാറെടുപ്പ്' },
        { label: '🏠 അഭയകേന്ദ്രം', query: 'സമീപ അഭയകേന്ദ്രങ്ങൾ' },
    ],
    bn: [
        { label: '⚠️ ভূমিকম্প', query: 'ভূমিকম্পের সময় কী করতে হবে?' },
        { label: '🌊 বন্যা', query: 'বন্যা নিরাপত্তা ব্যবস্থা' },
        { label: '🌀 ঘূর্ণিঝড়', query: 'ঘূর্ণিঝড় প্রস্তুতি' },
        { label: '🏠 আশ্রয়কেন্দ্র', query: 'কাছের আশ্রয়কেন্দ্র কোথায়?' },
    ],
    mr: [
        { label: '⚠️ भूकंप', query: 'भूकंप वेळी काय करावे?' },
        { label: '🌊 पूर', query: 'पूर सुरक्षा उपाय' },
        { label: '🌀 चक्रीवादळ', query: 'चक्रीवादळ तयारी' },
        { label: '🏠 निवारा', query: 'जवळचे निवारा केंद्र कोठे?' },
    ],
};

// Build a language-aware system prefix for the backend message
function buildMessageWithLanguage(text, langCode) {
    if (langCode === 'en') return text;
    const lang = LANGUAGES.find(l => l.code === langCode);
    return `[Respond in ${lang?.label || 'English'} language only] ${text}`;
}

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [langCode, setLangCode] = useState('en');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: LANGUAGES[0].greeting }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Voice input state
    const [listening, setListening] = useState(false);
    const [voiceSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    const recognitionRef = useRef(null);

    const messagesEndRef = useRef(null);
    const sessionId = useRef(getOrCreateSession());
    const currentLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Change language and reset chat with new greeting
    const changeLanguage = (code) => {
        setLangCode(code);
        setShowLangMenu(false);
        const lang = LANGUAGES.find(l => l.code === code);
        setMessages([{ role: 'assistant', content: lang.greeting }]);
    };

    // ── Voice input ──────────────────────────────────────────────────────────
    const startVoice = useCallback(() => {
        if (!voiceSupported || listening) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        // Map our language codes to BCP-47 tags
        const bcp47 = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN' };
        recognition.lang = bcp47[langCode] || 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onerror = () => setListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };

        recognition.start();
    }, [voiceSupported, listening, langCode]);

    const stopVoice = useCallback(() => {
        recognitionRef.current?.stop();
        setListening(false);
    }, []);

    // ── Send message ─────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e?.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const localizedText = buildMessageWithLanguage(text, langCode);
            const res = await sendChatMessage(
                sessionId.current,
                localizedText,
                messages.slice(-5)
            );
            const reply = res.data?.reply || res.data?.message || 'No response received.';
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            console.error('Chat error:', err);
            const errMsg = err.response?.data?.reply || err.message || 'AI service unavailable. Please try again.';
            setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}` }]);
        } finally {
            setLoading(false);
        }
    };

    const quickQueries = QUICK_QUERIES[langCode] || QUICK_QUERIES.en;

    return (
        <div
            id="chatbot-container"
            style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', zIndex: 99999 }}
            aria-label="Disaster AI Assistant"
        >
            {/* Chat Window */}
            {open && (
                <div
                    id="chat-window"
                    className="animate-fade-in-up"
                    style={{ marginBottom: 16, width: 440, maxWidth: '90vw', height: 620, maxHeight: '85vh', display: 'flex', flexDirection: 'column', borderRadius: 20, border: '1px solid var(--color-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', background: 'rgba(9,11,20,0.97)', backdropFilter: 'blur(24px)', overflow: 'hidden' }}
                >
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <div style={{ position: 'relative', width: 38, height: 38, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                                <i className="fa-solid fa-robot" style={{ color: 'white', fontSize: '1rem' }} />
                                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, background: '#22c55e', borderRadius: '50%', border: '2px solid #0f172a' }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                                    OmniGuard AI
                                    <span style={{ fontSize: '0.5rem', background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '2px 5px', borderRadius: 4, border: '1px solid rgba(59,130,246,0.3)', fontFamily: 'monospace', textTransform: 'uppercase' }}>Expert</span>
                                </h3>
                                <p style={{ fontSize: '0.6rem', color: '#64748b', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Strategic Emergency Advisor</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                            {/* Language selector */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    id="chat-lang-btn"
                                    onClick={() => setShowLangMenu(p => !p)}
                                    title="Change Language"
                                    style={{ height: 28, borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', fontSize: '0.7rem', fontWeight: 600 }}
                                >
                                    <span>{currentLang.flag}</span>
                                    <span>{currentLang.label}</span>
                                    <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.55rem' }} />
                                </button>
                                {showLangMenu && (
                                    <div style={{ position: 'absolute', top: 34, right: 0, background: '#0f172a', border: '1px solid var(--color-border)', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.7)', zIndex: 10, minWidth: 160, overflow: 'hidden' }}>
                                        {LANGUAGES.map(l => (
                                            <button
                                                key={l.code}
                                                onClick={() => changeLanguage(l.code)}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: langCode === l.code ? 'rgba(59,130,246,0.15)' : 'none', border: 'none', color: langCode === l.code ? '#93c5fd' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: langCode === l.code ? 700 : 400, textAlign: 'left' }}
                                                onMouseEnter={e => { if (langCode !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                                onMouseLeave={e => { if (langCode !== l.code) e.currentTarget.style.background = 'none'; }}
                                            >
                                                <span>{l.flag}</span>
                                                <span>{l.label}</span>
                                                {langCode === l.code && <i className="fa-solid fa-check" style={{ marginLeft: 'auto', fontSize: '0.7rem' }} />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                id="chat-clear"
                                onClick={() => setMessages([{ role: 'assistant', content: currentLang.greeting }])}
                                style={{ width: 28, height: 28, borderRadius: '50%', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Clear Context"
                            >
                                <i className="fa-solid fa-rotate-right" style={{ fontSize: '0.72rem' }} />
                            </button>
                            <button
                                id="chat-close"
                                onClick={() => setOpen(false)}
                                style={{ width: 28, height: 28, borderRadius: '50%', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Minimize"
                            >
                                <i className="fa-solid fa-chevron-down" />
                            </button>
                        </div>
                    </div>

                    {/* Voice Listening Banner */}
                    {listening && (
                        <div style={{ background: 'rgba(239,68,68,0.12)', borderBottom: '1px solid rgba(239,68,68,0.2)', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulseGlow 1s infinite', display: 'block' }} />
                            <span style={{ fontSize: '0.72rem', color: '#fca5a5', fontWeight: 600, fontFamily: 'monospace' }}>
                                Listening in {currentLang.label}... Speak now
                            </span>
                            <button onClick={stopVoice} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Stop</button>
                        </div>
                    )}

                    {/* Messages */}
                    <div
                        id="chat-messages"
                        style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(0,0,0,0.2)' }}
                        aria-live="polite"
                        onClick={() => setShowLangMenu(false)}
                    >
                        {messages.map((msg, i) => (
                            <div key={i} className="animate-fade-in-up" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '88%', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    padding: '10px 14px', fontSize: '0.84rem', lineHeight: 1.6,
                                    background: msg.role === 'user' ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : 'rgba(30,41,59,0.9)',
                                    color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                }}>
                                    <ReactMarkdown
                                        components={{
                                            strong: ({ children }) => <strong style={{ color: msg.role === 'assistant' ? '#93c5fd' : 'white', fontWeight: 700 }}>{children}</strong>,
                                            p: ({ children }) => <p style={{ margin: '2px 0' }}>{children}</p>,
                                            li: ({ children }) => <li style={{ marginLeft: 16, marginBottom: 2 }}>{children}</li>,
                                        }}
                                    >{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div id="typing-indicator" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid var(--color-border)', borderRadius: '18px 18px 18px 4px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div className="bounce-1" style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
                                    <div className="bounce-2" style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
                                    <div className="bounce-3" style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
                                    <span style={{ fontSize: '0.62rem', color: '#60a5fa', fontFamily: 'monospace', marginLeft: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Processing</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick chips */}
                    <div style={{ padding: '7px 10px', background: 'rgba(17,24,39,0.9)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 5, overflowX: 'auto', flexWrap: 'nowrap' }}>
                        {quickQueries.map(q => (
                            <button
                                key={q.label}
                                className="chip-btn"
                                onClick={() => { setInput(q.query); }}
                                style={{ flexShrink: 0, fontSize: '0.7rem', padding: '4px 10px' }}
                            >
                                {q.label}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div style={{ padding: 10, background: 'rgba(3,7,18,0.95)', borderTop: '1px solid var(--color-border)' }}>
                        <form id="chat-form" onSubmit={handleSubmit} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                                id="chat-input"
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={currentLang.placeholder}
                                disabled={loading}
                                className="form-input"
                                style={{ flex: 1, borderRadius: 12, fontSize: '0.84rem' }}
                                autoComplete="off"
                            />
                            {/* Voice button */}
                            {voiceSupported && (
                                <button
                                    id="voice-btn"
                                    type="button"
                                    onClick={listening ? stopVoice : startVoice}
                                    title={listening ? 'Stop listening' : `Voice input (${currentLang.label})`}
                                    style={{
                                        width: 40, height: 40, borderRadius: 12, flexShrink: 0, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                        background: listening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                                        color: listening ? '#ef4444' : '#64748b',
                                        boxShadow: listening ? '0 0 12px rgba(239,68,68,0.4)' : 'none',
                                    }}
                                >
                                    <i className={`fa-solid ${listening ? 'fa-stop' : 'fa-microphone'}`} style={{ fontSize: '0.85rem' }} />
                                </button>
                            )}
                            <button
                                id="send-btn"
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="btn-primary"
                                style={{ padding: '10px 14px', borderRadius: 12, flexShrink: 0 }}
                            >
                                {loading
                                    ? <i className="fa-solid fa-circle-notch spin" />
                                    : <i className="fa-solid fa-paper-plane" />}
                            </button>
                        </form>
                        {voiceSupported && (
                            <div style={{ textAlign: 'center', marginTop: 5, fontSize: '0.6rem', color: '#334155', fontFamily: 'monospace' }}>
                                🎙️ Voice input available in {currentLang.label}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                id="chat-toggle"
                onClick={() => { setOpen(o => !o); setShowLangMenu(false); }}
                aria-label="Toggle AI Assistant"
                style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#4338ca)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', transition: 'transform 0.2s', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                {/* Language flag badge on toggle button */}
                <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: '0.65rem', background: '#1e1b4b', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #030712' }}>
                    {currentLang.flag}
                </span>
            </button>
        </div>
    );
}
