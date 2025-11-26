# Tauri Android Components

React + TypeScript components for a Tauri desktop app that manages Android devices.

## Components

### DevicePanel.tsx
Displays connected Android device information with real-time updates.

**Features:**
- Device name, model, Android version
- Battery percentage and storage availability
- Connection status badge (Connected/No Device)
- Manual refresh button
- Loading states with skeleton UI
- Dark mode support

**Usage:**
```tsx
import DevicePanel from './DevicePanel';

function App() {
  return <DevicePanel />;
}
```

**Required Tauri Command:**
```rust
#[tauri::command]
fn get_device_info() -> Option<DeviceInfo> {
  // Return device info or None if no device connected
}
```

---

### PackageList.tsx
Shows all installed Android packages in a searchable table.

**Features:**
- Table with Package Name, App Name, Safety Level columns
- Real-time search filter
- Multi-select with checkboxes
- Selected count display
- Click row to show details modal
- Safety level color coding:
  - **Safe**: Green (bg-green-100)
  - **Caution**: Yellow (bg-yellow-100)
  - **Expert**: Orange (bg-orange-100)
  - **Dangerous**: Red (bg-red-600)
- Scrollable list (max 500px height)
- Hover effects on rows
- Dark mode support

**Usage:**
```tsx
import PackageList from './PackageList';

function App() {
  return <PackageList />;
}
```

**Required Tauri Command:**
```rust
#[tauri::command]
fn list_packages() -> Vec<Package> {
  // Return list of installed packages
}
```

---

## Type Definitions

See `types.ts` for shared TypeScript types:
- `DeviceInfo`
- `Package`
- `SafetyLevel`

---

## Setup Requirements

### 1. Tailwind CSS
Ensure Tailwind is configured in your React project:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js:**
```js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
};
```

### 2. Tauri API
Install Tauri API package:

```bash
npm install @tauri-apps/api
```

### 3. Backend Commands
Implement the following Tauri commands in your Rust backend:

- `get_device_info() -> Option<DeviceInfo>`
- `list_packages() -> Vec<Package>`

---

## Design Notes

- **No shadows**: All components use flat design
- **Sharp edges**: No rounded corners (removed `rounded-md` classes)
- **Minimal**: Clean, simple UI with gray borders
- **Fixed widths**: DevicePanel max 300px
- **Monospace fonts**: Package names use `font-mono`
- **Accessibility**: ARIA labels and live regions

---

## Example Integration

```tsx
import React from 'react';
import DevicePanel from './DevicePanel';
import PackageList from './PackageList';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Android Device Manager
        </h1>
        
        <div className="grid grid-cols-[300px_1fr] gap-6">
          <DevicePanel />
          <PackageList />
        </div>
      </div>
    </div>
  );
}

export default App;
```

---

## Development

Run your Tauri app in dev mode:

```bash
npm run tauri dev
```

Build for production:

```bash
npm run tauri build
```
