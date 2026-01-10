import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from 'vite-plugin-web-extension';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: './src/manifest.json',
      additionalInputs: ['src/pages/popup.html'],
      disableAutoLaunch: true,
    }),
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
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/pages/popup.html'),
      },
    },
  },
});
