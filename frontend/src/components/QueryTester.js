import React, { useState, useRef, useEffect } from 'react';
import { classifyQuery, getAutoReply } from '../api';
import { CATEGORY_COLORS, CATEGORY_ICONS, SOURCE_LABELS } from '../constants';

const SOURCES = ['website_chat', 'whatsapp', 'instagram', 'email'];

const SOURCE_PLATFORM_ICONS = {
  website_chat: '🌐',
  whatsapp:     '💬',
  instagram:    '📸',
  email:        '📧',
};

const SAMPLE_QUERIES = [
  "Where is my order? It's been 6 days since I placed it.",
  "I want a refund. The product was damaged.",
  "My payment was deducted but order not placed.",
  "What are the ingredients in your whey protein?",
  "Delivery is delayed by 3 days. What's happening?",
  "I want to cancel my subscription plan.",
];

// ─── Typing animation dots ────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#6366f1',
          animation: 'bounce 1.2s infinite ease-in-out',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── User bubble (right side) ─────────────────────────────────────────────────
function UserBubble({ text, source, time }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px', gap: '10px', alignItems: 'flex-end' }}>
      <div style={{ maxWidth: '65%', textAlign: 'right' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', color: '#6b7280', marginBottom: '5px',
        }}>
          <span>{SOURCE_PLATFORM_ICONS[source]} {SOURCE_LABELS[source] || source}</span>
          <span>·</span>
          <span>{time}</span>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', borderRadius: '18px 18px 4px 18px',
          padding: '12px 16px', fontSize: '14px', lineHeight: '1.6',
          boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          textAlign: 'left',
        }}>
          {text}
        </div>
      </div>
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
      }}>
        👤
      </div>
    </div>
  );
}

// ─── AI response bubble (left side) ──────────────────────────────────────────
function AIBubble({ category, method, autoReply, time }) {
  const catColor = CATEGORY_COLORS[category] || '#6366f1';
  const isEscalate = autoReply?.escalate;

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '18px', gap: '10px', alignItems: 'flex-end' }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #1e1e2e, #2a2a3e)',
        border: '2px solid #3a3a5c',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px',
      }}>
        🤖
      </div>
      <div style={{ maxWidth: '70%' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', color: '#6b7280', marginBottom: '5px',
        }}>
          <span>Beastlife AI</span>
          <span>·</span>
          <span>{time}</span>
          <span style={{
            fontSize: '10px', padding: '1px 7px', borderRadius: '20px',
            background: method === 'openai_gpt' ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
            color: method === 'openai_gpt' ? '#22c55e' : '#a78bfa',
            border: `1px solid ${method === 'openai_gpt' ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.3)'}`,
          }}>
            {method === 'openai_gpt' ? '✨ GPT' : '⚡ Keyword AI'}
          </span>
        </div>

        {/* Category tag row */}
        <div style={{
          background: '#1a1a2e', border: `1px solid ${catColor}33`,
          borderRadius: '10px 10px 0 0', padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '16px' }}>{CATEGORY_ICONS[category]}</span>
          <span style={{ fontWeight: '700', fontSize: '13px', color: catColor }}>{category}</span>
          <span style={{
            marginLeft: 'auto', fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
            background: isEscalate ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
            color: isEscalate ? '#ef4444' : '#22c55e',
            border: `1px solid ${isEscalate ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
          }}>
            {isEscalate ? '🚨 Escalate to Human' : '✅ AI Can Handle'}
          </span>
        </div>

        {/* Auto-reply message body */}
        {autoReply && (
          <div style={{
            background: '#131320',
            border: `1px solid ${catColor}22`,
            borderTop: 'none',
            borderRadius: '0 0 18px 4px',
            padding: '14px 16px',
            fontSize: '13px', color: '#c4c4d4',
            lineHeight: '1.75', whiteSpace: 'pre-wrap', fontFamily: 'inherit',
          }}>
            {autoReply.auto_reply}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Thinking bubble ──────────────────────────────────────────────────────────
function ThinkingBubble() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '18px', gap: '10px', alignItems: 'flex-end' }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #1e1e2e, #2a2a3e)',
        border: '2px solid #3a3a5c',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
      }}>
        🤖
      </div>
      <div style={{
        background: '#1a1a2e', border: '1px solid #2a2a3e',
        borderRadius: '18px 18px 18px 4px', padding: '12px 18px',
      }}>
        <TypingDots />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function QueryTester({ onNewQuery }) {
  const [messages, setMessages] = useState([]);          // { id, type, text, source, category, method, autoReply, time, error }
  const [input, setInput] = useState('');
  const [source, setSource] = useState('website_chat');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const sendMessage = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;

    const userMsg = { id: Date.now(), type: 'user', text: msgText, source, time: now() };
    const thinkingId = Date.now() + 1;

    setMessages(prev => [...prev, userMsg, { id: thinkingId, type: 'thinking' }]);
    setInput('');
    setLoading(true);

    try {
      // Classify and fetch auto-reply in parallel
      const [classRes, replyRes] = await Promise.all([
        classifyQuery(msgText, source),
        getAutoReply(msgText),
      ]);

      const aiMsg = {
        id: Date.now() + 2,
        type: 'ai',
        category: classRes.data.category,
        method: classRes.data.method,
        autoReply: replyRes.data,
        time: now(),
      };

      setMessages(prev => prev.filter(m => m.id !== thinkingId).concat(aiMsg));
      if (onNewQuery) onNewQuery();
    } catch {
      setMessages(prev => prev.filter(m => m.id !== thinkingId).concat({
        id: Date.now() + 2, type: 'error',
        text: '⚠️ Could not reach the backend. Make sure the API server is running on port 8000.',
        time: now(),
      }));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      border: '1px solid #2a2a3e', borderRadius: '16px',
      marginBottom: '24px', overflow: 'hidden',
      height: '720px',
    }}>

      {/* ── Header bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid #2a2a3e',
        background: 'rgba(0,0,0,0.25)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#e8e8f0' }}>Beastlife Support AI</div>
            <div style={{ fontSize: '11px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Online · AI-powered classifier
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {messages.length > 0 && (
            <button onClick={clearChat} style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171', borderRadius: '8px', padding: '5px 12px',
              fontSize: '12px', cursor: 'pointer',
            }}>
              🗑 Clear chat
            </button>
          )}
          <select value={source} onChange={e => setSource(e.target.value)} style={{
            background: '#0f0f1a', border: '1px solid #3a3a5c', borderRadius: '8px',
            color: '#e8e8f0', padding: '6px 10px', fontSize: '12px',
            cursor: 'pointer', outline: 'none',
          }}>
            {SOURCES.map(s => (
              <option key={s} value={s}>{SOURCE_PLATFORM_ICONS[s]} {SOURCE_LABELS[s] || s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Message area ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 20px 4px',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '20px',
            color: '#4b5563', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px' }}>💬</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#6b7280', marginBottom: '6px' }}>
                Test the AI Classifier
              </div>
              <div style={{ fontSize: '13px', color: '#4b5563' }}>
                Type any customer message below or pick a sample
              </div>
            </div>
            {/* Sample query pills in empty state */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '520px' }}>
              {SAMPLE_QUERIES.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)',
                  color: '#a78bfa', borderRadius: '20px', padding: '6px 14px',
                  fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s',
                  textAlign: 'left',
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.18)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                >
                  {q.length > 45 ? q.slice(0, 43) + '…' : q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation thread */}
        {messages.map(msg => {
          if (msg.type === 'user') return <UserBubble key={msg.id} text={msg.text} source={msg.source} time={msg.time} />;
          if (msg.type === 'thinking') return <ThinkingBubble key={msg.id} />;
          if (msg.type === 'ai') return <AIBubble key={msg.id} category={msg.category} method={msg.method} autoReply={msg.autoReply} time={msg.time} />;
          if (msg.type === 'error') return (
            <div key={msg.id} style={{
              display: 'flex', justifyContent: 'flex-start', marginBottom: '18px',
              gap: '10px', alignItems: 'flex-end',
            }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1e1e2e', border: '2px solid #3a3a5c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', fontSize: '13px', color: '#f87171', maxWidth: '60%' }}>
                {msg.text}
              </div>
            </div>
          );
          return null;
        })}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick picks strip (visible when chat has messages) ── */}
      {messages.length > 0 && (
        <div style={{
          padding: '8px 16px', borderTop: '1px solid #1e1e2e',
          display: 'flex', gap: '6px', overflowX: 'auto', flexShrink: 0,
        }}>
          {SAMPLE_QUERIES.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} style={{
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
              color: '#a78bfa', borderRadius: '16px', padding: '4px 12px',
              fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'background 0.15s',
            }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
            >
              {q.length > 38 ? q.slice(0, 36) + '…' : q}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: '10px',
        padding: '12px 16px', borderTop: '1px solid #2a2a3e',
        background: 'rgba(0,0,0,0.25)', flexShrink: 0,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a customer message and press Enter…"
          rows={1}
          style={{
            flex: 1, background: '#0f0f1a', border: '1px solid #3a3a5c',
            borderRadius: '12px', color: '#e8e8f0', padding: '10px 14px',
            fontSize: '14px', resize: 'none', outline: 'none',
            fontFamily: 'inherit', lineHeight: '1.5', maxHeight: '120px',
            overflowY: 'auto',
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          title="Send (Enter)"
          style={{
            width: '42px', height: '42px', flexShrink: 0,
            background: input.trim() && !loading
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : '#1e1e2e',
            border: '1px solid #3a3a5c', borderRadius: '12px',
            color: input.trim() && !loading ? '#fff' : '#4b5563',
            fontSize: '18px', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
            boxShadow: input.trim() && !loading ? '0 0 14px rgba(99,102,241,0.4)' : 'none',
          }}
        >
          {loading ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
}
