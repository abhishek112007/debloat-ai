# 1. App.tsx Integration Guide

This is the main application component that ties together all the pieces of the Android Debloater app.

## 1.1. Overview

The `App.tsx` component provides:
- **ThemeProvider Context**: Manages dark/light mode across the entire application
- **3-Section Layout**: Header, Left Sidebar (Device), Main Content (Packages), Right Sidebar (Stats)
- **Global Notification System**: Toast-style notifications for success/error messages
- **Package Selection Management**: Centralized state for selected packages
- **Action Buttons**: Uninstall Selected, Backup, Restore functionality

## 1.2. File Structure

```
src/
├── App.tsx                 # Main app with ThemeProvider (NEW)
├── main.tsx               # React entry point (NEW)
├── index.css              # Tailwind CSS with animations (NEW)
├── DevicePanel.tsx        # Device info sidebar (existing)
├── PackageList.tsx        # Package table (UPDATED)
├── BackupManager.tsx      # Backup/restore UI (existing)
├── ConfirmDialog.tsx      # Modal confirmation (existing)
└── types.ts              # TypeScript types (existing)
```

## 1.3. Key Features

### 1.3.1. Theme Context
```typescript
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

**Usage in components:**
```tsx
const { isDark, toggleTheme, setTheme } = useTheme();
```

### 1.3.2. Layout Structure
- **Header**: App title + theme toggle + backup button
- **Action Bar**: Shows selected count, uninstall button, clear selection
- **Left Sidebar (15%)**: DevicePanel component
- **Main Content (70%)**: PackageList or BackupManager (toggle with button)
- **Right Sidebar (15%)**: Quick stats by safety level

### 1.3.3. Notification System
```typescript
const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
  // Auto-dismisses after 5 seconds
  // Displays in bottom-right corner
  // Color-coded by type
};
```

**Example usage:**
```tsx
addNotification('✅ Successfully uninstalled 5 package(s)', 'success');
addNotification('❌ Failed to uninstall 2 package(s)', 'error');
```

### 1.3.4. Package Stats
Real-time statistics displayed in the right sidebar:
- Total packages
- Selected packages
- Safety level breakdown (Safe, Caution, Expert, Dangerous)

Updates automatically when packages are loaded or selection changes.

### 1.3.5. Uninstall Flow
1. User selects packages in PackageList
2. Clicks "Uninstall Selected" button
3. ConfirmDialog shows confirmation
4. App invokes `uninstall_package` for each selected package
5. Notifications show success/failure counts
6. Selection is cleared

## 1.4. Props Updated

### 1.4.1. PackageList.tsx (Updated)
```typescript
interface PackageListProps {
  selectedPackages: Set<string>;          // Controlled from App
  onSelectionChange: (selected: Set<string>) => void;  // Updates App state
  onStatsChange: (stats: PackageStats) => void;        // Updates stats sidebar
}
```

The PackageList component no longer manages selection internally - it's lifted to App.tsx for coordination with the uninstall button.

## 1.5. Color Scheme

**Light Mode:**
- Background: white
- Text: #1f2937 (gray-800)
- Borders: #e5e7eb (gray-200)
- Accents: #10b981 (green-600), #ef4444 (red-600)

**Dark Mode:**
- Background: #1a1a1a
- Text: #f3f4f6 (gray-100)
- Borders: #374151 (gray-700)
- Accents: #10b981 (green-500), #ef4444 (red-500)

**Safety Badges:**
- Safe: Green (#10b981)
- Caution: Yellow (#eab308)
- Expert: Orange (#f97316)
- Dangerous: Red (#ef4444)

## 1.6. Installation Steps

### 1.6.1. Install Dependencies
```bash
npm install react react-dom
npm install -D @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
npm install @tauri-apps/api
```

### 1.6.2. Initialize Tailwind CSS
```bash
npx tailwindcss init -p
```

### 1.6.3. Configure tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',  // CRITICAL: Use 'class' strategy
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 1.6.4. Update index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Android Debloater</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 1.6.5. File Placement
Move files to the `src` directory:
```
src/
├── App.tsx
├── main.tsx
├── index.css
├── DevicePanel.tsx
├── PackageList.tsx
├── BackupManager.tsx
├── ConfirmDialog.tsx
└── types.ts
```

## 1.7. Running the App

### 1.7.1. Development Mode
```bash
npm run tauri dev
```

### 1.7.2. Build for Production
```bash
npm run tauri build
```

## 1.8. State Flow Diagram

```
┌─────────────────────────────────────────┐
│            App.tsx (Root)               │
│  - ThemeProvider wraps all components  │
│  - Manages selectedPackages state       │
│  - Manages notifications state          │
│  - Manages stats state                  │
└──────────┬──────────────────────────────┘
           │
           ├──> DevicePanel (Left Sidebar)
           │    - Uses useTheme() hook
           │    - Independent state
           │
           ├──> PackageList (Main Content)
           │    - Receives selectedPackages
           │    - Calls onSelectionChange
           │    - Calls onStatsChange
           │    - Uses useTheme() hook
           │
           ├──> BackupManager (Alt Main Content)
           │    - Toggles with PackageList
           │    - Uses useTheme() hook
           │
           └──> Quick Stats (Right Sidebar)
                - Displays stats from state
                - Real-time updates
```

## 1.9. Keyboard Shortcuts

- **ESC**: Close ConfirmDialog
- **Theme Toggle Button**: Switch between light/dark mode

## 1.10. Error Handling

All Tauri command invocations are wrapped in try-catch blocks:
```typescript
try {
  const result = await invoke<{ success: boolean; error?: string }>('uninstall_package', {
    packageName,
  });
  if (result.success) {
    successCount++;
  } else {
    failCount++;
  }
} catch (error) {
  failCount++;
}
```

Errors are displayed via the notification system with proper color coding and auto-dismiss.

## 1.11. Notification Examples

**Success:**
```
┌──────────────────────────────────────┐
│ ✅ Successfully uninstalled 5 package(s) │ ✕
└──────────────────────────────────────┘
```

**Error:**
```
┌──────────────────────────────────────┐
│ ❌ Failed to uninstall 2 package(s)     │ ✕
└──────────────────────────────────────┘
```

**Info:**
```
┌──────────────────────────────────────┐
│ No packages selected                  │ ✕
└──────────────────────────────────────┘
```

## 1.12. Performance Considerations

- **Lazy Stats Calculation**: Stats are only recalculated when packages or selection changes
- **Notification Auto-Cleanup**: Notifications automatically remove after 5 seconds
- **Virtualization**: PackageList uses max-height with overflow for large package lists
- **Debounced Search**: Search filter updates on every keystroke (consider debouncing for >1000 packages)

## 1.13. Accessibility

- All buttons have proper `aria-label` attributes
- Theme toggle button announces current theme
- Keyboard navigation supported for ConfirmDialog (ESC to close)
- Color contrast meets WCAG AA standards in both light and dark modes

## 1.14. Troubleshooting

### 1.14.1. TypeScript Errors
The TypeScript errors shown are expected if React packages aren't installed. Install dependencies:
```bash
npm install react react-dom @tauri-apps/api
npm install -D @types/react @types/react-dom typescript
```

### 1.14.2. Dark Mode Not Working
Ensure `tailwind.config.js` has `darkMode: 'class'` and the ThemeProvider is wrapping all components.

### 1.14.3. Notifications Not Appearing
Check that `index.css` is imported in `main.tsx` and Tailwind CSS is properly configured.

### 1.14.4. ADB Commands Failing
Ensure:
1. ADB is installed and in PATH
2. USB debugging is enabled on device
3. Device is connected and authorized
4. `src-tauri/tauri.conf.json` has shell permissions for "adb"

## 1.15. Next Steps

1. **Install dependencies** with npm
2. **Configure Tailwind CSS** with proper settings
3. **Test dark mode** toggle functionality
4. **Test uninstall flow** with confirmation dialog
5. **Create backup** before uninstalling packages
6. **Verify stats** update correctly

## 1.16. API Reference

### 1.16.1. ThemeContext
```typescript
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

### 1.16.2. PackageStats
```typescript
interface PackageStats {
  total: number;
  safe: number;
  caution: number;
  expert: number;
  dangerous: number;
  selected: number;
}
```

### 1.16.3. Notification
```typescript
interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
```

## 1.17. Contributing

When adding new features:
1. Use the `useTheme()` hook for theme-aware components
2. Add notifications for user feedback on actions
3. Update stats when package state changes
4. Follow the established color scheme
5. Maintain accessibility standards

---

**Built with**: React + TypeScript + Tailwind CSS + Tauri v2
