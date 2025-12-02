import React from 'react';
import ChatBot from 'react-chatbotify';
import { invoke } from '@tauri-apps/api/core';
import { FiX } from 'react-icons/fi';
import { useTheme } from '../hooks/useDarkMode';
import '../styles/neobrutalism-glassmorphism.css';
import '../styles/ChatBotNew.css';

interface ChatBotNewProps {
  deviceName?: string;
  onClose?: () => void;
}

export const ChatBotNew: React.FC<ChatBotNewProps> = ({ deviceName, onClose }) => {
  const { theme } = useTheme();

  // React ChatBotify flow configuration
  const flow = {
    start: {
      message: `👋 Hi! I'm Debloat AI, your Android debloating assistant${deviceName ? ` for ${deviceName}` : ''}.\n\n🔍 Ask me about:\n• Package safety analysis\n• Battery optimization tips\n• Privacy-focused debloating\n• ADB commands\n\nWhat would you like to know?`,
      path: "loop"
    },
    loop: {
      message: async (params: any) => {
        try {
          // Get conversation history
          const messages = params.prevPath === "start" 
            ? [{ role: "user", content: params.userInput }]
            : [...(params.injectMessage || []), { role: "user", content: params.userInput }];

          // Call Tauri backend (same as original ChatBot)
          const response = await invoke<string>('chat_message', {
            messages: messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content
            })),
            deviceName: deviceName || null,
          });

          return response;
        } catch (error) {
          console.error('Chat error:', error);
          return `❌ **Error**: ${error}\n\nPlease try again or rephrase your question.`;
        }
      },
      path: "loop"
    }
  };

  // ChatBot settings - adapts to current theme
  const settings = {
    general: {
      primaryColor: theme === 'dark' ? '#58A6AF' : '#2EC4B6',
      secondaryColor: theme === 'dark' ? '#ff7b5f' : '#ff6b4a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      embedded: false,
    },
    header: {
      title: "Debloat AI Assistant",
      showAvatar: true,
      avatar: "🤖",
    },
    chatHistory: {
      storageKey: "debloat-ai-chat-history",
      maxEntries: 50,
      disabled: false,
    },
    botBubble: {
      simulateStream: true,
      streamSpeed: 30,
    },
    userBubble: {
      simulateStream: false,
    },
    footer: {
      text: deviceName ? `📱 ${deviceName}` : "Android Debloating Expert",
    },
  };

  // Quick action buttons
  const quickActions = [
    {
      label: "🔍 Scan bloatware",
      value: "Scan my device for common bloatware packages"
    },
    {
      label: "⚡ Battery tips",
      value: "Which packages can I remove to improve battery life?"
    },
    {
      label: "🛡️ Privacy check",
      value: "Show me tracking and telemetry packages"
    },
    {
      label: "🎯 Safe to remove",
      value: "List absolutely safe packages to remove"
    }
  ];

  return (
    <div className={`chatbot-container neo-card ${theme}`}>
      {onClose && (
        <button onClick={onClose} className="close-button neo-button">
          <FiX />
        </button>
      )}
      
      <ChatBot
        flow={flow}
        settings={settings}
      />

      {/* Quick Actions - shown at bottom */}
      <div className="quick-actions neo-grid">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            className="quick-action-btn neo-button"
            onClick={() => {
              // Inject message into chat
              const inputField = document.querySelector('.rcb-chat-input') as HTMLInputElement;
              if (inputField) {
                inputField.value = action.value;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                inputField.focus();
              }
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatBotNew;
