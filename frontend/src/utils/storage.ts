// Consolidated localStorage operations with type safety
const KEYS = {
  THEME: 'theme-preference',
  CHAT_MESSAGES: 'chatbot_messages',
  APP_SETTINGS: 'app-settings',
} as const;

// Generic storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : (defaultValue ?? null);
    } catch {
      return defaultValue ?? null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
};

// Typed storage helpers
export const storageKeys = KEYS;
