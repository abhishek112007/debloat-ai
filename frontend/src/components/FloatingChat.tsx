import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="floating-chat-window"
            initial={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
            transition={{ 
              type: 'spring', 
              stiffness: 350, 
              damping: 30,
              mass: 0.8
            }}
          >
            <ChatBot deviceName={deviceName} onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="open-btn"
            className="floating-chat-button"
            onClick={() => setIsOpen(true)}
            title="Open AI Assistant"
            style={{ position: 'fixed', bottom: 24, right: 24 }}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ 
              scale: 1, 
              rotate: 0, 
              opacity: 1,
              y: [0, -8, 0]
            }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            whileHover={{ 
              scale: 1.15,
              rotate: 5,
              boxShadow: '0 12px 40px rgba(88, 166, 175, 0.5), 0 0 60px rgba(88, 166, 175, 0.3)'
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 15,
              y: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                repeatDelay: 4,
                ease: 'easeInOut'
              }}
            >
              <FiMessageCircle className="w-7 h-7" />
            </motion.div>
            <motion.span 
              className="chat-badge"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.4, 
                type: 'spring', 
                stiffness: 500,
                damping: 15
              }}
            >
              AI
            </motion.span>
            
            {/* Animated Ring */}
            <motion.div
              style={{
                position: 'absolute',
                inset: -4,
                borderRadius: 24,
                border: '2px solid rgba(88, 166, 175, 0.5)',
                pointerEvents: 'none'
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.button>
        ) : (
          <motion.button
            key="close-btn"
            className="floating-chat-button"
            onClick={() => setIsOpen(false)}
            title="Close AI Assistant"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ 
              scale: 1.1,
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)'
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ position: 'fixed', bottom: 24, right: 24, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
          >
            <motion.div
              animate={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <FiX className="w-7 h-7" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
