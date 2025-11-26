# Android Debloater

A cross-platform desktop application built with Tauri and React to safely remove bloatware from Android devices using ADB (Android Debug Bridge).

## 🏗️ Project Structure

```
android-debloater/
├── frontend/               # React + TypeScript frontend
│   ├── src/               # React components and utilities
│   ├── index.html         # Entry HTML file
│   ├── vite.config.ts     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── tsconfig.json      # TypeScript configuration
│
├── backend/               # Rust backend
│   └── tauri/            # Tauri application
│       ├── src/          # Rust source code
│       ├── Cargo.toml    # Rust dependencies
│       └── tauri.conf.json # Tauri configuration
│
├── docs/                  # Project documentation
│   ├── APP_INTEGRATION_GUIDE.md
│   ├── DARKMODE_HOOK.md
│   ├── FEATURE_REFERENCE.md
│   ├── PACKAGE_DATABASE.md
│   ├── PROJECT_READINESS_ANALYSIS.md
│   ├── PROJECT_STRUCTURE.md
│   ├── SETTINGS_DOCUMENTATION.md
│   ├── TAURI_SETUP.md
│   ├── TOAST_DOCUMENTATION.md
│   └── TOAST_QUICK_REFERENCE.md
│
├── package.json           # Project dependencies and scripts
├── .gitignore            # Git ignore rules
└── README.md             # Component documentation

```

## 🚀 Features

- **Device Management**: Connect and manage multiple Android devices
- **Package Analysis**: List and categorize installed packages
- **Safe Debloating**: Remove bloatware without root access
- **Backup System**: Create backups before making changes
- **Modern UI**: Clean, flat design with dark mode support
- **Cross-platform**: Works on Windows, macOS, and Linux

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Rust** (latest stable version)
- **ADB** (Android Debug Bridge)
- **Tauri CLI**

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/abhishek112007/debloat_ai.git
cd debloat_ai
```

2. Install dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

## 💻 Development

Run the application in development mode:

```bash
npm run tauri:dev
```

This will:
- Start the Vite dev server for the frontend
- Launch the Tauri application with hot-reload

## 🏗️ Building

Build the application for production:

```bash
npm run tauri:build
```

The built application will be in `backend/tauri/target/release/`.

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- **[APP_INTEGRATION_GUIDE.md](docs/APP_INTEGRATION_GUIDE.md)** - Complete integration guide
- **[FEATURE_REFERENCE.md](docs/FEATURE_REFERENCE.md)** - Feature specifications
- **[TAURI_SETUP.md](docs/TAURI_SETUP.md)** - Tauri setup instructions
- **[SETTINGS_DOCUMENTATION.md](docs/SETTINGS_DOCUMENTATION.md)** - Settings configuration

## 🎨 Tech Stack

### Frontend
- **React 18.2** - UI library
- **TypeScript 5.3** - Type-safe JavaScript
- **Tailwind CSS 3.4** - Utility-first CSS
- **Vite 4.2** - Build tool
- **React Icons** - Icon library

### Backend
- **Tauri 2.0** - Desktop application framework
- **Rust** - System programming language
- **ADB** - Android Debug Bridge integration

## 📝 Scripts

- `npm run dev` - Start Vite dev server (frontend only)
- `npm run build` - Build frontend for production
- `npm run tauri:dev` - Run Tauri app in development mode
- `npm run tauri:build` - Build Tauri app for production

## 🤝 Contributing

Contributions are welcome! Please read the documentation in the `docs/` folder to understand the project structure.

## 📄 License

This project is open source and available under the MIT License.

## 🐛 Issues

If you encounter any issues, please file them in the [GitHub Issues](https://github.com/abhishek112007/debloat_ai/issues) section.

## 👤 Author

**Abhishek**
- GitHub: [@abhishek112007](https://github.com/abhishek112007)

## 🙏 Acknowledgments

- Tauri team for the amazing framework
- React team for the powerful UI library
- ADB for device communication capabilities
