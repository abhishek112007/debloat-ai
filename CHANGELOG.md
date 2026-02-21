# Changelog

All notable changes to Debloat AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2026-02-21

### Fixed
- Chatbot input box not clickable — removed heavy framer-motion animations blocking input
- Chatbot not responsive — now fills available space and adapts to window size
- Reduced animation overhead — replaced per-message spring animations with lightweight fades
- Typing indicator now uses pure CSS animations instead of framer-motion
- Added responsive breakpoints for small windows and short screens
- Input area now always visible with `flex-shrink: 0`

---

## [2.0.0] - 2026-02-21

### Added — OpenClaw: Natural Language Command Engine
- **OpenClaw integration** — control your device using plain English commands
- Natural language parser with intent recognition (uninstall, scan, backup, restore, analyze)
- Entity extraction for package names and app identifiers
- Smart bloatware detection with AI-powered safety validation
- Action Mode toggle — switch between advisor-only and full-control modes
- Multi-layer safety: confidence scoring, risk warnings, explicit confirmation for all destructive actions
- AI-powered package analysis via Perplexity API (Sonar model)
- Streaming chat responses with real-time typing indicator
- Chat history persistence in localStorage

### Added — UI/UX Improvements
- Glassmorphism chat interface with Framer Motion animations
- Light/dark theme support with custom theme engine
- Improved device detection with auto-retry (6 retries, 2s intervals)
- Better error messages with ADB troubleshooting guidance
- Refined refresh button with force-refresh capability
- Copy message button with animated feedback

### Changed
- Complete README overhaul — professional layout with OpenClaw as headline feature
- Project restructured — secondary docs moved to `docs/` folder
- Removed unused components (ChatBotModern, ShimmerButton)
- Fixed conflicting CSS/Framer Motion animations on chat messages
- Updated CI/CD workflow for Electron builds (replaced Tauri references)
- Version bumped to 2.0.0 for major feature release

### Technical
- OpenClaw command parser (`backend-python/openclaw_integration.py`)
- IPC commands: `parse_chat_command`, `execute_action`
- Perplexity AI integration with dotenv configuration
- Python backend: persistent process with JSON stdin/stdout protocol

---

## [1.1.0] - 2026-02-18

### Changed
- Updated documentation to reflect IPC-based architecture
- Corrected README tech stack (removed FastAPI references)
- Updated ARCHITECTURE.md with stdin/stdout communication details

## [1.0.0] - 2026-02-01

### Added
- Initial production release
- Cross-platform installers (Windows, Linux, macOS)
- ADB device management and package listing
- Backup and restore functionality
- AI package advisor
- GitHub Actions CI/CD pipeline
