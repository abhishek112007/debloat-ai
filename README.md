# Debloat AI 🤖

> AI-powered Android debloater - Safely remove bloatware from your Android devices using ADB

A modern cross-platform desktop application built with **Tauri 2.0** and **React** that helps you identify and remove unwanted bloatware from Android devices without requiring root access.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tauri](https://img.shields.io/badge/Tauri-2.0-24C8D8.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)

## ✨ Features

- 🔌 **Device Management** - Auto-detect and connect to Android devices via ADB
- 📦 **Smart Package Analysis** - Categorize 50+ bloatware packages with safety ratings
- 🛡️ **Safety First** - Color-coded safety levels (Safe/Caution/Expert/Dangerous)
- 💾 **Backup System** - Create and restore backups before removing packages
- 🎨 **Modern UI** - Beautiful interface with dark mode and multiple themes
- 🚀 **No Root Required** - Works with ADB, no device rooting needed
- 🔄 **Real-time Monitoring** - Live device connection status
- 📊 **Filtering & Search** - Easy package discovery and filtering

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ 
- **Rust** (stable toolchain)
- **ADB** (Android Debug Bridge) - [Download here](https://developer.android.com/tools/releases/platform-tools)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/abhishek112007/debloat-ai.git
cd debloat-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the application**
```bash
npm run dev
```

The app will start with:
- Frontend at `http://localhost:1420`
- Tauri backend running concurrently

### Building for Production

```bash
npm run tauri:build
```

Executables will be in `backend/tauri/target/release/`

## 🏗️ Architecture

```
debloat-ai/
├── frontend/                # React + TypeScript UI
│   ├── src/
│   │   ├── App.tsx         # Main application
│   │   ├── DevicePanel.tsx # Device connection UI
│   │   ├── PackageList.tsx # Package management
│   │   ├── BackupManager.tsx # Backup operations
│   │   └── themes.ts       # Theme system
│   └── public/             # Static assets & icons
│
├── backend/tauri/          # Rust backend
│   ├── src/
│   │   ├── main.rs        # Entry point
│   │   ├── adb.rs         # ADB communication layer
│   │   ├── commands.rs    # Tauri commands
│   │   ├── package_database.rs # Bloatware definitions
│   │   └── backup.rs      # Backup system
│   └── icons/             # App icons (all platforms)
│
└── package.json           # Project configuration
```

## 🎨 Tech Stack

### Frontend
- **React 18.2** - UI framework
- **TypeScript 5.3** - Type safety
- **Tailwind CSS 3.4** - Styling
- **Vite 5.0** - Build tool
- **React Icons** - Icon library

### Backend
- **Tauri 2.0** - Desktop framework
- **Rust** - Backend language
- **ADB** - Android communication
- **Serde** - Serialization

## 📱 Usage

1. **Enable USB Debugging** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options → Enable USB Debugging

2. **Connect Device** via USB

3. **Launch Debloat AI** and authorize the connection on your device

4. **Select Packages** to remove based on safety ratings:
   - 🟢 **Safe** - No system impact
   - 🟡 **Caution** - Minor feature loss
   - 🟠 **Expert** - Advanced users only
   - 🔴 **Dangerous** - Critical system components

5. **Create Backup** before removing (recommended)

6. **Uninstall** selected packages

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (frontend + backend) |
| `npm run frontend` | Start Vite dev server only |
| `npm run build` | Build frontend for production |
| `npm run tauri` | Run Tauri in dev mode |
| `npm run tauri:build` | Build production executable |

## 🐛 Troubleshooting

**Device not detected?**
- Ensure ADB is installed and in PATH
- Enable USB Debugging on device
- Try different USB cable/port
- Check device drivers (Windows)

**Build errors?**
- Clear target directory: `Remove-Item target -Recurse -Force`
- Clean npm cache: `npm cache clean --force`
- Reinstall dependencies: `npm install`

## 📦 Package Database

The app includes 50+ pre-classified bloatware packages with safety ratings. Common categories:
- Google apps (Gmail, Drive, Photos)
- OEM bloatware (Samsung, Xiaomi, OPPO)
- Social media apps
- Pre-installed games
- Carrier apps

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Add more bloatware packages
- Support for wireless ADB
- Package restore functionality
- Multi-language support

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Abhishek**
- GitHub: [@abhishek112007](https://github.com/abhishek112007)
- Repository: [debloat-ai](https://github.com/abhishek112007/debloat-ai)

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - Amazing desktop framework
- [React](https://react.dev/) - UI library
- [Android ADB](https://developer.android.com/tools/adb) - Device communication
- Community bloatware lists

---

⭐ **Star this repo if you find it helpful!**
