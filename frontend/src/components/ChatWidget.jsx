import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../services/api';

const SESSION_KEY = 'omniguard_session_id';

function getOrCreateSession() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) { id = uuidv4(); localStorage.setItem(SESSION_KEY, id); }
    return id;
}

function formatText(text) {
    return text;
}

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'System online. I am **OmniGuard AI**. How can I assist you with disaster protocols today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const sessionId = useRef(getOrCreateSession());

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await sendChatMessage(
                sessionId.current,
                text,
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

    const quickQueries = [
        { label: '⚠️ Earthquake Protocol', query: 'What should I do during an earthquake?' },
        { label: '🔥 Fire Evacuation', query: 'What are the evacuation guidelines for fires?' },
        { label: '🌊 Flood Safety', query: 'Flood safety measures' },
    ];

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
                    style={{ marginBottom: 16, width: 420, maxWidth: '90vw', height: 600, maxHeight: '85vh', display: 'flex', flexDirection: 'column', borderRadius: 20, border: '1px solid var(--color-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', background: 'rgba(9,11,20,0.97)', backdropFilter: 'blur(24px)', overflow: 'hidden' }}
                >
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ position: 'relative', width: 40, height: 40, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                                <i className="fa-solid fa-robot" style={{ color: 'white', fontSize: '1.1rem' }} />
                                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, background: '#22c55e', borderRadius: '50%', border: '2px solid #0f172a' }} />
                            </div>
                            <div>
                                <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    OmniGuard AI
                                    <span style={{ fontSize: '0.55rem', background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(59,130,246,0.3)', fontFamily: 'monospace', textTransform: 'uppercase' }}>Expert</span>
                                </h3>
                                <p style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Strategic Emergency Advisor</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button
                                id="chat-clear"
                                onClick={() => setMessages([{ role: 'assistant', content: 'Context cleared. How can I assist you?' }])}
                                style={{ width: 30, height: 30, borderRadius: '50%', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Clear Context"
                            >
                                <i className="fa-solid fa-rotate-right" style={{ fontSize: '0.75rem' }} />
                            </button>
                            <button
                                id="chat-close"
                                onClick={() => setOpen(false)}
                                style={{ width: 30, height: 30, borderRadius: '50%', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Minimize"
                            >
                                <i className="fa-solid fa-chevron-down" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        id="chat-messages"
                        style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(0,0,0,0.2)' }}
                        aria-live="polite"
                    >
                        {messages.map((msg, i) => (
                            <div key={i} className="animate-fade-in-up" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '88%', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    padding: '10px 14px', fontSize: '0.85rem', lineHeight: 1.6,
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
                                    <span style={{ fontSize: '0.65rem', color: '#60a5fa', fontFamily: 'monospace', marginLeft: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Processing</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick chips */}
                    <div style={{ padding: '8px 12px', background: 'rgba(17,24,39,0.9)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 6, overflowX: 'auto' }}>
                        {quickQueries.map(q => (
                            <button
                                key={q.label}
                                className="chip-btn"
                                onClick={() => { setInput(q.query); }}
                                style={{ flexShrink: 0 }}
                            >
                                {q.label}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div style={{ padding: 12, background: 'rgba(3,7,18,0.95)', borderTop: '1px solid var(--color-border)' }}>
                        <form id="chat-form" onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                                id="chat-input"
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a message..."
                                disabled={loading}
                                className="form-input"
                                style={{ flex: 1, borderRadius: 12 }}
                                autoComplete="off"
                            />
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
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                id="chat-toggle"
                onClick={() => setOpen(o => !o)}
                aria-label="Toggle AI Assistant"
                style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#4338ca)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(37,99,235,0.4)', transition: 'transform 0.2s', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span style={{ position: 'absolute', top: 0, right: 0 }}>
                    <span style={{ display: 'block', width: 14, height: 14, borderRadius: '50%', background: '#ef4444', border: '2px solid #030712', animation: 'pulseGlow 2s infinite' }} />
                </span>
            </button>
        </div>
    );
}
