// Re-export useTheme from App for backwards compatibility
// All theme state is managed by ThemeContext in App.tsx
export { useTheme } from '../App';

// Deprecated alias
export { useTheme as useDarkMode } from '../App';

export default function useThemeHook() {
  // This is just for default export compatibility
  // Import { useTheme } from '../App' instead
  throw new Error('Use named import: import { useTheme } from "../App"');
}
