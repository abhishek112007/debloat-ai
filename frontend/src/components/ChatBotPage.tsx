import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FiDownload, FiUpload, FiTrash2, FiRefreshCw, FiX, FiSend, FiMic } from 'react-icons/fi';
import '../styles/ChatBotPage.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  id: string;
}

interface DeviceInfo {
  name: string;
  model: string;
  androidVersion: string;
  manufacturer: string;
}

interface ChatBotPageProps {
  onClose?: () => void;
}

const ChatBotPage: React.FC<ChatBotPageProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stats] = useState({ safe: 306, caution: 94, expert: 5, dangerous: 10 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Get current theme
  const currentTheme = localStorage.getItem('theme-preference') || 'light';

  // Load messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatbot_messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load messages:', e);
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch device info
  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const result = await invoke<{ success: boolean; device?: DeviceInfo }>('get_device_info');
        if (result.success && result.device) {
          setDeviceInfo(result.device);
        }
      } catch (error) {
        console.error('Failed to fetch device info:', error);
      }
    };

    fetchDeviceInfo();
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

      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
      id: Date.now().toString() + Math.random(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const messageHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await invoke<string>('chat_message', {
        messages: messageHistory,
        deviceName: deviceInfo?.name || null,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        id: Date.now().toString() + Math.random(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatbot_messages');
  };

  const exportChat = () => {
    const chatData = {
      messages,
      deviceInfo,
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

  const refreshDeviceInfo = async () => {
    try {
      const result = await invoke<{ success: boolean; device?: DeviceInfo }>('get_device_info');
      if (result.success && result.device) {
        setDeviceInfo(result.device);
      }
    } catch (error) {
      console.error('Failed to refresh device info:', error);
    }
  };

  return (
    <div className="chatbot-page" data-theme={currentTheme}>
      {/* Header Bar */}
      <header className="chatbot-header">
        <div className="header-left">
          <h1 className="header-title">AI Assistant</h1>
        </div>
        <div className="header-right">
          <button className="header-btn" onClick={exportChat} title="Download chat" aria-label="Download chat">
            <FiDownload />
          </button>
          <button className="header-btn" onClick={importChat} title="Upload chat" aria-label="Upload chat">
            <FiUpload />
          </button>
          <button className="header-btn" onClick={clearChat} title="Clear chat" aria-label="Clear chat">
            <FiTrash2 />
          </button>
          <button className="header-btn" onClick={refreshDeviceInfo} title="Refresh" aria-label="Refresh">
            <FiRefreshCw />
          </button>
          {onClose && (
            <button className="header-btn" onClick={onClose} title="Close" aria-label="Close">
              <FiX />
            </button>
          )}
        </div>
      </header>

      <div className="chatbot-layout">
        {/* Left Sidebar - Device Info */}
        <aside className="sidebar-left">
          <div className="sidebar-card">
            <div className="card-label">DEVICE NAME</div>
            <div className="card-value">{deviceInfo?.name || 'Not connected'}</div>
          </div>

          <div className="sidebar-card">
            <div className="card-label">MODEL</div>
            <div className="card-value">{deviceInfo?.model || 'N/A'}</div>
          </div>

          <div className="sidebar-card">
            <div className="card-label">ANDROID VERSION</div>
            <div className="card-value">{deviceInfo?.androidVersion || 'N/A'}</div>
          </div>

          <div className="sidebar-card">
            <div className="card-label">MANUFACTURER</div>
            <div className="card-value">{deviceInfo?.manufacturer || 'N/A'}</div>
          </div>

          <button className="refresh-device-btn" onClick={refreshDeviceInfo}>
            Refresh Device Info
          </button>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <h2>Android Debloating Assistant</h2>
                <p>Ask me anything about Android packages, debloating strategies, or device safety.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.role}`}>
                <div className="message-bubble">
                  <div className="message-text">{msg.content}</div>
                  <div className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                <div className="message-bubble">
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

          {/* Input Section */}
          <div className="input-section">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Android packages..."
              disabled={loading}
              className="chat-input"
              aria-label="Chat input"
            />
            <button
              onClick={toggleVoiceInput}
              className={`voice-btn ${isRecording ? 'recording' : ''}`}
              title={isRecording ? 'Stop recording' : 'Voice input'}
              disabled={loading}
              aria-label="Voice input"
            >
              <FiMic />
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="send-btn"
              title="Send message"
              aria-label="Send message"
            >
              <FiSend />
            </button>
          </div>
        </main>

        {/* Right Stats Panel */}
        <aside className="sidebar-right">
          <div className="stat-box safe">
            <div className="stat-number">{stats.safe}</div>
            <div className="stat-label">SAFE</div>
          </div>

          <div className="stat-box caution">
            <div className="stat-number">{stats.caution}</div>
            <div className="stat-label">CAUTION</div>
          </div>

          <div className="stat-box expert">
            <div className="stat-number">{stats.expert}</div>
            <div className="stat-label">EXPERT</div>
          </div>

          <div className="stat-box dangerous">
            <div className="stat-number">{stats.dangerous}</div>
            <div className="stat-label">DANGEROUS</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChatBotPage;
