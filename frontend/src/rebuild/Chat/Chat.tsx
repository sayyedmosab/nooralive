import React, { useEffect, useRef, useState } from 'react';
import styles from './Chat.module.css';

type Message = { id: string; role: 'user' | 'agent' | 'system'; content: string; createdAt: string };

const REBUILD_API = process.env.REACT_APP_REBUILD_API_URL || '/api/v1/chat/message';
const STORAGE_KEY = 'rebuild_chat_history_v1';

async function postWithRetry(url: string, body: any, retries = 2, backoff = 300) {
  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      try {
        return { ok: res.ok, status: res.status, json: JSON.parse(text) };
      } catch (e) {
        return { ok: res.ok, status: res.status, json: text };
      }
    } catch (err) {
      if (attempt >= retries) throw err;
      attempt += 1;
      // exponential backoff
      await new Promise(r => setTimeout(r, backoff * attempt));
    }
  }
}

export default function ChatRebuild() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch (e) { }
  }, [messages]);

  const append = (m: Message) => setMessages(prev => [...prev, m]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: String(Date.now()), role: 'user', content: text, createdAt: new Date().toISOString() };
    append(userMsg);
    setLastPrompt(text);
    setInput('');
    setLoading(true);
    try {
      const { ok, json } = await postWithRetry(REBUILD_API, { query: text }, 2, 250);
      if (!mounted.current) return;
      if (!ok) {
        append({ id: String(Date.now()+1), role: 'system', content: `Server returned status ${json && json.status ? json.status : 'error'}`, createdAt: new Date().toISOString() });
      } else if (json && json.message) {
        append({ id: String(Date.now()+2), role: 'agent', content: typeof json.message === 'string' ? json.message : JSON.stringify(json.message), createdAt: new Date().toISOString() });
        // Emit event to allow Canvas to react to structured payloads
        try {
          const parsed = typeof json.message === 'string' ? (() => { try { return JSON.parse(json.message); } catch { return null; } })() : json.message;
          if (parsed && typeof parsed === 'object') window.dispatchEvent(new CustomEvent('chat:structured', { detail: parsed }));
        } catch (_) {}
      } else {
        append({ id: String(Date.now()+3), role: 'system', content: 'Unexpected response from server', createdAt: new Date().toISOString() });
      }
    } catch (err: any) {
      append({ id: String(Date.now()+4), role: 'system', content: `Network error: ${err?.message || err}`, createdAt: new Date().toISOString() });
    } finally {
      if (mounted.current) setLoading(false);
      setTimeout(() => {
        const el = document.querySelector('#rebuild-chat .messages') as HTMLElement | null;
        if (el) el.scrollTop = el.scrollHeight;
      }, 60);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) send(input.trim());
  };

  const handleRetry = () => {
    if (lastPrompt) send(lastPrompt);
  };

  const clearConversation = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('newChat'));
  };

  return (
    <div id="rebuild-chat" className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Rebuild Chat (isolated)</div>
        <div>
          <button onClick={clearConversation} className={styles.headerBtn}>New</button>
          <button onClick={handleRetry} className={styles.headerBtn} disabled={!lastPrompt}>Retry</button>
        </div>
      </div>
      <div className={styles.messages}>
        {messages.map(m => (
          <div key={m.id} className={`${styles.message} ${styles[m.role] || ''}`}>
            <div className={styles.meta}>{m.role} • {new Date(m.createdAt).toLocaleTimeString()}</div>
            <div className={styles.content}>{m.content}</div>
          </div>
        ))}
      </div>
      <div className={styles.inputRow}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button onClick={() => send(input)} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}
