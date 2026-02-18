# Creating Your First Release

This guide walks you through creating your first production release of Debloat AI.

## Prerequisites

- All changes committed and pushed to GitHub
- GitHub Actions enabled in your repository
- Version number decided (e.g., 1.0.0)

## Steps

### 1. Update Version Numbers

Ensure version consistency across all files:

```json
// package.json
"version": "1.0.0"

// tauri.conf.json
"version": "1.0.0"

// Cargo.toml (optional, auto-synced by Tauri)
version = "1.0.0"
```

### 2. Update CHANGELOG.md

Document what's new in this release:

```markdown
## [1.0.0] - YYYY-MM-DD

### Added
- List new features

### Changed
- List changes

### Fixed
- List bug fixes
```

### 3. Commit Changes

```bash
git add .
git commit -m "chore: release v1.0.0"
git push origin main
```

### 4. Create and Push Tag

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0"

# Push tag to GitHub
git push origin v1.0.0
```

### 5. GitHub Actions Builds

Once you push the tag, GitHub Actions will automatically:
1. Build for Windows, Linux, and macOS
2. Create installers for each platform
3. Create a draft release
4. Upload all installers to the release

**This takes about 15-30 minutes** depending on GitHub Actions queue.

### 6. Monitor Build Progress

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Find the "Release" workflow run
4. Watch the progress for each platform

### 7. Publish the Release

Once all builds complete:

1. Go to "Releases" in your repository
2. Find the draft release created by the action
3. Review the release notes (auto-generated)
4. Edit if needed
5. Click "Publish release"

## Release Artifacts

Your release should include:

### Windows
- `Debloat-AI_1.0.0_x64_en-US.msi` - MSI installer
- `Debloat-AI_1.0.0_x64-setup.exe` - NSIS installer (if configured)

### Linux
- `debloat-ai_1.0.0_amd64.AppImage` - Universal AppImage
- `debloat-ai_1.0.0_amd64.deb` - Debian package

### macOS
- `Debloat-AI_aarch64.dmg` - Apple Silicon (M1/M2/M3)
- `Debloat-AI_x64.dmg` - Intel Macs

## Testing the Release

### Before Publishing

1. **Download installers** from the draft release
2. **Test on clean machines** (or VMs):
   - Windows 10/11
   - Ubuntu/Debian (for .deb)
   - macOS (if accessible)
3. **Verify**:
   - Installation completes without errors
   - App launches successfully
   - ADB device detection works
   - Basic functionality (list packages, search, filter)
   - AI features work (if API key configured)

### Quick Test Script

```bash
# Windows (PowerShell)
# 1. Install the .msi
# 2. Run from Start Menu
# 3. Connect Android device
# 4. Verify packages load

# Linux
chmod +x Debloat-AI_*.AppImage
./Debloat-AI_*.AppImage
# Connect device and verify

# Or with .deb
sudo dpkg -i debloat-ai_*.deb
debloat-ai
# Connect device and verify
```

## Troubleshooting Build Failures

### Windows Build Fails

**Issue**: Missing dependencies or build errors

**Solutions**:
1. Check Rust compilation errors in logs
2. Verify `tauri.conf.json` icon paths are correct
3. Ensure all Windows-specific configurations are valid

### Linux Build Fails

**Issue**: Missing system dependencies

**Solutions**:
1. GitHub Actions should install dependencies automatically
2. Check if `.github/workflows/release.yml` has all required packages
3. Common missing packages: `libwebkit2gtk-4.0-dev`, `librsvg2-dev`

### macOS Build Fails

**Issue**: Code signing or architecture issues

**Solutions**:
1. Verify both architectures are properly targeted
2. Check if universal binary is needed
3. macOS builds require macOS runners (handled automatically)

### All Builds Fail

**Issue**: Configuration errors

**Solutions**:
1. Check `tauri.conf.json` for JSON syntax errors
2. Verify `beforeBuildCommand` works locally
3. Test local build: `npm run build:release`
4. Check GitHub Actions logs for specific errors

## Local Testing Before Release

Before creating a tag, test the build locally:

```bash
# Full production build
npm run build:release

# Check artifacts
ls -lh backend/tauri/target/release/bundle/

# Test the installer
# Windows: Run the .msi
# Linux: Run the AppImage
# macOS: Open the .dmg
```

## Best Practices

1. **Test Locally First**: Always run `npm run build:release` before tagging
2. **Semantic Versioning**: Follow semver (MAJOR.MINOR.PATCH)
3. **Changelog**: Keep CHANGELOG.md updated
4. **Draft Releases**: Use draft releases to test before going public
5. **Pre-releases**: Use `-beta` or `-rc` tags for testing (e.g., `v1.0.0-beta.1`)
6. **Backup**: Keep previous release artifacts in case rollback is needed

## Release Checklist

Before tagging a release:

- [ ] All features tested locally
- [ ] Version numbers updated in package.json and tauri.conf.json
- [ ] CHANGELOG.md updated
- [ ] README.md reflects latest changes
- [ ] Local production build succeeds (`npm run build:release`)
- [ ] All tests pass
- [ ] Documentation is up to date
- [ ] No sensitive data (API keys) in repository

After release is published:

- [ ] Test installers on clean systems
- [ ] Update download links if needed
- [ ] Announce release (if applicable)
- [ ] Monitor for issues

## Updating an Existing Release

If you need to update a release after publishing:

```bash
# Delete the tag locally
git tag -d v1.0.0

# Delete the tag remotely
git push origin :refs/tags/v1.0.0

# Delete the GitHub release (via web UI)

# Make your fixes
git add .
git commit -m "fix: critical bug"

# Create tag again
git tag -a v1.0.0 -m "Release v1.0.0 (updated)"
git push origin v1.0.0
```

**Note**: Only do this for critical bugs. For normal updates, increment the version instead.

## Next Release

For subsequent releases:

1. Increment version appropriately (patch/minor/major)
2. Update CHANGELOG.md
3. Repeat the release process
4. GitHub Actions handles everything automatically

---

## Quick Reference

```bash
# Standard release flow
npm run build:release        # Test locally
git add . && git commit      # Commit changes
git tag -a v1.0.0 -m "msg"  # Create tag
git push origin v1.0.0       # Trigger build
# Wait for GitHub Actions
# Publish draft release
```
