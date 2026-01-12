import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import path from 'path';
// @ts-ignore
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to copy manifest and handle multi-entry builds
    {
      name: 'build-extension',
      writeBundle() {
        // Copy manifest to dist
        const manifest = fs.readFileSync(path.resolve(__dirname, 'src/manifest.json'), 'utf-8');
        fs.writeFileSync(path.resolve(__dirname, 'dist/manifest.json'), manifest);

        // Copy assets folder if it exists
        const assetsDir = path.resolve(__dirname, 'src/assets');
        const distAssetsDir = path.resolve(__dirname, 'dist/assets');
        if (fs.existsSync(assetsDir)) {
          fs.mkdirSync(distAssetsDir, { recursive: true });
          const files = fs.readdirSync(assetsDir);
          files.forEach(file => {
            fs.copyFileSync(
              path.join(assetsDir, file),
              path.join(distAssetsDir, file)
            );
          });
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared/types': path.resolve(__dirname, '../shared/types/src'),
      '@shared/crypto': path.resolve(__dirname, '../shared/crypto/src'),
      '@shared/constants': path.resolve(__dirname, '../shared/constants/src'),
      '@shared/validators': path.resolve(__dirname, '../shared/validators/src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/pages/popup.html'),
        background: path.resolve(__dirname, 'src/background.ts'),
        content: path.resolve(__dirname, 'src/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Put background and content in src/ folder to match manifest
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
            return 'src/[name].js';
          }
          return '[name].js';
        },
        chunkFileNames: 'src/[name]-[hash].js',
        // Inline everything for background and content to avoid module imports
        inlineDynamicImports: false,
        manualChunks: (id) => {
          // Keep background and content scripts separate and inline their dependencies
          if (id.includes('background.ts')) return 'background';
          if (id.includes('content.ts')) return 'content';
          // Put shared dependencies in src/ folder for background/content
          if (id.includes('webextension-polyfill')) return 'src/webextension-polyfill';
          return undefined;
        },
      },
    },
  },
});
