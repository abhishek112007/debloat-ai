# Quick Reference: Refactored Utilities

## 🎨 Theme Management

```typescript
import { useTheme } from './hooks';

function MyComponent() {
  const { theme, setTheme, isDark, toggle, availableThemes } = useTheme();
  
  return (
    <div>
      <p>Current: {theme}</p>
      <button onClick={toggle}>Toggle</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
    </div>
  );
}
```

---

## 💾 Storage Operations

```typescript
import { storage, storageKeys } from './utils';

// Get with default value
const messages = storage.get<Message[]>(storageKeys.CHAT_MESSAGES, []);

// Set
storage.set(storageKeys.THEME, 'dark');

// Remove
storage.remove(storageKeys.CHAT_MESSAGES);

// Custom keys
storage.get('my-custom-key', defaultValue);
```

---

## 💬 Message Utilities

```typescript
import { messageUtils } from './utils';

// Generate unique ID
const id = messageUtils.generateId();

// Stream text with animation
await messageUtils.streamText(
  'Hello world',
  messageId,
  setMessages,
  30 // delay in ms (optional)
);

// Generate contextual suggestions
const suggestions = messageUtils.generateSuggestions('battery optimization');
// Returns: ['How can I improve battery life?', 'Which apps drain battery?', ...]

// Copy to clipboard
const success = await messageUtils.copyToClipboard('text to copy');
if (success) console.log('Copied!');

// Format message content
const parts = messageUtils.formatContent(message);
// Returns: [{ type: 'code'|'text', content: string }]
```

---

## 🎯 Filter Utilities

```typescript
import { filterUtils } from './utils';
import { SafetyLevel } from './types';

// Get filter chips configuration
const chips = filterUtils.getFilterChips();
// Returns: [{ id: 'all', label: 'All', icon: 'FiList', color: 'accent' }, ...]

// Get color for safety level
const color = filterUtils.getSafetyColor('Safe'); // '#10B981'

// Get background color (theme-aware)
const bg = filterUtils.getSafetyBg('Dangerous', isDark);
// Returns: 'rgba(239, 68, 68, 0.12)' or darker variant
```

---

## 📦 Storage Keys Reference

```typescript
import { storageKeys } from './utils';

storageKeys.THEME           // 'theme-preference'
storageKeys.CHAT_MESSAGES   // 'chatbot_messages'
storageKeys.APP_SETTINGS    // 'app-settings'
```

---

## 🔄 Common Patterns

### Loading Data with Default
```typescript
const [data, setData] = useState(() => 
  storage.get<MyType>(storageKeys.MY_KEY, defaultValue)
);
```

### Auto-Save to Storage
```typescript
useEffect(() => {
  if (data.length > 0) {
    storage.set(storageKeys.MY_KEY, data);
  }
}, [data]);
```

### Theme-Aware Styling
```typescript
const { isDark } = useTheme();

<div style={{
  background: isDark ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)',
  color: isDark ? '#fff' : '#000'
}} />
```

### Streaming Messages
```typescript
const messageId = messageUtils.generateId();
setMessages(prev => [...prev, {
  id: messageId,
  content: '',
  streaming: true,
  role: 'assistant'
}]);

await messageUtils.streamText(response, messageId, setMessages);
```

---

## 🎨 CSS Variables (Available)

```css
/* Theme colors (auto-applied) */
var(--theme-bg)
var(--theme-card)
var(--theme-border)
var(--theme-hover)
var(--theme-text-primary)
var(--theme-text-secondary)
var(--theme-accent)
var(--theme-accent-hover)
var(--theme-glass)
var(--theme-shadow)
var(--theme-glow)
```

---

## 🚀 Best Practices

### ✅ DO
- Use `useTheme()` for theme access
- Use `storage.*` for localStorage
- Use `messageUtils.*` for chat operations
- Use `filterUtils.*` for safety level styling
- Import from `'./utils'` or `'./hooks'` (index exports)

### ❌ DON'T
- Don't use `localStorage` directly
- Don't duplicate theme logic
- Don't create custom ID generators
- Don't inline safety level colors
- Don't import from `'../App'` for theme

---

## 🔍 Type Definitions

```typescript
// Message (from types.ts)
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  id: string;
  streaming?: boolean;
}

// SafetyLevel (from types.ts)
type SafetyLevel = 'Safe' | 'Caution' | 'Expert' | 'Dangerous';

// Theme
type ThemeName = 'light' | 'dark';

// UseThemeReturn
interface UseThemeReturn {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isDark: boolean;
  toggle: () => void;
  availableThemes: ThemeName[];
}
```
