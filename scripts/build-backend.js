/**
 * Build script – bundles the Python backend with PyInstaller
 * and copies ADB platform-tools into build-output/.
 *
 * Run:  node scripts/build-backend.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build-output');
const VENV_BIN = path.join(ROOT, '.venv', 'Scripts');
const PYINSTALLER = path.join(VENV_BIN, 'pyinstaller.exe');
const ADB_SRC = 'C:\\platform-tools';

// ── Helpers ──────────────────────────────────────────────────────────
function run(cmd, opts = {}) {
  console.log(`  > ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dst) {
  ensureDir(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────
console.log('\n=== Building Python backend ===\n');

// 1. Clean previous build-output
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}
ensureDir(BUILD_DIR);

// 2. Run PyInstaller
if (!fs.existsSync(PYINSTALLER)) {
  console.error('PyInstaller not found in .venv. Run: .venv\\Scripts\\pip install pyinstaller');
  process.exit(1);
}

run(`"${PYINSTALLER}" backend-python/backend.spec --distpath "${BUILD_DIR}" --workpath "${path.join(BUILD_DIR, '_work')}" --noconfirm`);

// Verify output
const backendExe = path.join(BUILD_DIR, 'backend', 'backend.exe');
if (!fs.existsSync(backendExe)) {
  console.error('ERROR: backend.exe not found after PyInstaller build');
  process.exit(1);
}
const sizeMB = (fs.statSync(backendExe).size / 1024 / 1024).toFixed(1);
console.log(`\n  backend.exe built (${sizeMB} MB)`);

// 3. Copy .env.example next to backend.exe
const envExample = path.join(ROOT, 'backend-python', '.env.example');
if (fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, path.join(BUILD_DIR, 'backend', '.env.example'));
  console.log('  .env.example copied');
}

// 4. Copy ADB platform-tools
console.log('\n=== Bundling ADB platform-tools ===\n');
const adbDst = path.join(BUILD_DIR, 'platform-tools');
if (fs.existsSync(ADB_SRC)) {
  // Only copy the essential files (adb.exe + DLLs)
  ensureDir(adbDst);
  const essentials = ['adb.exe', 'AdbWinApi.dll', 'AdbWinUsbApi.dll'];
  let copied = 0;
  for (const f of essentials) {
    const src = path.join(ADB_SRC, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(adbDst, f));
      copied++;
    }
  }
  console.log(`  Copied ${copied} ADB files`);
} else {
  console.warn(`  WARNING: ADB not found at ${ADB_SRC} – users must install ADB separately`);
  ensureDir(adbDst);
}

// 5. Clean PyInstaller work dir
const workDir = path.join(BUILD_DIR, '_work');
if (fs.existsSync(workDir)) {
  fs.rmSync(workDir, { recursive: true, force: true });
}

console.log('\n=== Backend build complete ===\n');
console.log(`Output: ${BUILD_DIR}`);
console.log(`  backend/    → PyInstaller bundle`);
console.log(`  platform-tools/ → ADB binaries`);
