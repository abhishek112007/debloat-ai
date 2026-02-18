import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Use relative paths so Electron loadFile works correctly
  base: './',

  // Prevent vite from obscuring errors
  clearScreen: false,

  // Electron expects Vite on port 5173
  server: {
    port: 5173,
    strictPort: true,
  },

  // Environment variables
  envPrefix: ['VITE_'],

  build: {
    // Modern browser target for Electron
    target: 'esnext',
    // Minify for production
    minify: 'esbuild',
    // Produce sourcemaps
    sourcemap: true,
    
    // Production optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion'],
        },
      },
    },
    
    // Warn about large chunks
    chunkSizeWarningLimit: 1000,
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Optimize asset handling
    assetsInlineLimit: 4096, // 4kb
  },
});
