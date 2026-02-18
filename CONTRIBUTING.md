# Contributing to Debloat AI

Thank you for your interest in contributing to Debloat AI! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

---

## 🤝 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Prioritize user safety and data privacy

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Any conduct harmful to the community

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **Python** 3.14+ installed (3.10+ should work)
- **Git** for version control
- **ADB** installed and in PATH
- **Android device** with USB debugging enabled (for testing)

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/debloat-ai.git
   cd debloat-ai
   ```
3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/abhishek112007/debloat-ai.git
   ```

---

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
# Install Node.js dependencies (Electron + Frontend)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install Python dependencies
cd backend-python
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
cd ..
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# .env
PERPLEXITY_API_KEY=your_api_key_here
```

> **Get API Key**: https://www.perplexity.ai/settings/api

### 3. Run in Development Mode

**Option A: Run All Together**
```bash
npm run dev
# This starts Vite (frontend) + Electron
# You need to manually start backend
```

**Option B: Run Separately** (Recommended for debugging)

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend
cd backend-python
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/macOS
python main.py

# Terminal 3: Electron
npm run electron:dev
```

---

## 📁 Project Structure

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

**Key Directories:**
- `frontend/src/components/` - React UI components
- `frontend/src/hooks/` - Custom React hooks
- `frontend/src/utils/` - Helper functions
- `backend-python/` - Python backend (IPC communication)
- `electron/` - Electron main process

---

## 🔧 Making Changes

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 2. Make Your Changes

- Follow the coding standards (see below)
- Keep changes focused and atomic
- Test your changes thoroughly
- Update documentation if needed

### 3. Test Locally

```bash
# Test frontend
cd frontend
npm run build

# Test backend
cd backend-python
python test_backend.py

# Test full build
npm run build
```

---

## 📝 Commit Guidelines

We follow **Conventional Commits** for clear and consistent commit history.

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process, dependencies, or tooling

### Examples

```bash
# Good commits
git commit -m "feat: add voice input to chatbot"
git commit -m "fix: device detection on Linux"
git commit -m "docs: update installation guide for macOS"
git commit -m "refactor: extract ADB logic into separate module"

# Bad commits (avoid these)
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "WIP"
```

### Scope (Optional)

Specify what part of the codebase changed:
- `frontend:`, `backend:`, `electron:`
- `ui:`, `api:`, `build:`

**Example:**
```bash
git commit -m "fix(backend): handle ADB connection timeout"
```

---

## 🔄 Pull Request Process

### 1. Update Your Branch

Before submitting, sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

### 2. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

1. Go to GitHub and click **"New Pull Request"**
2. Select your branch
3. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How did you test this?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Tested locally
- [ ] Documentation updated
- [ ] No new warnings/errors
```

### 4. Review Process

- Maintainers will review your PR
- Address feedback and make requested changes
- Once approved, your PR will be merged

---

## 💻 Coding Standards

### TypeScript/React (Frontend)

```typescript
// Use functional components with hooks
const MyComponent: React.FC = () => {
  const [state, setState] = useState<number>(0);
  
  return <div>{state}</div>;
};

// Use descriptive variable names
const isDeviceConnected = true;  // ✅ Good
const flag = true;                // ❌ Bad

// Extract complex logic into custom hooks
const { devices, loading, error } = useDeviceMonitor();

// Use TypeScript types
interface Package {
  name: string;
  path: string;
  isSystem: boolean;
}
```

### Python (Backend)

```python
# Use type hints
def get_packages(device_id: str) -> list[dict]:
    """Get all installed packages from device."""
    pass

# Use Pydantic models for validation
class PackageRequest(BaseModel):
    package_name: str
    create_backup: bool = True

# Follow PEP 8 style guide
# - 4 spaces for indentation
# - snake_case for functions/variables
# - PascalCase for classes
```

### General Guidelines

- **Comments**: Write clear, concise comments for complex logic
- **Documentation**: Update README/docs when adding features
- **Error Handling**: Handle errors gracefully, show user-friendly messages
- **Performance**: Avoid unnecessary re-renders, optimize loops
- **Security**: Never commit API keys or sensitive data

---

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Device detection works
- [ ] Package listing loads correctly
- [ ] Search and filters work
- [ ] Uninstall function works
- [ ] Restore function works
- [ ] AI advisor works (if modified)
- [ ] Chatbot works (if modified)
- [ ] Backup creation works
- [ ] Theme switching works
- [ ] No console errors
- [ ] Tested on Windows/Linux/macOS (if possible)

### Automated Tests

```bash
# Backend tests
cd backend-python
python test_backend.py

# Frontend tests (if available)
cd frontend
npm test
```

---

## 🐛 Reporting Bugs

### Before Reporting

1. Search existing issues
2. Update to latest version
3. Reproduce the bug

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [Windows 11]
- App Version: [1.0.0]
- Device: [Samsung Galaxy S21]

**Additional context**
Any other information
```

---

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check if feature already requested
2. Explain the use case
3. Describe expected behavior
4. Provide examples if possible

---

## 📖 Documentation

When adding features:

- Update `README.md` if user-facing
- Update `ARCHITECTURE.md` if changing structure
- Add code comments for complex logic
- Update `CHANGELOG.md` with changes

---

## ❓ Questions?

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and discussions
- **Email**: Contact maintainers directly

---

## 🏆 Recognition

Contributors will be:
- Listed in README contributors section
- Mentioned in release notes
- Acknowledged in CHANGELOG

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Debloat AI!** 🎉

Your help makes this project better for everyone.
