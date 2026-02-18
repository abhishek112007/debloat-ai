# Python Backend for Debloat AI

This is the Python backend that replaces the Rust/Tauri backend.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up API Key

```bash
# Copy example file
copy .env.example .env

# Edit .env and add your API key
# Get Perplexity: https://www.perplexity.ai/settings/api
# OR OpenAI: https://platform.openai.com/api-keys
```

### 3. Test Backend

```bash
# Test device info
python main.py "{\"command\": \"get_device_info\", \"args\": {}}"

# Test package listing
python main.py "{\"command\": \"list_packages\", \"args\": {\"type\": \"all\"}}"

# Test AI analysis (requires API key)
python main.py "{\"command\": \"analyze_package\", \"args\": {\"packageName\": \"com.facebook.katana\"}}"
```

## 📂 File Structure

```
backend-python/
├── adb_operations.py    # ADB commands (device info, packages, uninstall)
├── ai_advisor.py        # AI analysis with Perplexity/OpenAI
├── backup_manager.py    # Backup/restore functionality
├── main.py              # Entry point (called by Electron)
├── types.py             # Type definitions
├── requirements.txt     # Dependencies
├── .env.example         # Example environment variables
└── README.md            # This file
```

## 🔧 Modules

### `adb_operations.py`
- `get_device_info()` - Get connected device details
- `list_packages(type)` - List installed packages
- `uninstall_package(name)` - Remove a package
- `reinstall_package(name)` - Restore a package

### `ai_advisor.py`
- `analyze_package(name)` - AI safety analysis
- `chat(message, history)` - Chatbot conversation

### `backup_manager.py`
- `create_backup(packages)` - Save package list
- `list_backups()` - Show all backups
- `restore_backup(name)` - Load backup data
- `delete_backup(name)` - Remove backup file

### `main.py`
- Entry point for Electron to call
- Routes commands to appropriate modules
- Returns JSON responses

## 🧪 Testing Individual Modules

```python
# Test ADB (no API key needed)
from adb_operations import ADBOperations

adb = ADBOperations()
device = adb.get_device_info()
print(device)

packages = adb.list_packages('all')
print(f"Found {len(packages)} packages")
```

```python
# Test AI (requires API key in .env)
from ai_advisor import AIAdvisor

advisor = AIAdvisor(provider='perplexity')
result = advisor.analyze_package('com.google.android.gms')
print(result['summary'])
```

```python
# Test Backups
from backup_manager import BackupManager

backup = BackupManager()
result = backup.create_backup(['com.example.app'], {'model': 'Pixel'})
print(result)

backups = backup.list_backups()
print(f"Found {len(backups)} backups")
```

## 🌐 API Providers

### Perplexity AI (Default)
- Faster responses
- Real-time web search
- Good for package research
- Model: `llama-3.1-sonar-large-128k-online`

### OpenAI (Alternative)
- More detailed analysis
- Better reasoning
- No real-time search
- Model: `gpt-4-turbo-preview`

Switch in `.env`:
```bash
AI_PROVIDER=openai  # or perplexity
```

## 🛠️ Requirements

- **Python**: 3.8 or higher
- **ADB**: Android Debug Bridge in PATH
- **API Key**: Perplexity or OpenAI

## 🐛 Common Issues

### "ADB not found"
- Install Android SDK Platform Tools
- Add to PATH: `C:\platform-tools\` (Windows)

### "API key not set"
- Create `.env` file from `.env.example`
- Add valid API key

### "No device connected"
- Enable USB debugging on Android device
- Run `adb devices` to verify connection
- Authorize device when prompted

### "Module not found"
- Run: `pip install -r requirements.txt`

## 📝 Command Format

When called from Electron, commands are sent as JSON:

```json
{
  "command": "list_packages",
  "args": {
    "type": "all"
  }
}
```

Response format:
```json
{
  "success": true,
  "data": [...]
}
```

Or on error:
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔐 Security

- Never commit `.env` file (it's in `.gitignore`)
- API keys are loaded from environment only
- No hardcoded credentials

## 📄 License

Same as main project (MIT)
