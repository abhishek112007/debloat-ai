# Changelog

All notable changes to Debloat AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-18

### Changed
- Updated documentation to accurately reflect IPC-based architecture
- Corrected README.md tech stack (removed FastAPI references)
- Updated ARCHITECTURE.md with stdin/stdout communication details
- Fixed technology badges and acknowledgments

### Documentation
- Comprehensive README update with accurate backend description
- ARCHITECTURE.md now correctly describes IPC commands
- Removed outdated FastAPI/REST API references
- Added detailed IPC command documentation

## [1.0.0] - 2026-02-01

### Added
- Initial production release
- GitHub Actions workflow for automated cross-platform builds
- Pre-built installers for Windows (.msi), Linux (.AppImage, .deb), and macOS (.dmg)
- Production build optimizations for smaller bundle size
- Comprehensive installation documentation (INSTALL.md)
- Build scripts for local release builds

### Changed
- Optimized Vite configuration with code splitting and chunking
- Optimized Python backend compilation with PyInstaller
- Updated product branding from "Android ADB Manager" to "Debloat AI"
- Simplified README with Quick Install section
- Updated installer configuration for better user experience

### Technical Details
- Bundle size optimizations: Python backend compiled with PyInstaller
- Frontend chunking: Separate vendor chunks for better caching
- Windows installer: NSIS configuration for current user install
- Version bumped to 1.0.0 across all configuration files

## [Unreleased]

### Planned Features
- Wireless ADB support
- Multi-language support
- Device-specific bloatware profiles
- Auto-update functionality
- More pre-classified bloatware packages

---

## Release Notes Template

Use this template for future releases:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security updates
```
