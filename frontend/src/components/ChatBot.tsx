import React, { useState, useRef, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FiSend, FiMessageCircle, FiX, FiCopy, FiCheck, FiTrash2, FiRefreshCw, FiDownload, FiUpload, FiMic } from 'react-icons/fi';
import { Message } from '../types';
import { storage, storageKeys } from '../utils/storage';
import { messageUtils } from '../utils/messageUtils';
import '../styles/ChatBot.css';

interface ChatBotProps {
  deviceName?: string;
  onClose?: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ deviceName, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load messages from storage on mount
  useEffect(() => {
    const saved = storage.get<Message[]>(storageKeys.CHAT_MESSAGES, []);
    if (saved) setMessages(saved);
  }, []);

  // Save messages to storage whenever they change
  useEffect(() => {
    if (messages.length > 0) storage.set(storageKeys.CHAT_MESSAGES, messages);
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Generate suggested replies based on last message
  const generateSuggestions = useCallback((lastMessage: string) => {
    setSuggestedReplies(messageUtils.generateSuggestions(lastMessage));
  }, []);

  // Export chat history
  const exportChat = () => {
    const chatData = {
      messages,
      deviceName,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debloat-ai-chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import chat history
  const importChat = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            if (data.messages) {
              setMessages(data.messages);
            }
          } catch (err) {
            console.error('Failed to import chat:', err);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Voice input toggle
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
      id: messageUtils.generateId(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const messageHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await invoke<string>('chat_message', {
        messages: messageHistory,
        deviceName: deviceName || null,
      });

      const messageId = messageUtils.generateId();
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        id: messageId,
        streaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);
      await messageUtils.streamText(response, messageId, setMessages);
      generateSuggestions(response);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error: ${err}\n\nPlease try again or rephrase your question.`,
        timestamp: Date.now(),
        id: messageUtils.generateId(),
      }]);
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
    storage.remove(storageKeys.CHAT_MESSAGES);
  };

  const copyToClipboard = async (text: string, id: string) => {
    const success = await messageUtils.copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
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
              <button onClick={exportChat} className="export-btn" title="Export chat history">
                <FiDownload className="w-4 h-4" />
              </button>
              <button onClick={importChat} className="import-btn" title="Import chat history">
                <FiUpload className="w-4 h-4" />
              </button>
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
              <div className={`message-text ${msg.streaming ? 'streaming' : ''}`}>
                {formatMessage(msg.content)}
              </div>
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-container">
        {/* Suggested Replies */}
        {suggestedReplies.length > 0 && (
          <div className="suggested-replies">
            {suggestedReplies.map((reply, idx) => (
              <button
                key={idx}
                className="reply-chip"
                onClick={() => {
                  setInput(reply);
                  setSuggestedReplies([]);
                  setTimeout(() => sendMessage(), 100);
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        
        <div className="input-area">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value) setSuggestedReplies([]);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Android packages..."
            disabled={loading}
            className="chat-input"
          />
          <button
            onClick={toggleVoiceInput}
            className={`voice-btn ${isRecording ? 'recording' : ''}`}
            title={isRecording ? 'Stop recording' : 'Voice input'}
            disabled={loading}
          >
            <FiMic className="w-5 h-5" />
          </button>
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
    </div>
  );
};

export default ChatBot;
