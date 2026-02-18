import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api, ChatMessage } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMessageCircle, FiX, FiCopy, FiCheck, FiTrash2, FiRefreshCw, FiDownload, FiUpload, FiMic, FiZap } from 'react-icons/fi';
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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        recognition.onresult = (event: any) => {
          const results = event.results;
          if (results.length > 0) {
            const transcript = results[results.length - 1][0].transcript;
            setInput(transcript);
            // Auto-stop when we get a final result
            if (results[results.length - 1].isFinal) {
              setIsRecording(false);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone permission.');
          } else if (event.error === 'network') {
            alert('Speech recognition requires internet connection.');
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Failed to initialize speech recognition:', err);
      }
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
      alert('Speech recognition is not supported in this app. Please type your message instead.');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) { /* ignore */ }
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
        setIsRecording(false);
        if (err?.message?.includes('already started')) {
          recognitionRef.current.stop();
        } else {
          alert('Could not start voice input. Please check microphone permissions.');
        }
      }
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
      // Prepare history (all messages except the current one)
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

  const [isRefreshing, setIsRefreshing] = useState(false);

  const clearChat = () => {
    setMessages([]);
    storage.remove(storageKeys.CHAT_MESSAGES);
    setSuggestedReplies([]);
  };

  const refreshChat = async () => {
    setIsRefreshing(true);
    // Clear messages and reload fresh state
    setMessages([]);
    setSuggestedReplies([]);
    storage.remove(storageKeys.CHAT_MESSAGES);
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
    inputRef.current?.focus();
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
    <motion.div 
      className="chat-container"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <motion.div 
        className="chat-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="chat-header-title">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <FiMessageCircle className="w-5 h-5" />
          </motion.div>
          <span>AI Assistant</span>
          {deviceName && (
            <motion.span 
              className="device-badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              {deviceName}
            </motion.span>
          )}
        </div>
        <div className="chat-header-actions">
          <AnimatePresence>
            {messages.length > 0 && (
              <motion.div
                className="flex gap-1.5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Export Button */}
                <motion.button 
                  onClick={exportChat} 
                  className="export-btn" 
                  title="Export chat history"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <FiDownload className="w-4 h-4" />
                  </motion.div>
                </motion.button>
                
                {/* Import Button */}
                <motion.button 
                  onClick={importChat} 
                  className="import-btn" 
                  title="Import chat history"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    whileHover={{ y: 3 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <FiUpload className="w-4 h-4" />
                  </motion.div>
                </motion.button>
                
                {/* Clear/Trash Button */}
                <motion.button 
                  onClick={clearChat} 
                  className="clear-btn" 
                  title="Clear chat history"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    whileHover={{ rotate: -15, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </motion.div>
                </motion.button>
                
                {/* Refresh Button - rotates icon only */}
                <motion.button 
                  onClick={refreshChat} 
                  className="refresh-btn" 
                  title="Refresh chat"
                  disabled={isRefreshing}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : {}}
                    whileHover={!isRefreshing ? { rotate: 180 } : {}}
                    transition={isRefreshing 
                      ? { duration: 0.6, repeat: Infinity, ease: 'linear' }
                      : { type: 'spring', stiffness: 200, damping: 10 }
                    }
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          {onClose && (
            <motion.button 
              onClick={onClose} 
              className="close-btn" 
              title="Close chat"
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <FiX className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="messages">
        <AnimatePresence mode="wait">
          {messages.length === 0 && (
            <motion.div 
              className="welcome-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FiZap className="w-12 h-12 mb-4 opacity-50" />
              </motion.div>
              <h3>Android Debloating Assistant</h3>
              <p>Ask me anything about Android packages, debloating strategies, or device safety.</p>
              <div className="quick-actions">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    className="quick-action-btn"
                    onClick={() => handleQuickAction(action.query)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, type: 'spring', stiffness: 300 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -4,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span 
                      className="action-emoji"
                      whileHover={{ scale: 1.2, rotate: [-5, 5, -5, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      {action.emoji}
                    </motion.span>
                    <span className="action-label">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div 
              key={msg.id} 
              className={`message ${msg.role}`}
              initial={{ 
                opacity: 0, 
                x: msg.role === 'user' ? 30 : -30,
                y: 10,
                scale: 0.95
              }}
              animate={{ 
                opacity: 1, 
                x: 0,
                y: 0,
                scale: 1
              }}
              transition={{ 
                duration: 0.3,
                delay: index === messages.length - 1 ? 0 : 0,
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
            >
              <motion.div 
                className="message-avatar"
                whileHover={{ scale: 1.15, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {msg.role === 'user' ? '👤' : '🤖'}
              </motion.div>
              <div className="message-content">
                <motion.div 
                  className={`message-text ${msg.streaming ? 'streaming' : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {formatMessage(msg.content)}
                </motion.div>
                <div className="message-actions">
                  <motion.div 
                    className="message-timestamp"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </motion.div>
                  <motion.button
                    className="copy-msg-btn"
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    title="Copy message"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence mode="wait">
                      {copiedId === msg.id ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                        >
                          <FiCheck className="w-3 h-3" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <FiCopy className="w-3 h-3" />
                        </motion.div>
                      )}
                    </AnimatePresence>
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
              className="message assistant typing"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div 
                className="message-avatar"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🤖
              </motion.div>
              <div className="message-content">
                <div className="typing-indicator">
                  <motion.span
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                  />
                  <motion.span
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                  />
                </div>
                <motion.div 
                  className="typing-text"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  AI is thinking...
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-container">
        {/* Suggested Replies */}
        <AnimatePresence>
          {suggestedReplies.length > 0 && (
            <motion.div 
              className="suggested-replies"
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
            >
              {suggestedReplies.map((reply, idx) => (
                <motion.button
                  key={idx}
                  className="reply-chip"
                  onClick={() => {
                    setInput(reply);
                    setSuggestedReplies([]);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {reply}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          className="input-area"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value) setSuggestedReplies([]);
            }}
            onKeyDown={handleKeyPress}
            placeholder="Ask about Android packages..."
            disabled={loading}
            className="chat-input"
            whileFocus={{ scale: 1.01 }}
          />
          <motion.button
            onClick={toggleVoiceInput}
            className={`voice-btn ${isRecording ? 'recording' : ''}`}
            title={isRecording ? 'Stop recording' : 'Voice input'}
            disabled={loading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={isRecording ? { 
              boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 15px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0.7)']
            } : {}}
            transition={isRecording ? { duration: 1.5, repeat: Infinity } : {}}
          >
            <FiMic className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="send-btn"
            title="Send message"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={loading ? { rotate: 360 } : {}}
              transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            >
              <FiSend className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatBot;
