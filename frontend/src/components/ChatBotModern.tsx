import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api, ChatMessage } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend, FiX, FiCopy, FiCheck,
  FiRefreshCw, FiMic,
  FiSmile, FiShield, FiBattery, FiSearch, FiPackage
} from 'react-icons/fi';
import { Message } from '../types';
import { storage, storageKeys } from '../utils/storage';
import { messageUtils } from '../utils/messageUtils';
import { useTheme } from '../App';

interface ChatBotProps {
  deviceName?: string;
  onClose?: () => void;
}

export const ChatBotModern: React.FC<ChatBotProps> = ({ deviceName, onClose }) => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Color palette
  const colors = {
    light: {
      bg: '#F8F7FF',
      cardBg: '#FFFFFF',
      headerBg: 'linear-gradient(135deg, #E8D5F2 0%, #F0E6FF 100%)',
      primary: '#7B2CBF',
      accent: '#9D4EDD',
      botMsg: '#F3F4F6',
      userMsg: 'linear-gradient(135deg, #7B2CBF 0%, #9D4EDD 100%)',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      shadow: '0 4px 20px rgba(123, 44, 191, 0.1)'
    },
    dark: {
      bg: '#0F1419',
      cardBg: '#1A1F2E',
      headerBg: 'linear-gradient(135deg, #1A1F2E 0%, #242B3D 100%)',
      primary: '#2DD4BF',
      accent: '#5EEAD4',
      botMsg: '#242B3D',
      userMsg: 'linear-gradient(135deg, #2DD4BF 0%, #5EEAD4 100%)',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#374151',
      shadow: '0 4px 20px rgba(45, 212, 191, 0.15)'
    }
  };

  const currentColors = isLightMode ? colors.light : colors.dark;

  // Load messages from storage
  useEffect(() => {
    const saved = storage.get<Message[]>(storageKeys.CHAT_MESSAGES, []);
    if (saved) setMessages(saved);
  }, []);

  useEffect(() => {
    if (messages.length > 0) storage.set(storageKeys.CHAT_MESSAGES, messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

  const generateSuggestions = useCallback((lastMessage: string) => {
    setSuggestedReplies(messageUtils.generateSuggestions(lastMessage));
  }, []);





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
    setSuggestedReplies([]);

    try {
      const history: ChatMessage[] = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      const result = await api.chatMessage(userMessage.content, history);
      const response = typeof result === 'string' ? result : result?.response || String(result);

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



  const refreshChat = async () => {
    setMessages([]);
    setSuggestedReplies([]);
    storage.remove(storageKeys.CHAT_MESSAGES);
    inputRef.current?.focus();
  };

  const copyToClipboard = async (text: string, id: string) => {
    const success = await messageUtils.copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Quick action cards
  const quickActions = [
    {
      icon: <FiSearch className="w-5 h-5" />,
      label: 'Scan bloatware',
      query: 'Scan my device for common bloatware packages',
      color: isLightMode ? '#3B82F6' : '#60A5FA'
    },
    {
      icon: <FiBattery className="w-5 h-5" />,
      label: 'Battery tips',
      query: 'Which packages can I remove to improve battery life?',
      color: isLightMode ? '#10B981' : '#34D399'
    },
    {
      icon: <FiShield className="w-5 h-5" />,
      label: 'Privacy check',
      query: 'Show me tracking and telemetry packages',
      color: isLightMode ? '#F59E0B' : '#FBBF24'
    },
    {
      icon: <FiPackage className="w-5 h-5" />,
      label: 'Safe to remove',
      query: 'List absolutely safe packages to remove on Android',
      color: isLightMode ? '#EF4444' : '#F87171'
    },
  ];

  const handleQuickAction = (query: string) => {
    setInput(query);
    setTimeout(() => sendMessage(), 100);
  };

  const formatMessage = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.trim().startsWith('adb ') || line.trim().startsWith('pm ')) {
        return (
          <div key={i} style={{
            background: isLightMode ? '#F3F4F6' : '#1F2937',
            padding: '8px 12px',
            borderRadius: '8px',
            marginTop: '8px',
            fontFamily: 'monospace',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <code>{line}</code>
            <button
              onClick={() => copyToClipboard(line.trim(), `line-${i}`)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: currentColors.primary,
                padding: '4px'
              }}
            >
              {copiedId === `line-${i}` ? <FiCheck /> : <FiCopy />}
            </button>
          </div>
        );
      }
      return <p key={i} style={{ margin: '4px 0' }}>{line}</p>;
    });
  };

  return (
    <motion.div
      style={{
        width: '440px',
        height: '680px',
        background: currentColors.cardBg,
        borderRadius: '20px',
        boxShadow: currentColors.shadow,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: `1px solid ${currentColors.border}`
      }}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Modern Header */}
      <motion.div
        style={{
          background: currentColors.headerBg,
          padding: '20px',
          borderBottom: `1px solid ${currentColors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: currentColors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: `0 4px 12px ${isLightMode ? 'rgba(123, 44, 191, 0.3)' : 'rgba(45, 212, 191, 0.3)'}`
            }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            🤖
          </motion.div>
          <div>
            <div style={{
              fontWeight: 600,
              fontSize: '16px',
              color: currentColors.text,
              marginBottom: '4px'
            }}>
              AI Assistant
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: currentColors.textSecondary
            }}>
              <motion.div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10B981'
                }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Online
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {messages.length > 0 && (
            <motion.button
              onClick={refreshChat}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                color: currentColors.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              whileHover={{ background: isLightMode ? '#F3F4F6' : '#374151', scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiRefreshCw className="w-4 h-4" />
            </motion.button>
          )}
          {onClose && (
            <motion.button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                color: currentColors.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              whileHover={{ background: isLightMode ? '#FEE2E2' : '#7F1D1D', scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiX className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: currentColors.bg
      }}>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginTop: '40px' }}
          >
            <motion.div
              style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              👋
            </motion.div>
            <h3 style={{
              color: currentColors.text,
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              Welcome to AI Assistant
            </h3>
            <p style={{
              color: currentColors.textSecondary,
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              Ask me anything about Android packages
            </p>

            {/* Quick Action Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginTop: '24px'
            }}>
              {quickActions.map((action, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleQuickAction(action.query)}
                  style={{
                    background: currentColors.cardBg,
                    border: `1px solid ${currentColors.border}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'center'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -4,
                    boxShadow: `0 8px 20px ${isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(45, 212, 191, 0.2)'}`
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div style={{ color: action.color }}>
                    {action.icon}
                  </div>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: currentColors.text
                  }}>
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message Bubbles */}
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              {/* Avatar */}
              <motion.div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: msg.role === 'user' ? currentColors.primary : currentColors.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {msg.role === 'user' ? '👤' : '🤖'}
              </motion.div>

              {/* Message Content */}
              <div style={{
                flex: 1,
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <motion.div
                  style={{
                    background: msg.role === 'user' ? currentColors.userMsg : currentColors.botMsg,
                    color: msg.role === 'user' ? '#FFFFFF' : currentColors.text,
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    wordWrap: 'break-word'
                  }}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  {formatMessage(msg.content)}
                </motion.div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingLeft: msg.role === 'user' ? '0' : '4px',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <span style={{
                    fontSize: '11px',
                    color: currentColors.textSecondary
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <motion.button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: currentColors.textSecondary,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    whileHover={{ scale: 1.2, color: currentColors.primary }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {copiedId === msg.id ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <motion.div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: currentColors.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🤖
              </motion.div>
              <div style={{
                background: currentColors.botMsg,
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                display: 'flex',
                gap: '6px',
                alignItems: 'center'
              }}>
                <motion.div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentColors.primary
                  }}
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentColors.primary
                  }}
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                />
                <motion.div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentColors.primary
                  }}
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                />
                <span style={{
                  fontSize: '13px',
                  color: currentColors.textSecondary,
                  marginLeft: '8px'
                }}>
                  AI is thinking...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Replies */}
      <AnimatePresence>
        {suggestedReplies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '12px 20px',
              background: currentColors.bg,
              borderTop: `1px solid ${currentColors.border}`,
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              overflowX: 'auto'
            }}
          >
            {suggestedReplies.map((reply, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  setInput(reply);
                  setSuggestedReplies([]);
                  setTimeout(() => sendMessage(), 100);
                }}
                style={{
                  background: 'none',
                  border: `1.5px solid ${currentColors.primary}`,
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: currentColors.primary,
                  cursor: 'pointer',
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{
                  background: currentColors.primary,
                  color: '#FFFFFF',
                  scale: 1.05
                }}
                whileTap={{ scale: 0.95 }}
              >
                {reply}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div style={{
        padding: '20px',
        background: currentColors.cardBg,
        borderTop: `1px solid ${currentColors.border}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: currentColors.bg,
          borderRadius: '24px',
          padding: '8px 12px',
          border: `2px solid ${currentColors.border}`
        }}>
          <motion.button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: currentColors.textSecondary,
              display: 'flex',
              alignItems: 'center'
            }}
            whileHover={{ scale: 1.1, color: currentColors.primary }}
            whileTap={{ scale: 0.9 }}
          >
            <FiSmile className="w-5 h-5" />
          </motion.button>



          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: currentColors.text,
              padding: '8px'
            }}
          />

          <motion.button
            onClick={toggleVoiceInput}
            disabled={loading}
            style={{
              background: isRecording ? '#EF4444' : 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: isRecording ? '#FFFFFF' : currentColors.textSecondary,
              display: 'flex',
              alignItems: 'center'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={isRecording ? {
              boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 10px rgba(239, 68, 68, 0)']
            } : {}}
            transition={isRecording ? { duration: 1.5, repeat: Infinity } : {}}
          >
            <FiMic className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              background: currentColors.primary,
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              padding: '10px',
              borderRadius: '50%',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              opacity: input.trim() && !loading ? 1 : 0.5
            }}
            whileHover={input.trim() && !loading ? { scale: 1.1, rotate: 15 } : {}}
            whileTap={input.trim() && !loading ? { scale: 0.9 } : {}}
          >
            <FiSend className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBotModern;
