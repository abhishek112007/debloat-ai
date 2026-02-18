<div align="center">

# Debloat AI 🤖

### AI-Powered Android Debloater

**Safely remove bloatware from your Android devices using ADB + AI intelligence**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/abhishek112007/debloat-ai)](https://github.com/abhishek112007/debloat-ai/releases)
[![GitHub issues](https://img.shields.io/github/issues/abhishek112007/debloat-ai)](https://github.com/abhishek112007/debloat-ai/issues)
[![GitHub stars](https://img.shields.io/github/stars/abhishek112007/debloat-ai)](https://github.com/abhishek112007/debloat-ai/stargazers)

[![Electron](https://img.shields.io/badge/Electron-28.0-47848F.svg)](https://www.electronjs.org)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg)](https://www.python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com)

[Features](#-features) • [Installation](#-installation) • [Usage](#-how-to-use) • [AI Features](#-ai-features) • [Contributing](#-contributing)

</div>

---

## 📖 What is Debloat AI?

**Debloat AI** is a modern cross-platform desktop application that helps you remove unwanted pre-installed apps (bloatware) from your Android device. What makes it special is the **AI-powered safety analysis** - it uses Perplexity AI to give you intelligent recommendations about which packages are safe to remove.

### Key Highlights

- 🚫 **No Root Required** - Uses ADB (Android Debug Bridge), accessible to everyone
- 🤖 **AI-Powered Advice** - Get detailed safety analysis for any package
- 💬 **AI Chatbot** - Ask questions about debloating in natural language
- 🛡️ **Safety First** - Color-coded risk levels to prevent accidents
- 💾 **Backup & Restore** - Never lose your data

---

## ✨ Features

### Core Features

| Feature | Description |
|---------|-------------|
| 🔌 **Device Detection** | Auto-detect Android devices connected via USB |
| 📦 **Package Manager** | View all installed packages with search & filter |
| 🛡️ **Safety Ratings** | 50+ pre-classified bloatware with risk levels |
| 💾 **Backup System** | Create JSON backups before removing packages |
| 🔄 **Restore Function** | Reinstall previously removed packages |
| 🎨 **Theme Support** | Light/Dark mode with multiple color themes |

### AI-Powered Features

| Feature | Description |
|---------|-------------|
| ⚡ **AI Package Advisor** | Deep analysis of any package's safety |
| 💬 **AI Chatbot** | Conversational assistant for debloating advice |
| 🗣️ **Voice Input** | Speak your questions to the chatbot |
| 📝 **Chat History** | Export/import your conversation history |

### Safety Classification System

| Level | Color | Meaning |
|-------|-------|---------|
| 🟢 Safe | Green | Third-party apps, easily reinstallable |
| 🟡 Caution | Yellow | OEM apps, may affect minor features |
| 🟠 Expert | Orange | May break functionality, technical knowledge required |
| 🔴 Dangerous | Red | Critical system components - **DO NOT REMOVE** |

---

## 🚀 Installation

### 📥 Quick Install (Recommended for Users)

**No coding required! Just download and install.**

#### Windows
1. Download [`Debloat-AI.msi`](https://github.com/abhishek112007/debloat-ai/releases/latest) from the latest release
2. Run the installer
3. Launch from Start Menu

#### Linux
**AppImage (Universal)**
```bash
# Download, make executable, and run
chmod +x Debloat-AI_*.AppImage
./Debloat-AI_*.AppImage
```

**Debian/Ubuntu (.deb)**
```bash
sudo dpkg -i debloat-ai_*.deb
```

#### macOS
1. Download the `.dmg` file for your architecture (Apple Silicon or Intel)
2. Drag to Applications folder
3. Right-click → Open (first launch only)

📖 **Detailed installation instructions**: See [INSTALL.md](INSTALL.md)

### ⚙️ Requirements

**You MUST have ADB installed:**
- **Windows**: Download [Platform Tools](https://developer.android.com/tools/releases/platform-tools), extract, and add to PATH
- **Linux**: `sudo apt-get install android-tools-adb`
- **macOS**: `brew install android-platform-tools`

**Android device setup:**
1. Enable Developer Options (tap Build Number 7 times)
2. Enable USB Debugging
3. Connect via USB and authorize your computer

---

## 👨‍💻 Development Setup

> **Note**: Only needed if you want to build from source or contribute to development.

### Prerequisites

1. **Node.js** (version 18 or higher) - https://nodejs.org/
2. **Python** (version 3.10 or higher) - https://www.python.org/
3. **ADB** (Android Debug Bridge) - See requirements above
4. **Perplexity API Key** (optional, for AI features) - https://www.perplexity.ai/settings/api

### Build from Source

```bash
# Clone the repository
git clone https://github.com/abhishek112007/debloat-ai.git
cd debloat-ai

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install Python backend dependencies
cd backend-python
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
# source .venv/bin/activate
pip install -r requirements.txt
cd ..

# (Optional) Set up AI features
cp .env.example .env
# Edit .env and add your API key

# Run in development mode
# Terminal 1: Backend
cd backend-python
python main.py

# Terminal 2: Frontend + Electron
npm run dev
```

The app will start with:
- 🌐 Frontend dev server at `http://localhost:5173`
- 🐍 Python backend API at `http://localhost:8000`
- ⚡ Electron window (loads frontend)

### Build Production Release

```bash
# Full production build (all platforms)
npm run build

# Or build individually
npm run build:frontend    # Build React app
npm run build:backend     # Compile Python backend
npm run build:electron    # Create Windows installer
```

Find installers in: `dist/`

---

## 📱 How to Use

### Step 1: Prepare Your Android Device

1. **Enable Developer Options**
   - Go to `Settings` → `About Phone`
   - Tap **Build Number** 7 times
   - You'll see "You are now a developer!"

2. **Enable USB Debugging**
   - Go to `Settings` → `Developer Options`
   - Turn on **USB Debugging**

3. **Connect via USB**
   - Use a good quality USB cable
   - When prompted on your phone, tap **Allow** to authorize debugging

### Step 2: Use the App

1. **Launch Debloat AI** - The app will auto-detect your device

2. **Browse Packages** - Use filters to find bloatware:
   - Filter by safety level (Safe/Caution/Expert)
   - Search by package name
   - View system vs user apps

3. **Analyze with AI** - Click the ⚡ icon on any package to get:
   - Detailed safety analysis
   - Purpose and dependencies
   - Removal consequences
   - Community reports

4. **Create a Backup** - Always backup before removing!

5. **Remove Packages** - Select and uninstall with confidence

---

## 🤖 AI Features

### AI Package Advisor

Click the ⚡ lightning bolt icon next to any package to get an AI-powered analysis:

```
📊 What you get:
├── Risk Category (Safe/Caution/Expert/Dangerous)
├── Package Purpose & Function
├── System Dependencies
├── Removal Consequences
├── Community Reports
└── Best/Worst Case Scenarios
```

### AI Chatbot

Open the chatbot to ask questions in natural language:

**Example questions:**
- "Is it safe to remove Samsung Bixby?"
- "What Google apps can I safely uninstall?"
- "Will removing Facebook break anything?"
- "What bloatware should I remove on Xiaomi devices?"

**Features:**
- Context-aware (knows your connected device)
- Conversation history
- Voice input support
- Export/import chat logs

### Setting Up AI (Optional)

1. Get an API key from [Perplexity AI](https://www.perplexity.ai/settings/api)
2. Create a `.env` file in the project root:
   ```
   PERPLEXITY_API_KEY=your_key_here
   ```
3. Restart the application

> **Note**: The backend will automatically load the API key from the `.env` file.

---

## 🏗️ Project Structure

```
debloat-ai/
│
├── 📁 frontend/                    # React + TypeScript UI
│   ├── src/
│   │   ├── App.tsx                # Main application component
│   │   ├── types.ts               # TypeScript interfaces
│   │   │
│   │   ├── 📁 components/         # React components
│   │   │   ├── DevicePanel.tsx    # Device connection status
│   │   │   ├── PackageList.tsx    # Package list with filtering
│   │   │   ├── AIPackageAdvisor.tsx # AI analysis sidebar
│   │   │   ├── ChatBot.tsx        # AI chatbot interface
│   │   │   ├── FloatingChat.tsx   # Floating chat button
│   │   │   ├── BackupManager.tsx  # Backup/restore UI
│   │   │   ├── Settings.tsx       # App settings
│   │   │   └── ThemeSelector.tsx  # Theme picker
│   │   │
│   │   ├── 📁 hooks/              # Custom React hooks
│   │   │   ├── useDeviceMonitor.ts
│   │   │   ├── usePackageAdvisor.ts
│   │   │   ├── useDarkMode.ts
│   │   │   └── useToast.tsx
│   │   │
│   │   ├── 📁 utils/              # Utility functions
│   │   │   ├── api.ts             # Backend API calls
│   │   │   ├── filterUtils.ts     # Package filtering
│   │   │   ├── storage.ts         # LocalStorage helpers
│   │   │   └── themes.ts          # Theme definitions
│   │   │
│   │   └── 📁 styles/             # Component styles
│   │
│   └── vite.config.ts             # Vite configuration
│
├── 📁 backend-python/              # Python FastAPI Backend
│   ├── main.py                    # FastAPI server & routes
│   ├── adb_operations.py          # ADB command wrappers
│   ├── ai_advisor.py              # Perplexity AI integration
│   ├── backup_manager.py          # Backup/restore logic
│   ├── api_types.py               # Pydantic models
│   ├── requirements.txt           # Python dependencies
│   └── test_backend.py            # Backend tests
│
├── 📁 electron/                    # Electron Main Process
│   ├── main.js                    # Main process entry point
│   └── preload.js                 # Preload script (IPC)
│
├── 📁 icons/                       # Application icons
├── 📁 scripts/                     # Build scripts
│   └── build-backend.js           # PyInstaller automation
│
├── 📄 README.md                   # You are here
├── 📄 ARCHITECTURE.md             # Detailed code architecture
├── 📄 CONTRIBUTING.md             # Contribution guidelines
├── 📄 INSTALL.md                  # Installation instructions
├── 📄 CHANGELOG.md                # Version history
├── 📄 RELEASING.md                # Release process guide
└── package.json                   # Main project configuration
```

> **📚 For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md)**

---

## 🎨 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18.2 | UI Framework |
| TypeScript 5.3 | Type Safety |
| Tailwind CSS 3.4 | Styling |
| Vite 5.0 | Build Tool & Dev Server |

### Desktop Framework

| Technology | Purpose |
|------------|---------|
| Electron 28.0 | Cross-platform desktop app |
| Node.js | Runtime environment |

### Backend

| Technology | Purpose |
|------------|---------|
| Python 3.14 | Backend Language |
| FastAPI | REST API Framework |
| Pydantic | Data Validation |
| PyInstaller | Backend compilation |

### External Services

| Service | Purpose |
|---------|---------|
| ADB (Android Debug Bridge) | Android device communication |
| Perplexity AI | Package analysis & chatbot |

---

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend (Vite) & Electron in development mode |
| `npm run frontend` | Start Vite dev server only |
| `npm run electron:dev` | Run Electron in development mode |
| `npm run build` | Full production build (frontend + backend + Electron) |
| `npm run build:frontend` | Build React app for production |
| `npm run build:backend` | Compile Python backend with PyInstaller |
| `npm run build:electron` | Create Windows installer |
| `npm run clean` | Clean build artifacts |

> **Note**: Backend must be started manually in development:  
> `cd backend-python && python main.py`

---

## 🐛 Troubleshooting

### Device Not Detected?

| Problem | Solution |
|---------|----------|
| ADB not found | Ensure ADB is installed and added to PATH |
| No USB debugging | Enable USB Debugging in Developer Options |
| Connection denied | Tap "Allow" on the authorization prompt on your phone |
| Still not working | Try a different USB cable or port |
| Windows drivers | Install device-specific USB drivers |

### Build Errors?

```powershell
# Clear build artifacts
Remove-Item target -Recurse -Force

# Clean npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

### AI Features Not Working?

1. Check if `.env` file exists in the project root
2. Verify your API key is valid
3. Check your internet connection
4. Check backend logs for API errors
5. Restart the application

---

## 📦 Supported Bloatware

The app includes 50+ pre-classified packages from:

| Category | Examples |
|----------|----------|
| Google Apps | Gmail, Drive, Photos, Maps, YouTube |
| Samsung | Bixby, Galaxy Store, Samsung Pay |
| Xiaomi | Mi Browser, Mi Cloud, MIUI Apps |
| OPPO/Vivo | Theme Store, Game Center |
| Facebook | Facebook, Instagram Services |
| Carrier Apps | Carrier-specific bloatware |

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Start

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit: `git commit -m 'feat: add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Areas for Contribution

- 📦 Add more bloatware packages to the database
- 🌍 Multi-language support
- 🎨 New themes and UI improvements
- 📱 Device-specific profiles
- 🧪 Testing and bug reports
- 📖 Documentation improvements

> **📚 See [CONTRIBUTING.md](CONTRIBUTING.md) for full contribution guidelines**

---

## 👤 Author

**Abhishek**

- GitHub: [@abhishek112007](https://github.com/abhishek112007)
- Repository: [debloat-ai](https://github.com/abhishek112007/debloat-ai)

---

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - Amazing desktop framework
- [React](https://react.dev/) - UI library
- [Perplexity AI](https://www.perplexity.ai/) - AI analysis
- [Android ADB](https://developer.android.com/tools/adb) - Device communication
- Community bloatware lists and contributors

---

<div align="center">

⭐ **Star this repo if you find it helpful!** ⭐

Made with ❤️ by [Abhishek](https://github.com/abhishek112007)

</div>
