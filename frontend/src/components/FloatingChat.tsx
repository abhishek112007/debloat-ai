import React, { useState } from 'react';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import ChatBot from './ChatBot';
import '../styles/FloatingChat.css';

interface FloatingChatProps {
  deviceName?: string;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({ deviceName }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="floating-chat-window">
          <ChatBot deviceName={deviceName} onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          className="floating-chat-button"
          onClick={() => setIsOpen(true)}
          title="Open AI Assistant"
        >
          <FiMessageCircle className="w-6 h-6" />
          <span className="chat-badge">AI</span>
        </button>
      )}
    </>
  );
};

export default FloatingChat;
