# Installation Guide

## Quick Install (Recommended)

### Windows

1. **Download the Installer**
   - Go to [Releases](https://github.com/abhishek112007/debloat-ai/releases/latest)
   - Download `Debloat-AI_x.x.x_x64_en-US.msi`

2. **Run the Installer**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - Click "Install" (no admin rights needed for current user install)

3. **Launch the Application**
   - Find "Debloat AI" in your Start Menu
   - Or search for "Debloat AI" in Windows search

### Linux

#### Option 1: AppImage (Universal)

1. **Download AppImage**
   ```bash
   # Download from releases page
   wget https://github.com/abhishek112007/debloat-ai/releases/latest/download/Debloat-AI_x.x.x_amd64.AppImage
   ```

2. **Make it Executable**
   ```bash
   chmod +x Debloat-AI_x.x.x_amd64.AppImage
   ```

3. **Run the Application**
   ```bash
   ./Debloat-AI_x.x.x_amd64.AppImage
   ```

#### Option 2: Debian Package (.deb)

1. **Download and Install**
   ```bash
   # Download
   wget https://github.com/abhishek112007/debloat-ai/releases/latest/download/debloat-ai_x.x.x_amd64.deb
   
   # Install
   sudo dpkg -i debloat-ai_x.x.x_amd64.deb
   
   # Fix dependencies if needed
   sudo apt-get install -f
   ```

2. **Run from Applications Menu**
   - Find "Debloat AI" in your applications menu
   - Or run from terminal: `debloat-ai`

### macOS

1. **Download DMG File**
   - Go to [Releases](https://github.com/abhishek112007/debloat-ai/releases/latest)
   - Download the `.dmg` file for your architecture:
     - Apple Silicon (M1/M2/M3): `Debloat-AI_aarch64.dmg`
     - Intel: `Debloat-AI_x64.dmg`

2. **Install the Application**
   - Open the downloaded `.dmg` file
   - Drag "Debloat AI" to your Applications folder
   - Eject the DMG

3. **First Launch**
   - Go to Applications folder
   - Right-click on "Debloat AI"
   - Select "Open" (needed first time for unsigned apps)
   - Click "Open" in the security dialog

---

## Requirements

### ADB (Android Debug Bridge)

You **MUST** install ADB for Debloat AI to work.

#### Windows

1. **Download Platform Tools**
   - Visit: https://developer.android.com/tools/releases/platform-tools
   - Download ZIP file for Windows

2. **Extract and Add to PATH**
   ```powershell
   # Extract to C:\platform-tools
   # Add to PATH:
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\platform-tools", "User")
   ```

3. **Verify Installation**
   ```powershell
   adb --version
   ```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install android-tools-adb
adb --version
```

#### macOS

```bash
# Using Homebrew
brew install android-platform-tools
adb --version
```

---

## Android Device Setup

1. **Enable Developer Options**
   - Go to `Settings` → `About Phone`
   - Tap **Build Number** 7 times rapidly
   - You'll see "You are now a developer!"

2. **Enable USB Debugging**
   - Go to `Settings` → `System` → `Developer Options`
   - Turn on **USB Debugging**
   - (Optional) Turn on **USB debugging (Security settings)** for system apps

3. **Connect Your Device**
   - Use a good quality USB cable (data transfer capable)
   - Connect your Android device to your computer
   - On your phone, tap **Allow** when prompted to authorize USB debugging
   - Check "Always allow from this computer" (optional)

4. **Verify Connection**
   - Open terminal/command prompt
   - Run: `adb devices`
   - You should see your device listed

---

## First Time Setup

1. **Launch Debloat AI**
   - The app will automatically detect your connected Android device

2. **Configure AI Features (Optional)**
   - Click the Settings icon
   - Enter your Perplexity API key if you have one
   - Get a free API key: https://www.perplexity.ai/settings/api

3. **Create Your First Backup**
   - Click "Backup" tab
   - Create a backup before removing any packages
   - This allows you to restore if needed

---

## Verification

### Test Device Connection

1. Launch Debloat AI
2. Connect your Android device via USB
3. You should see:
   - Device name and model in the top panel
   - Green "Connected" status indicator
   - List of installed packages

### Test Package Listing

1. Packages should load automatically
2. Use the search box to filter packages
3. Try different safety level filters (Safe, Caution, Expert)

### Test AI Features (if configured)

1. Click the ⚡ icon next to any package
2. Wait for AI analysis to load
3. Review the safety recommendations

---

## Troubleshooting

### Device Not Detected

| Issue | Solution |
|-------|----------|
| No device shown | - Check USB cable (try a different one)<br>- Verify USB debugging is enabled<br>- Tap "Allow" on phone's authorization prompt |
| ADB not found | - Verify ADB is installed: `adb --version`<br>- Check ADB is in system PATH<br>- Restart terminal/computer after installing ADB |
| Unauthorized device | - Disconnect device<br>- Revoke USB debugging authorizations on phone<br>- Reconnect and authorize again |
| Windows driver issues | - Install device-specific USB drivers from manufacturer<br>- Try a different USB port (prefer USB 2.0) |

### Application Issues

| Issue | Solution |
|-------|----------|
| App won't launch | - Check system requirements<br>- Reinstall the application<br>- Check antivirus isn't blocking it |
| Packages won't load | - Ensure device is connected<br>- Try restarting the app<br>- Check ADB connection: `adb devices` |
| AI features not working | - Verify API key is entered correctly<br>- Check internet connection<br>- API key may have usage limits |

### Build from Source (Advanced)

If you prefer to build from source or the pre-built installers don't work:

```bash
# Prerequisites: Node.js 16+, Rust stable, ADB
git clone https://github.com/abhishek112007/debloat-ai.git
cd debloat-ai
npm install
npm run build:release
```

See the main [README.md](README.md) for detailed development setup.

---

## Getting Help

- **Issues**: https://github.com/abhishek112007/debloat-ai/issues
- **Discussions**: https://github.com/abhishek112007/debloat-ai/discussions
- **Documentation**: See [README.md](README.md) for full documentation

---

## System Requirements

### Minimum Requirements

- **Windows**: Windows 10 version 1809 or later
- **Linux**: Any modern distribution with GTK 3.24+
- **macOS**: macOS 10.15 (Catalina) or later
- **RAM**: 512 MB
- **Disk Space**: 100 MB
- **Internet**: Required for AI features only

### Recommended

- USB 2.0 or higher port
- 1 GB RAM
- Stable USB cable for Android connection
