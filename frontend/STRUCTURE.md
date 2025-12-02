# Frontend Code Structure

## 📁 Organized Folder Structure

```
frontend/src/
├── components/          # All React components
│   ├── AIPackageAdvisor.tsx
│   ├── BackupManager.tsx
│   ├── ChatBot.tsx       # Enhanced chatbot with copy features
│   ├── ConfirmDialog.tsx
│   ├── DevicePanel.tsx
│   ├── FloatingChat.tsx  # Floating chat button & window
│   ├── PackageList.tsx
│   ├── Settings.tsx
│   ├── ThemeSelector.tsx
│   ├── ThemeToggle.tsx
│   ├── Toast.tsx
│   ├── UninstallDialog.tsx
│   └── index.ts          # Barrel exports for clean imports
│
├── hooks/              # Custom React hooks
│   ├── useDarkMode.ts
│   ├── useDeviceMonitor.ts
│   ├── usePackageAdvisor.ts
│   ├── useToast.tsx
│   └── index.ts          # Barrel exports
│
├── styles/             # CSS files
│   ├── ChatBot.css       # Chatbot styles with code blocks
│   └── FloatingChat.css
│
├── utils/              # Utility functions
│   ├── animations.ts     # Framer Motion animations
│   ├── themes.ts         # Theme configurations
│   └── index.ts          # Barrel exports
│
├── types/              # TypeScript type definitions
│   └── ai-advisor.ts
│
├── App.tsx             # Main app component
├── main.tsx            # Entry point
├── index.css           # Global styles
└── types.ts            # Shared type definitions
```

## 🎯 Import Examples

### Using Barrel Exports (Recommended)

```typescript
// Import multiple components at once
import { ChatBot, FloatingChat, DevicePanel } from './components';

// Import multiple hooks
import { useToast, useDeviceMonitor } from './hooks';

// Import utilities
import { THEMES, buttonHover } from './utils';
```

### Direct Imports (Also works)

```typescript
import ChatBot from './components/ChatBot';
import { useToast } from './hooks/useToast';
import { THEMES } from './utils/themes';
```

## 🚀 Benefits of This Structure

1. **Clear Separation** - Components, hooks, styles, and utilities are organized
2. **Easy Navigation** - Find files quickly by category
3. **Barrel Exports** - Clean, concise import statements
4. **Scalability** - Easy to add new features
5. **Maintainability** - Changes are localized to specific folders

## 📝 Adding New Features

### New Component
1. Create file in `components/`
2. Export from `components/index.ts`
3. Import using: `import { YourComponent } from './components'`

### New Hook
1. Create file in `hooks/`
2. Export from `hooks/index.ts`
3. Import using: `import { yourHook } from './hooks'`

### New Style
1. Create CSS file in `styles/`
2. Import in component: `import '../styles/YourStyle.css'`

### New Utility
1. Create file in `utils/`
2. Export from `utils/index.ts`
3. Import using: `import { yourUtil } from './utils'`

## 🎨 Code Style Guidelines

### Component Structure
```typescript
// 1. External imports
import React from 'react';
import { motion } from 'framer-motion';

// 2. Local imports (components, hooks, utils)
import { useToast } from '../hooks';
import { buttonHover } from '../utils';

// 3. Styles
import '../styles/Component.css';

// 4. Types
interface Props {
  // ...
}

// 5. Component
export const Component: React.FC<Props> = ({ prop }) => {
  // ...
};

// 6. Default export
export default Component;
```

### Hook Structure
```typescript
// 1. Imports
import { useState, useEffect } from 'react';

// 2. Types
interface ReturnType {
  // ...
}

// 3. Hook
export const useCustomHook = (): ReturnType => {
  // ...
};
```

## 🔧 Maintenance Notes

- **DO**: Use barrel exports for cleaner imports
- **DO**: Keep related files together
- **DO**: Use relative paths (`../` for parent folder)
- **DON'T**: Mix concerns (keep styles, logic, components separate)
- **DON'T**: Create circular dependencies

## 📚 Key Features

### ChatBot Component
- ✅ Message history with localStorage
- ✅ Copy-to-clipboard for messages
- ✅ Code block detection for ADB commands
- ✅ Typing indicators
- ✅ Quick action buttons
- ✅ Dark mode support

### FloatingChat Component
- ✅ Floating action button
- ✅ Expandable chat window
- ✅ Device context aware

### Hooks
- `useToast` - Toast notifications
- `useDarkMode` - Theme switching
- `useDeviceMonitor` - ADB device monitoring
- `usePackageAdvisor` - AI package analysis

---

*Last updated: December 2, 2025*
