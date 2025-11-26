# Toast Notification System

A clean, customizable toast notification system for React with TypeScript support.

## Files Created

- **Toast.tsx** - Core toast component
- **useToast.tsx** - Custom React hook for managing toasts
- **ToastExamples.tsx** - Usage examples

## Features

✅ **Auto-dismiss** - Configurable duration (default 5000ms)  
✅ **Manual close** - X button to dismiss immediately  
✅ **4 types** - success, error, warning, info with distinct colors  
✅ **Smooth animations** - Fade in/out with slide-in from right  
✅ **Multiple toasts** - Stack multiple notifications vertically  
✅ **No rounded corners** - Clean rectangular design  
✅ **Dark mode support** - Automatic theme-aware styling  
✅ **Accessibility** - ARIA roles and keyboard support  

## Quick Start

### 1. Basic Usage

```tsx
import { useToast } from './useToast';

function MyComponent() {
  const { showToast, ToastContainer } = useToast();

  const handleClick = () => {
    showToast({
      message: 'Operation successful!',
      type: 'success',
    });
  };

  return (
    <div>
      <button onClick={handleClick}>Show Toast</button>
      <ToastContainer /> {/* REQUIRED: Place this in your component */}
    </div>
  );
}
```

### 2. All Toast Types

```tsx
// Success
showToast({
  message: '✅ Successfully saved!',
  type: 'success',
  duration: 5000, // optional
});

// Error
showToast({
  message: '❌ Failed to save',
  type: 'error',
  duration: 6000,
});

// Warning
showToast({
  message: '⚠️ Are you sure?',
  type: 'warning',
  duration: 4000,
});

// Info
showToast({
  message: 'ℹ️ New update available',
  type: 'info',
});
```

### 3. Integration with App.tsx

Replace the inline notification system in App.tsx with the useToast hook:

```tsx
import { useToast } from './useToast';

const App: React.FC = () => {
  const { showToast, ToastContainer } = useToast();

  const handleUninstallSelected = async () => {
    // ... uninstall logic ...
    
    if (successCount > 0) {
      showToast({
        message: `✅ Successfully uninstalled ${successCount} package(s)`,
        type: 'success',
      });
    }
    
    if (failCount > 0) {
      showToast({
        message: `❌ Failed to uninstall ${failCount} package(s)`,
        type: 'error',
      });
    }
  };

  return (
    <div>
      {/* ... your app content ... */}
      
      {/* Place ToastContainer at the end */}
      <ToastContainer />
    </div>
  );
};
```

## API Reference

### `useToast()` Hook

Returns an object with:

```typescript
{
  showToast: (config: ToastConfig) => void;
  ToastContainer: React.FC;
}
```

### `ToastConfig` Interface

```typescript
interface ToastConfig {
  message: string;           // The message to display
  type: ToastType;          // 'success' | 'error' | 'warning' | 'info'
  duration?: number;        // Auto-close delay in ms (default: 5000)
}
```

### `Toast` Component Props

```typescript
interface ToastProps {
  message: string;          // The notification message
  type: ToastType;         // Visual style type
  duration?: number;       // Auto-dismiss duration (default: 5000ms)
  onClose: () => void;     // Callback when toast closes
}
```

## Color Scheme

| Type    | Light Background | Dark Background | Border        | Text          |
|---------|------------------|-----------------|---------------|---------------|
| Success | Green-50         | Green-900/20    | Green-600     | Green-800/200 |
| Error   | Red-50           | Red-900/20      | Red-600       | Red-800/200   |
| Warning | Orange-50        | Orange-900/20   | Orange-600    | Orange-800/200|
| Info    | Blue-50          | Blue-900/20     | Blue-600      | Blue-800/200  |

### Exact Colors

- **Success**: #10b981 (green)
- **Error**: #ef4444 (red)
- **Warning**: #f59e0b (orange)
- **Info**: #3b82f6 (blue)

## Positioning

Toasts appear in the **bottom-right corner** with:
- Fixed positioning
- `z-index: 50` (won't be covered by most elements)
- 16px from bottom and right edges
- Stacked vertically with 8px gap between toasts

## Animation Details

### Fade In (300ms)
```
opacity: 0 → 1
translateX: 100% → 0
```

### Fade Out (300ms)
```
opacity: 1 → 0
translateX: 0 → 100%
```

Animation uses `transition-all duration-300 ease-in-out`.

## Multiple Toasts

The system supports **multiple simultaneous toasts**:

```tsx
showToast({ message: 'First', type: 'info' });
showToast({ message: 'Second', type: 'success' });
showToast({ message: 'Third', type: 'warning' });
```

Toasts stack vertically from bottom to top. Each toast has independent timing.

## Accessibility

- **ARIA role**: `alert`
- **ARIA live**: `polite` (announces to screen readers)
- **Close button**: Labeled with `aria-label="Close notification"`
- **Keyboard**: Click X button or wait for auto-dismiss

## Implementation Details

### Auto-Dismiss Logic

```typescript
useEffect(() => {
  // Trigger fade-in after mount
  const showTimer = setTimeout(() => setIsVisible(true), 10);

  // Auto-close after duration
  const closeTimer = setTimeout(() => {
    handleClose();
  }, duration);

  // Cleanup timers
  return () => {
    clearTimeout(showTimer);
    clearTimeout(closeTimer);
  };
}, [duration]);
```

### Close Behavior

```typescript
const handleClose = () => {
  setIsExiting(true);
  setIsVisible(false);
  
  // Wait for fade-out animation (300ms)
  setTimeout(() => {
    onClose(); // Remove from DOM
  }, 300);
};
```

## Integration Checklist

- [ ] Copy `Toast.tsx` to your `src/` folder
- [ ] Copy `useToast.tsx` to your `src/` folder
- [ ] Import and use `useToast()` in your component
- [ ] Place `<ToastContainer />` in your JSX (once per component)
- [ ] Call `showToast()` to display notifications
- [ ] Test all 4 types (success, error, warning, info)

## Replacing App.tsx Notifications

**Before** (App.tsx with inline notifications):
```tsx
const [notifications, setNotifications] = useState<Notification[]>([]);

const addNotification = (message: string, type: string) => {
  // ... complex state management ...
};

// Complex JSX for notification rendering
<div className="fixed bottom-4 right-4">
  {notifications.map(/* ... */)}
</div>
```

**After** (App.tsx with useToast):
```tsx
const { showToast, ToastContainer } = useToast();

// Simple one-liner
showToast({ message: 'Success!', type: 'success' });

// Simple component
<ToastContainer />
```

## Customization

### Change Duration Globally

Modify the default in `Toast.tsx`:

```typescript
const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  duration = 3000,  // Change from 5000 to 3000ms
  onClose 
}) => {
```

### Change Colors

Edit `getTypeStyles()` in `Toast.tsx`:

```typescript
case 'success':
  return 'bg-green-50 border-green-600 text-green-800';
  //      ↑ Change these Tailwind classes
```

### Change Position

Edit the container in `Toast.tsx`:

```typescript
className="fixed bottom-4 right-4"
          // ↑ Change to top-4, left-4, etc.
```

### Add Icons

You can add custom icons instead of emojis:

```typescript
const getIcon = (): JSX.Element => {
  switch (type) {
    case 'success':
      return <CheckIcon className="w-5 h-5" />;
    // ...
  }
};
```

## Example: Full App Integration

```tsx
import React from 'react';
import { useToast } from './useToast';
import DevicePanel from './DevicePanel';
import PackageList from './PackageList';

const App: React.FC = () => {
  const { showToast, ToastContainer } = useToast();

  const handleAction = async () => {
    try {
      // Perform action
      await doSomething();
      
      showToast({
        message: 'Action completed successfully',
        type: 'success',
      });
    } catch (error) {
      showToast({
        message: `Error: ${error.message}`,
        type: 'error',
        duration: 7000, // Keep error visible longer
      });
    }
  };

  return (
    <div className="app">
      <DevicePanel />
      <PackageList onAction={handleAction} />
      
      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default App;
```

## Troubleshooting

### Toasts Not Appearing

**Problem**: `showToast()` doesn't display anything  
**Solution**: Make sure `<ToastContainer />` is rendered in your JSX

### Toasts Appear Under Other Elements

**Problem**: Other elements cover the toast  
**Solution**: Increase `z-index` in Toast.tsx (default is `z-50`)

### Animation Not Smooth

**Problem**: Toasts jump instead of sliding  
**Solution**: Ensure Tailwind's transition utilities are working:
```bash
npm install -D tailwindcss@latest
```

### Multiple ToastContainers

**Problem**: Using `useToast()` in multiple components creates separate toast systems  
**Solution**: Either:
1. Use `useToast()` only in top-level component
2. Or create a global context provider (advanced)

## Performance

- **Lightweight**: ~100 lines of code total
- **No dependencies**: Uses only React built-in hooks
- **Efficient rendering**: Only active toasts are in DOM
- **Auto-cleanup**: Toasts remove themselves after closing

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires modern browser with CSS Grid and Flexbox support.

## TypeScript Support

Full TypeScript support with strict types:

```typescript
// Type-safe toast calls
showToast({
  message: 'Hello',
  type: 'success', // ✅ Type-checked
  // type: 'invalid', // ❌ TypeScript error
});
```

---

**Built with**: React + TypeScript + Tailwind CSS  
**License**: MIT  
**Author**: Android Debloater Team
