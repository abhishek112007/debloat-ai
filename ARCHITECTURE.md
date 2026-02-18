# Debloat AI - Project Architecture

## 📁 Project Structure

```
debloat-ai/
├── 📄 Configuration Files (Root)
│   ├── package.json              # Main project metadata & scripts
│   ├── .gitignore               # Git ignore rules
│   ├── .env                     # Environment variables (API keys)
│   └── LICENSE                  # MIT License
│
├── 📚 Documentation
│   ├── README.md                # Main project documentation
│   ├── INSTALL.md              # Installation guide for users
│   ├── CHANGELOG.md            # Version history & changes
│   ├── RELEASING.md            # Release process guide
│   ├── CONTRIBUTING.md         # Contribution guidelines
│   └── ARCHITECTURE.md         # This file - code organization
│
├── 🎨 frontend/                 # React + TypeScript UI
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── DevicePanel.tsx        # Device connection UI
│   │   │   ├── PackageList.tsx        # Package listing & actions
│   │   │   ├── AIPackageAdvisor.tsx   # AI safety analysis
│   │   │   ├── ChatBot.tsx            # AI chatbot interface
│   │   │   ├── FloatingChat.tsx       # Floating chat button
│   │   │   ├── BackupManager.tsx      # Backup/restore UI
│   │   │   ├── Settings.tsx           # App settings
│   │   │   ├── ThemeToggle.tsx        # Theme switcher
│   │   │   └── Toast.tsx              # Notifications
│   │   │
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useDarkMode.ts         # Theme management
│   │   │   ├── useDeviceMonitor.ts    # Device polling
│   │   │   ├── usePackageAdvisor.ts   # AI advisor logic
│   │   │   └── useToast.tsx           # Toast notifications
│   │   │
│   │   ├── utils/              # Helper functions
│   │   │   ├── api.ts                 # Backend API calls
│   │   │   ├── filterUtils.ts         # Package filtering
│   │   │   ├── messageUtils.ts        # Chat utilities
│   │   │   ├── storage.ts             # LocalStorage helpers
│   │   │   ├── themes.ts              # Theme definitions
│   │   │   └── animations.ts          # Animation utilities
│   │   │
│   │   ├── styles/             # CSS files
│   │   │   ├── ChatBot.css            # Chatbot styles
│   │   │   ├── FloatingChat.css       # Floating chat styles
│   │   │   ├── theme-dark.css         # Dark mode theme
│   │   │   ├── theme-light.css        # Light mode theme
│   │   │   └── neobrutalism-glassmorphism.css
│   │   │
│   │   ├── types/              # TypeScript types
│   │   │   └── ai-advisor.ts          # AI advisor types
│   │   │
│   │   ├── App.tsx             # Main app component
│   │   ├── main.tsx            # React entry point
│   │   ├── index.css           # Global styles
│   │   └── types.ts            # Shared TypeScript types
│   │
│   ├── public/                 # Static assets (if any)
│   ├── index.html              # HTML template
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.ts          # Vite bundler config
│   ├── tsconfig.json           # TypeScript config
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── postcss.config.js       # PostCSS config
│
├── 🐍 backend-python/           # Python FastAPI Backend
│   ├── main.py                 # FastAPI server & routes
│   ├── adb_operations.py       # ADB command wrappers
│   ├── ai_advisor.py           # Perplexity AI integration
│   ├── backup_manager.py       # Backup/restore logic
│   ├── api_types.py            # Pydantic models (types)
│   ├── requirements.txt        # Python dependencies
│   ├── backend.spec            # PyInstaller build spec
│   ├── test_backend.py         # Backend tests
│   └── README.md               # Backend documentation
│
├── ⚡ electron/                 # Electron Main Process
│   ├── main.js                 # Main process entry point
│   └── preload.js              # Preload script (IPC bridge)
│
├── 🎨 icons/                    # Application Icons
│   ├── icon.ico                # Windows icon
│   ├── icon.png                # Main PNG icon
│   ├── android/                # Android-style icons (optional)
│   ├── ios/                    # iOS-style icons (optional)
│   └── web/                    # Web icons (optional)
│
├── 🔧 scripts/                  # Build Scripts
│   └── build-backend.js        # PyInstaller automation
│
├── 🏗️ build-output/             # Build Artifacts (gitignored)
│   ├── backend/                # Compiled Python backend
│   └── platform-tools/         # Bundled ADB binaries
│
├── 📦 dist/                     # Electron Installers (gitignored)
│   └── DebloatAI-Setup-*.exe   # Final Windows installer
│
└── 🔐 .github/                   # GitHub Actions
    └── workflows/
        └── build.yml           # CI/CD pipeline
```

---

## 🏗️ Architecture Overview

### Technology Stack

```
┌─────────────────────────────────────────────────┐
│          Electron Desktop App (Cross-platform)  │
├─────────────────────────────────────────────────┤
│  Frontend (React + TypeScript + Vite)          │
│  - UI Components (React)                        │
│  - State Management (React Hooks)               │
│  - Styling (Tailwind CSS)                       │
│  - Build Tool (Vite)                            │
├─────────────────────────────────────────────────┤
│  Electron Main Process (Node.js)                │
│  - Window Management                            │
│  - IPC Communication                            │
│  - Backend Process Spawning                     │
├─────────────────────────────────────────────────┤
│  Backend (Python + FastAPI)                     │
│  - REST API Server (FastAPI)                    │
│  - ADB Operations (subprocess)                  │
│  - AI Integration (Perplexity API)              │
│  - Backup Management (JSON files)               │
└─────────────────────────────────────────────────┘
         │                    │
         │                    │
         ▼                    ▼
    [ADB Bridge]        [Perplexity AI]
         │
         ▼
   [Android Device]
```

---

## 🔄 Data Flow

### 1. Device Detection

```
User connects device
       │
       ▼
Frontend polls backend (/api/device/status)
       │
       ▼
Backend executes: adb devices
       │
       ▼
Frontend displays device info
```

### 2. Package Listing

```
User clicks "Refresh"
       │
       ▼
Frontend → /api/packages
       │
       ▼
Backend executes: adb shell pm list packages -f
       │
       ▼
Backend parses output
       │
       ▼
Frontend displays packages with filters
```

### 3. AI Package Advisor

```
User clicks "AI Advice"
       │
       ▼
Frontend → /api/ai/analyze-package
       │
       ▼
Backend → Perplexity API request
       │
       ▼
AI analyzes package safety
       │
       ▼
Frontend displays risk level + advice
```

### 4. Package Uninstallation

```
User selects package + confirms
       │
       ▼
Frontend → /api/packages/{package_name}
       │
       ▼
Backend creates backup (if enabled)
       │
       ▼
Backend executes: adb shell pm uninstall --user 0 {package}
       │
       ▼
Frontend shows success/error toast
```

---

## 🎯 Key Design Patterns

### Frontend Architecture

- **Component-Based**: Modular React components for reusability
- **Custom Hooks**: Shared logic extracted into hooks (useDeviceMonitor, useToast, etc.)
- **Utility Functions**: Pure helper functions in `utils/` folder
- **Type Safety**: Full TypeScript coverage with strict mode
- **CSS Modules**: Scoped styling with Tailwind + custom CSS

### Backend Architecture

- **RESTful API**: Clear endpoint structure matching resources
- **Separation of Concerns**: 
  - `main.py` → Routes & API
  - `adb_operations.py` → ADB logic
  - `ai_advisor.py` → AI logic
  - `backup_manager.py` → Backup logic
- **Type Validation**: Pydantic models for request/response validation
- **Error Handling**: Consistent error responses across all endpoints

### Communication Flow

```
React Component
      ↓
Custom Hook (useDeviceMonitor)
      ↓
Utility Function (api.ts)
      ↓
Fetch API → HTTP Request
      ↓
FastAPI Backend → Process
      ↓
Response → JSON
      ↓
Frontend State Update
      ↓
UI Re-render
```

---

## 🔧 Build Process

### Development Mode

```bash
npm run dev
```

**What happens:**
1. Vite dev server starts (frontend) → `localhost:5173`
2. Electron starts in dev mode
3. Backend must be started manually: `cd backend-python && python main.py`
4. Hot reloading enabled for frontend

### Production Build

```bash
npm run build
```

**What happens:**
1. `build:frontend` → Vite bundles React app to `frontend/dist/`
2. `build:backend` → PyInstaller compiles Python to `build-output/backend/`
3. `build:electron` → electron-builder creates installer in `dist/`

**Final Output:**
- Windows: `DebloatAI-Setup-1.0.0.exe` (NSIS installer)
- Linux: `debloat-ai_*.AppImage`, `debloat-ai_*.deb`
- macOS: `Debloat-AI_*.dmg`

---

## 📂 Important Files Explained

### Root Level

| File | Purpose |
|------|---------|
| `package.json` | Main project metadata, scripts, Electron config |
| `.gitignore` | Excludes build outputs, dependencies, env files |
| `.env` | **DO NOT COMMIT** - Contains `PERPLEXITY_API_KEY` |

### Frontend

| File | Purpose |
|------|---------|
| `App.tsx` | Root component, theme provider, main layout |
| `components/DevicePanel.tsx` | Device connection status & info |
| `components/PackageList.tsx` | Package table with search/filter/actions |
| `hooks/useDeviceMonitor.ts` | Auto-polls backend for device status |
| `utils/api.ts` | All backend API calls centralized |

### Backend

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, routes, CORS, startup/shutdown |
| `adb_operations.py` | All ADB commands wrapped in Python functions |
| `ai_advisor.py` | Perplexity API client, safety analysis logic |
| `backup_manager.py` | JSON backup creation, restore functionality |

---

## 🌐 API Endpoints

### Device Management
- `GET /api/device/status` - Check if device connected
- `GET /api/device/info` - Get device model, Android version

### Package Management
- `GET /api/packages` - List all installed packages
- `DELETE /api/packages/{package_name}` - Uninstall package
- `POST /api/packages/{package_name}/restore` - Reinstall package

### AI Features
- `POST /api/ai/analyze-package` - Get AI advice for package
- `POST /api/ai/chat` - Chat with AI assistant

### Backup
- `GET /api/backups` - List all backups
- `POST /api/backups` - Create new backup
- `POST /api/backups/restore` - Restore from backup

---

## 🧪 Testing Strategy

### Frontend Testing
- Manual testing in dev mode
- Test across themes (light/dark)
- Test responsive design

### Backend Testing
- `test_backend.py` - Unit tests for API endpoints
- Manual testing with real Android device
- Test error handling (no device, no permissions)

### Integration Testing
- Full user flow testing
- Device connection → Package listing → Uninstall → Restore

---

## 🚀 Release Process

See [RELEASING.md](RELEASING.md) for detailed release instructions.

**Quick Summary:**
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes
4. Create git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
5. Push tag: `git push origin v1.0.0`
6. GitHub Actions builds installers automatically
7. Publish release on GitHub

---

## 🔐 Security Considerations

1. **API Keys**: Never commit `.env` file
2. **ADB Permissions**: App requires debug mode enabled on device
3. **Package Removal**: Always create backups before removing critical packages
4. **User Consent**: Confirmation dialogs for destructive actions

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

**Quick Start:**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and test thoroughly
4. Commit with conventional commits: `feat:`, `fix:`, `docs:`
5. Push and create Pull Request

---

## 📚 Further Reading

- [README.md](README.md) - User-facing documentation
- [INSTALL.md](INSTALL.md) - Installation instructions
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [backend-python/README.md](backend-python/README.md) - Backend API reference

---

## 💡 Development Tips

### Debugging Frontend
```bash
# Open DevTools in Electron
Ctrl+Shift+I (Windows/Linux)
Cmd+Option+I (macOS)
```

### Debugging Backend
```bash
# Look at FastAPI logs
cd backend-python
python main.py
# Backend runs on http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Testing ADB Commands
```bash
# List connected devices
adb devices

# List packages
adb shell pm list packages

# Get device info
adb shell getprop ro.product.model
```

---

**Last Updated**: February 18, 2026  
**Version**: 1.0.0
