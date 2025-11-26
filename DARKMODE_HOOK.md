# useDarkMode Hook - Documentation

A React hook for managing dark mode with localStorage persistence and system preference detection.

## Features

✅ **localStorage Persistence** - Theme preference saved with key `"theme-preference"`  
✅ **System Preference Detection** - Defaults to OS dark/light mode  
✅ **Tailwind Integration** - Adds/removes `dark` class on `<html>` element  
✅ **Type Safety** - Full TypeScript support  
✅ **Auto-sync** - Listens for system theme changes  

---

## Installation

Copy `useDarkMode.ts` into your React project.

**Required Dependencies:**
```bash
npm install react
```

---

## Usage

### Basic Usage

```tsx
import { useDarkMode } from './useDarkMode';

function App() {
  const { isDark, toggle, setTheme } = useDarkMode();

  return (
    <div>
      <button onClick={toggle}>
        {isDark ? 'Switch to Light' : 'Switch to Dark'}
      </button>
    </div>
  );
}
```

---

## API Reference

### Return Values

```typescript
interface UseDarkModeReturn {
  isDark: boolean;           // Current theme state
  toggle: () => void;        // Toggle between light/dark
  setTheme: (theme: 'light' | 'dark') => void;  // Set specific theme
}
```

#### `isDark: boolean`
Current theme state.
- `true` when dark mode is active
- `false` when light mode is active

#### `toggle(): void`
Toggles between light and dark themes.

```tsx
<button onClick={toggle}>Toggle Theme</button>
```

#### `setTheme(theme: 'light' | 'dark'): void`
Sets a specific theme directly.

```tsx
<button onClick={() => setTheme('dark')}>Enable Dark Mode</button>
<button onClick={() => setTheme('light')}>Enable Light Mode</button>
```

---

## How It Works

### 1. Initial Theme Detection

Priority order:
1. **localStorage** - Checks `"theme-preference"` key
2. **System Preference** - Uses `prefers-color-scheme` media query
3. **Default** - Falls back to `"light"`

```typescript
const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('theme-preference');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};
```

### 2. DOM Updates

When theme changes:
- Adds `dark` class to `<html>` element for dark mode
- Removes `dark` class for light mode
- Saves preference to localStorage

```typescript
useEffect(() => {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  localStorage.setItem('theme-preference', theme);
}, [theme]);
```

### 3. System Theme Sync

Listens for OS theme changes and updates automatically (only if user hasn't set explicit preference).

```typescript
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    const stored = localStorage.getItem('theme-preference');
    if (!stored) {
      setThemeState(e.matches ? 'dark' : 'light');
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);
```

---

## Integration with Tailwind CSS

### 1. Enable Dark Mode in `tailwind.config.js`

```js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 2. Use Dark Mode Classes

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <p>This text adapts to the theme!</p>
</div>
```

---

## Examples

### Example 1: Theme Toggle Button

```tsx
import { useDarkMode } from './useDarkMode';

function ThemeToggle() {
  const { isDark, toggle } = useDarkMode();

  return (
    <button
      onClick={toggle}
      className="px-4 py-2 bg-gray-200 dark:bg-gray-800"
    >
      {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
```

### Example 2: Theme Selector

```tsx
import { useDarkMode } from './useDarkMode';

function ThemeSelector() {
  const { isDark, setTheme } = useDarkMode();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme('light')}
        className={isDark ? 'opacity-50' : 'font-bold'}
      >
        ☀️ Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={!isDark ? 'opacity-50' : 'font-bold'}
      >
        🌙 Dark
      </button>
    </div>
  );
}
```

### Example 3: App-wide Theme Provider

```tsx
import { useDarkMode } from './useDarkMode';
import DevicePanel from './DevicePanel';
import PackageList from './PackageList';

function App() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Android ADB Manager
          </h1>
          <button
            onClick={toggle}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-[300px_1fr] gap-6">
          <DevicePanel />
          <PackageList />
        </div>
      </main>
    </div>
  );
}
```

---

## TypeScript Types

```typescript
type Theme = 'light' | 'dark';

interface UseDarkModeReturn {
  isDark: boolean;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}
```

---

## localStorage Schema

**Key:** `"theme-preference"`  
**Values:** `"light"` or `"dark"`

```json
{
  "theme-preference": "dark"
}
```

---

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ `matchMedia` support (IE 10+)
- ✅ `localStorage` support (IE 8+)
- ✅ Fallback for older `addListener` API

---

## Testing

### Manual Testing

1. **Toggle functionality:**
   ```
   Click toggle button → Theme should change
   Reload page → Theme should persist
   ```

2. **localStorage persistence:**
   ```
   Open DevTools → Application → localStorage
   Check "theme-preference" value
   ```

3. **System preference:**
   ```
   Clear localStorage
   Change OS dark mode setting
   Reload page → Should match OS theme
   ```

4. **DOM updates:**
   ```
   Inspect <html> element
   Should have class="dark" in dark mode
   Should have no "dark" class in light mode
   ```

---

## Troubleshooting

### Theme not persisting
**Issue:** Theme resets on page reload  
**Solution:** Check localStorage is enabled (not in incognito mode)

### Tailwind dark mode not working
**Issue:** Dark mode classes not applying  
**Solution:** Ensure `darkMode: 'class'` in `tailwind.config.js`

### System preference not detected
**Issue:** Doesn't default to OS theme  
**Solution:** Clear localStorage and reload page

---

## Summary

The `useDarkMode` hook provides:
- ✅ Simple API (`isDark`, `toggle`, `setTheme`)
- ✅ Automatic persistence to localStorage
- ✅ System preference detection
- ✅ Full TypeScript support
- ✅ Seamless Tailwind integration

Perfect for modern React + Tailwind applications! 🎨
