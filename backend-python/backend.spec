# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec – builds backend-python into a single-folder dist.
Run from repo root:
    .venv\\Scripts\\pyinstaller.exe backend-python\\backend.spec
"""

import os

block_cipher = None
src = os.path.abspath(os.path.join(os.path.dirname(SPECPATH), 'backend-python'))
icons_dir = os.path.abspath(os.path.join(os.path.dirname(SPECPATH), 'icons'))

a = Analysis(
    [os.path.join(src, 'main.py')],
    pathex=[src],
    binaries=[],
    datas=[
        # .env.example is now in the project root, not bundled with backend
    ],
    hiddenimports=[
        'requests',
        'dotenv',
        'json',
        'subprocess',
        'shutil',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter', 'unittest', 'test', 'pip', 'setuptools'],
    noarchive=False,
    cipher=block_cipher,
)

# Remove api-ms-win-* Universal CRT forwarder DLLs – already on Win10+
# These cause NSIS installer issues due to long filenames
a.binaries = [b for b in a.binaries if not b[0].lower().startswith('api-ms-win-')]

pyz = PYZ(a.pure, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,          # Required for stdin/stdout IPC with Electron
    icon=os.path.join(icons_dir, 'icon.ico') if os.path.exists(os.path.join(icons_dir, 'icon.ico')) else None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='backend',
)
