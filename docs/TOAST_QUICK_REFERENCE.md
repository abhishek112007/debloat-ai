# Toast Component - Quick Reference

## 🚀 Quick Start

```tsx
import { useToast } from './useToast';

function App() {
  const { showToast, ToastContainer } = useToast();

  return (
    <div>
      <button onClick={() => showToast({ message: 'Success!', type: 'success' })}>
        Click me
      </button>
      <ToastContainer />
    </div>
  );
}
```

## 📋 All Examples

```tsx
// Success (Green #10b981)
showToast({ message: '✅ Saved successfully', type: 'success' });

// Error (Red #ef4444)
showToast({ message: '❌ Failed to save', type: 'error' });

// Warning (Orange #f59e0b)
showToast({ message: '⚠️ Are you sure?', type: 'warning' });

// Info (Blue #3b82f6)
showToast({ message: 'ℹ️ Update available', type: 'info' });

// Custom duration
showToast({ message: 'Quick message', type: 'info', duration: 3000 });
```

## 🎨 Features

✅ Auto-dismiss after 5 seconds (configurable)  
✅ Manual close with X button  
✅ 4 color-coded types  
✅ Smooth fade in/out animations  
✅ Stack multiple toasts  
✅ Bottom-right positioning  
✅ No rounded corners  
✅ Dark mode support  

## 🔧 API

### `useToast()` Returns:
- `showToast(config)` - Show a toast
- `ToastContainer` - Component to render toasts

### `ToastConfig`:
```typescript
{
  message: string;      // Required
  type: ToastType;      // 'success' | 'error' | 'warning' | 'info'
  duration?: number;    // Optional, default 5000ms
}
```

## 📍 Position

Fixed at **bottom-right** corner:
- 16px from bottom
- 16px from right
- z-index: 50

## 🎭 Animation

- **Fade in**: 300ms slide from right
- **Fade out**: 300ms slide to right
- **Auto-close**: After duration (default 5000ms)

## 🔄 Replace App.tsx Notifications

**Remove this:**
```tsx
const [notifications, setNotifications] = useState([]);
const addNotification = (msg, type) => { /* complex logic */ };
```

**Replace with:**
```tsx
const { showToast, ToastContainer } = useToast();
showToast({ message: msg, type: type });
```

## ⚠️ Important

- Must include `<ToastContainer />` in JSX
- Only call `useToast()` once per component
- Toasts stack automatically (no limit)

## 📦 Files

- `Toast.tsx` - Core component
- `useToast.tsx` - Hook
- `ToastExamples.tsx` - Examples
- `TOAST_DOCUMENTATION.md` - Full docs
