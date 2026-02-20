import { useState, useRef, useEffect } from 'react';
import { CHATBOT_API_URL } from '../config';
import { getToken } from '../services/auth';
import './Chatbot.css';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const bottomRef = useRef(null);
  const chatHistoryRef = useRef([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamContent]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setLoading(true);
    setStreaming(true);
    setStreamContent('');

    const formattedHistory = chatHistoryRef.current.map(
      (item) => `${item.role}: ${item.text}`
    );

    try {
      const token = await getToken();
      const res = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          last_n_chats: formattedHistory,
          current_question: question
        })
      });
      if (!res.ok) throw new Error('Request failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamContent(full);
      }
      chatHistoryRef.current = [
        ...chatHistoryRef.current.slice(-10),
        { role: 'User', text: question },
        { role: 'Assistant', text: full }
      ];
      setMessages((m) => [...m, { role: 'bot', text: full }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'bot', text: 'Error: Could not reach the chatbot. Please try again.' }
      ]);
    } finally {
      setLoading(false);
      setStreaming(false);
      setStreamContent('');
    }
  };

  const displayContent = streaming ? streamContent : null;
  const lastBot = streaming && streamContent ? streamContent : null;

  return (
    <>
      <button
        type="button"
        className="chatbot-fab"
        onClick={() => setOpen(!open)}
        aria-label="Toggle chatbot"
      >
        💬
      </button>
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span>CogniMate</span>
            <button type="button" className="chatbot-close" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.length === 0 && !lastBot && (
              <p className="chatbot-placeholder">Ask about WCE courses, departments, or campus.</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg-${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {lastBot && <div className="chatbot-msg chatbot-msg-bot">{lastBot}</div>}
            <div ref={bottomRef} />
          </div>
          <div className="chatbot-input-wrap">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Type a message..."
              rows={2}
              disabled={loading}
            />
            <button
              type="button"
              className="chatbot-send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
