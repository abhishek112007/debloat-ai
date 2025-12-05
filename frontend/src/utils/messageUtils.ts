import { Message } from '../types';

// Message utilities - shared between ChatBot components
export const messageUtils = {
  // Generate unique message ID
  generateId: (): string => `${Date.now()}-${Math.random()}`,

  // Stream text with animation
  streamText: async (
    text: string,
    messageId: string,
    updateFn: (updater: (msgs: Message[]) => Message[]) => void,
    delay = 30
  ): Promise<void> => {
    const words = text.split(' ');
    let displayedText = '';

    for (let i = 0; i < words.length; i++) {
      displayedText += (i > 0 ? ' ' : '') + words[i];

      updateFn(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content: displayedText, streaming: true }
            : msg
        )
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Mark complete
    updateFn(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, streaming: false } : msg
      )
    );
  },

  // Generate contextual suggestions
  generateSuggestions: (lastMessage: string): string[] => {
    const lower = lastMessage.toLowerCase();
    const suggestions: string[] = [];

    if (lower.includes('safe')) {
      suggestions.push('Show me more safe packages', 'What about dangerous packages?');
    } else if (lower.includes('battery')) {
      suggestions.push('How can I improve battery life?', 'Which apps drain battery?');
    } else if (lower.includes('privacy')) {
      suggestions.push('How do I block trackers?', 'What about telemetry?');
    }

    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push('Analyze another package', 'Show device tips', 'Privacy recommendations');
    }

    return suggestions.slice(0, 3);
  },

  // Format message content (detect code blocks)
  formatContent: (content: string): { type: 'code' | 'text'; content: string }[] => {
    return content.split('\n').map(line => ({
      type: line.trim().startsWith('adb ') || line.trim().startsWith('pm ') ? 'code' : 'text',
      content: line,
    }));
  },

  // Copy to clipboard with feedback
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  },
};
