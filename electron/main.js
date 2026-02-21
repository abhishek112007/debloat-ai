const { app, BrowserWindow, ipcMain, Menu, session } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let pythonProcess;
let pythonReady = false;
let requestId = 0;
const pendingRequests = new Map();
let stdoutBuffer = '';

// ── Python path ──────────────────────────────────────────────────────
function getPythonPath() {
  if (process.env.NODE_ENV === 'development') {
    const venvPath = path.join(__dirname, '../.venv/Scripts/python.exe');
    if (fs.existsSync(venvPath)) return venvPath;
    return 'python';
  }
  // Production – bundled PyInstaller exe
  const exeName = process.platform === 'win32' ? 'backend.exe' : 'backend';
  return path.join(process.resourcesPath, 'backend', exeName);
}

function getBackendScript() {
  // In dev we pass the .py script; in production the exe IS the entry point
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '../backend-python/main.py');
  }
  return null; // exe needs no extra script arg
}

// ── Persistent Python process ────────────────────────────────────────
function startPythonProcess() {
  const pythonPath = getPythonPath();
  const script = getBackendScript();
  const spawnArgs = script ? [script] : [];

  // In production, copy .env next to the backend exe if user placed it in app dir
  const envSrc = path.join(app.getPath('userData'), '.env');
  const envDst = path.join(path.dirname(pythonPath), '.env');
  if (!fs.existsSync(envDst) && fs.existsSync(envSrc)) {
    fs.copyFileSync(envSrc, envDst);
  }

  console.log('[Electron] Starting backend:', pythonPath, spawnArgs.join(' '));

  pythonProcess = spawn(pythonPath, spawnArgs, {
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
    cwd: path.dirname(pythonPath)    // so dotenv finds .env next to exe
  });

  // Accumulate stdout and resolve matching requests
  pythonProcess.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk.toString();
    const lines = stdoutBuffer.split('\n');
    stdoutBuffer = lines.pop(); // keep incomplete tail

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);

        // First message is the "ready" signal
        if (msg.status === 'ready') {
          pythonReady = true;
          console.log('[Python] Backend ready');
          continue;
        }

        const cb = pendingRequests.get(msg.id);
        if (cb) {
          pendingRequests.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error));
          else cb.resolve(msg.result);
        }
      } catch (e) {
        console.error('[Python] Bad JSON:', line);
      }
    }
  });

  pythonProcess.stderr.on('data', (d) => {
    console.error('[Python stderr]', d.toString());
  });

  pythonProcess.on('close', (code) => {
    console.log('[Python] Exited with code', code);
    pythonReady = false;
    // Reject any outstanding requests
    for (const [, cb] of pendingRequests) {
      cb.reject(new Error('Python process exited'));
    }
    pendingRequests.clear();
  });

  pythonProcess.on('error', (err) => {
    console.error('[Python] Spawn error:', err);
  });
}

// Send a command and get back a promise
function callPython(command, args = {}) {
  return new Promise((resolve, reject) => {
    // Wait up to 15 seconds for backend to become ready
    const waitForReady = (elapsed = 0) => {
      if (pythonProcess && pythonReady) {
        const id = ++requestId;
        pendingRequests.set(id, { resolve, reject });
        const payload = JSON.stringify({ id, command, args }) + '\n';
        pythonProcess.stdin.write(payload);
      } else if (elapsed >= 15000) {
        reject(new Error('Python backend not ready after 15s'));
      } else {
        setTimeout(() => waitForReady(elapsed + 200), 200);
      }
    };
    waitForReady();
  });
}

// ── Window ───────────────────────────────────────────────────────────
function createWindow() {
  // Remove default Electron menu bar
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../icons/icon.ico'),
    backgroundColor: '#1a1a1a',
    show: false,
    title: 'Debloat AI'
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── App lifecycle ────────────────────────────────────────────────────
app.whenReady().then(() => {
  // Grant microphone permission for voice input in chatbot
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'microphone', 'clipboard-read', 'clipboard-sanitized-write'];
    callback(allowed.includes(permission));
  });

  startPythonProcess();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.stdin.end();
    pythonProcess.kill();
  }
});

// ── IPC Handlers ─────────────────────────────────────────────────────

ipcMain.handle('get-device-info', async () => {
  return await callPython('get_device_info');
});

ipcMain.handle('list-packages', async (_event, packageType) => {
  return await callPython('list_packages', { type: packageType || 'all' });
});

ipcMain.handle('uninstall-package', async (_event, packageName) => {
  return await callPython('uninstall_package', { packageName });
});

ipcMain.handle('reinstall-package', async (_event, packageName) => {
  return await callPython('reinstall_package', { packageName });
});

ipcMain.handle('analyze-package', async (_event, packageName, provider) => {
  return await callPython('analyze_package', { packageName, provider: provider || 'perplexity' });
});

ipcMain.handle('chat-message', async (_event, message, history) => {
  return await callPython('chat_message', { message, history: history || [] });
});

// OpenClaw Integration
ipcMain.handle('parse-chat-command', async (_event, message) => {
  return await callPython('parse_chat_command', { message });
});

ipcMain.handle('execute-action', async (_event, executionResult, confirmed) => {
  return await callPython('execute_action', { executionResult, confirmed });
});

ipcMain.handle('create-backup', async (_event, packages, deviceInfo) => {
  return await callPython('create_backup', { packages, deviceInfo });
});

ipcMain.handle('list-backups', async () => {
  return await callPython('list_backups');
});

ipcMain.handle('restore-backup', async (_event, backupName) => {
  return await callPython('restore_backup', { backupName });
});

ipcMain.handle('delete-backup', async (_event, backupName) => {
  return await callPython('delete_backup', { backupName });
});

ipcMain.handle('get-backup-path', async () => {
  return await callPython('get_backup_path');
});
