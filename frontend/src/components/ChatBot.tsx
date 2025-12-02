import React, { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FiSend, FiMessageCircle, FiX, FiCopy, FiCheck, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import '../styles/ChatBot.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  id: string;
}

interface ChatBotProps {
  deviceName?: string;
  onClose?: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ deviceName, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatbot_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
      id: Date.now().toString() + Math.random(),
    };

    // Add user message to state
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Prepare message history for API (only role and content)
      const messageHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call Tauri backend
      const response = await invoke<string>('chat_message', {
        messages: messageHistory,
        deviceName: deviceName || null,
      });

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        id: Date.now().toString() + Math.random(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err as string);
      
      // Add error message as assistant response
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Error: ${err}\n\nPlease try again or rephrase your question.`,
        timestamp: Date.now(),
        id: Date.now().toString() + Math.random(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    localStorage.removeItem('chatbot_messages');
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatMessage = (content: string) => {
    // Simple formatting: detect code blocks and ADB commands
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Detect ADB commands or code blocks
      if (line.trim().startsWith('adb ') || line.trim().startsWith('pm ')) {
        return (
          <div key={i} className="code-block">
            <code>{line}</code>
            <button
              className="copy-code-btn"
              onClick={() => copyToClipboard(line.trim(), `line-${i}`)}
              title="Copy command"
            >
              {copiedId === `line-${i}` ? <FiCheck /> : <FiCopy />}
            </button>
          </div>
        );
      }
      return <p key={i}>{line}</p>;
    });
  };

  // Quick action buttons
  const quickActions = [
    { emoji: '🔍', label: 'Scan bloatware', query: 'Scan my device for common bloatware packages' },
    { emoji: '⚡', label: 'Battery tips', query: 'Which packages can I remove to improve battery life?' },
    { emoji: '🛡️', label: 'Privacy check', query: 'Show me tracking and telemetry packages' },
    { emoji: '🎯', label: 'Safe to remove', query: 'List absolutely safe packages to remove on Android' },
  ];

  const handleQuickAction = (query: string) => {
    setInput(query);
    // Auto-send after short delay
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-title">
          <FiMessageCircle className="w-5 h-5" />
          <span>AI Assistant</span>
          {deviceName && <span className="device-badge">{deviceName}</span>}
        </div>
        <div className="chat-header-actions">
          {messages.length > 0 && (
            <>
              <button onClick={clearChat} className="clear-btn" title="Clear chat history">
                <FiTrash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="refresh-btn" 
                title="Refresh chat"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
          {onClose && (
            <button onClick={onClose} className="close-btn" title="Close chat">
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <FiMessageCircle className="w-12 h-12 mb-4 opacity-30" />
            <h3>Android Debloating Assistant</h3>
            <p>Ask me anything about Android packages, debloating strategies, or device safety.</p>
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-action-btn"
                  onClick={() => handleQuickAction(action.query)}
                >
                  <span className="action-emoji">{action.emoji}</span>
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{formatMessage(msg.content)}</div>
              <div className="message-actions">
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                <button
                  className="copy-msg-btn"
                  onClick={() => copyToClipboard(msg.content, msg.id)}
                  title="Copy message"
                >
                  {copiedId === msg.id ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="message assistant typing">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="typing-text">AI is thinking...</div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about Android packages..."
          disabled={loading}
          className="chat-input"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="send-btn"
          title="Send message"
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
