  // Remove misplaced hooks outside ChatRebuild
import React, { useEffect, useRef, useState } from 'react';
import styles from '../../components/Chat/Chat.module.css';
import { CanvasRebuild } from '../../components/Canvas/CanvasManager';
// Fallback for marked
let marked: any;
try {
  marked = require('marked');
} catch {
  marked = (s: string) => s;
}
// Fallback for DOMPurify
let DOMPurify: any;
try {
  DOMPurify = require('dompurify');
} catch {
  DOMPurify = { sanitize: (s: string) => s };
}
// Fallback for CHAT_API_URL and saveMessages
let CHAT_API_URL = '/api/v1/chat/message';
let saveMessages = (msgs: any) => {};
try {
  const api = require('../../utils/api');
  CHAT_API_URL = api.CHAT_API_URL || CHAT_API_URL;
  saveMessages = api.saveMessages || saveMessages;
} catch {}
// Fallback for Message type
type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  htmlContent?: string;
};

function ChatRebuild() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [malformed, setMalformed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // New Chat handler
  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setError(null);
    setMalformed(false);
    window.dispatchEvent(new Event('newChat'));
  };
  // Debug modal state
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  // Debug modal event listener
  useEffect(() => {
    const handler = (e: Event) => {
      setShowDebug(true);
      setDebugInfo({ messages, error, malformed });
    };
    window.addEventListener('showDebug', handler);
    return () => window.removeEventListener('showDebug', handler);
  }, [messages, error, malformed]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);
    setMalformed(false);

    try {
  const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          conversation_id: null,
          persona: 'transformation_analyst'
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data || typeof data !== 'object') {
        setMalformed(true);
        return;
      }

      // Main agent message
      let agentMessage: Message | null = null;
      if (data.message && typeof data.message === 'string') {
        agentMessage = {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content: data.message,
          createdAt: new Date().toISOString(),
          htmlContent: DOMPurify.sanitize(marked(data.message) as string)
        };
      }

      if (agentMessage) {
        const updatedMessages = [...newMessages, agentMessage];
        setMessages(updatedMessages);
        saveMessages(updatedMessages);
      } else {
        setMalformed(true);
      }

      // Handle artifacts from backend
      if (Array.isArray(data.artifacts) && data.artifacts.length > 0) {
        // Dispatch artifacts to canvas
        window.dispatchEvent(new CustomEvent('chat:artifacts', { 
          detail: { artifacts: data.artifacts } 
        }));
      }
    } catch (e) {
      console.error('Chat error:', e);
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
      setInput(messages[messages.length - 1].content);
      setMessages(messages.slice(0, -1));
      setError(null);
      setMalformed(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      {/* Top control buttons */}
      <div style={{ textAlign: 'right', margin: '8px 0', display: 'flex', gap: '8px' }}>
        <button className="history-btn" onClick={() => window.dispatchEvent(new Event('showHistory'))}>History</button>
        <button className="new-chat-btn" onClick={handleNewChat}>New Chat</button>
        <button className="canvas-toggle-btn" onClick={() => window.dispatchEvent(new Event('toggleCanvas'))}>Canvas</button>
        <button className="debug-btn" onClick={() => window.dispatchEvent(new Event('showDebug'))}>Show Debug</button>
      </div>
      {/* Mount CanvasRebuild so it can render when mode !== 'hidden' */}
      <CanvasRebuild />
      <div className={styles.messages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
            {msg.htmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: msg.htmlContent }} />
            ) : (
              <div>{msg.content}</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && (
        <div className={styles.error}>
          {error} <button onClick={handleRetry}>Retry</button>
        </div>
      )}
      {malformed && (
        <div className={styles.error}>
          Connection error. <button onClick={handleRetry}>Click here to retry.</button>
        </div>
      )}
      {showDebug && (
        <div className={styles.debugModal}>
          <h3>Debug Info</h3>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          <button onClick={() => setShowDebug(false)}>Close</button>
        </div>
      )}
      <div className={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={loading}
          autoFocus
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export { ChatRebuild };
