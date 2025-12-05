import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle } from 'react-icons/fi';
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
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="floating-chat-window"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
          >
            <ChatBot deviceName={deviceName} onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="floating-chat-button"
            onClick={() => setIsOpen(true)}
            title="Open AI Assistant"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ 
              scale: 1.1, 
              boxShadow: '0 8px 24px rgba(88, 166, 175, 0.4)',
              rotate: 10
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 3,
                ease: 'easeInOut' as const
              }}
            >
              <FiMessageCircle className="w-6 h-6" />
            </motion.div>
            <motion.span 
              className="chat-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' as const, stiffness: 500 }}
            >
              AI
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
