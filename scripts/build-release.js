const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Debloat AI for Production...\n');

// Clean previous builds
console.log('📦 Cleaning previous builds...');
try {
    if (fs.existsSync('frontend/dist')) {
        fs.rmSync('frontend/dist', { recursive: true, force: true });
        console.log('✓ Cleaned frontend/dist');
    }
    if (fs.existsSync('target/release')) {
        fs.rmSync('target/release', { recursive: true, force: true });
        console.log('✓ Cleaned target/release');
    }
} catch (error) {
    console.error('⚠️  Warning: Could not clean all directories:', error.message);
}

console.log('\n📦 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✓ Dependencies installed');
} catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
}

console.log('\n🔨 Building frontend...');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✓ Frontend built successfully');
} catch (error) {
    console.error('❌ Frontend build failed');
    process.exit(1);
}

console.log('\n🦀 Building Tauri app (this may take a while)...');
try {
    execSync('npm run tauri:build', { stdio: 'inherit' });
    console.log('✓ Tauri app built successfully');
} catch (error) {
    console.error('❌ Tauri build failed');
    process.exit(1);
}

console.log('\n✨ Build completed successfully!\n');

// Display build artifacts
console.log('📦 Build Artifacts:\n');
const bundlePath = path.join('backend', 'tauri', 'target', 'release', 'bundle');

if (fs.existsSync(bundlePath)) {
    const platforms = fs.readdirSync(bundlePath);
    platforms.forEach(platform => {
        const platformPath = path.join(bundlePath, platform);
        if (fs.statSync(platformPath).isDirectory()) {
            console.log(`\n${platform.toUpperCase()}:`);
            const files = fs.readdirSync(platformPath, { recursive: true });
            files.forEach(file => {
                const filePath = path.join(platformPath, file);
                if (fs.statSync(filePath).isFile()) {
                    const stats = fs.statSync(filePath);
                    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                    console.log(`  - ${file} (${sizeMB} MB)`);
                }
            });
        }
    });
} else {
    console.log('⚠️  Bundle directory not found');
}

console.log('\n🎉 Production build ready!');
console.log('\nNext steps:');
console.log('1. Test the installer in backend/tauri/target/release/bundle/');
console.log('2. Create a GitHub release and upload the installers');
console.log('3. Tag your release with a version (e.g., git tag v1.0.0)');
