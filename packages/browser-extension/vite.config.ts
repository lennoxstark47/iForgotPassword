import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import path from 'path';
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import { build as viteBuild } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to copy manifest and build content script separately
    {
      name: 'build-extension',
      async writeBundle() {
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

        // Build content script separately with all dependencies inlined
        console.log('Building content script separately...');
        await viteBuild({
          configFile: false,
          build: {
            outDir: path.resolve(__dirname, 'dist'),
            emptyOutDir: false,
            lib: {
              entry: path.resolve(__dirname, 'src/content.ts'),
              name: 'ContentScript',
              formats: ['iife'],
              fileName: () => 'src/content.js',
            },
            rollupOptions: {
              output: {
                entryFileNames: 'src/content.js',
                inlineDynamicImports: true,
              },
            },
          },
          resolve: {
            alias: {
              '@': path.resolve(__dirname, './src'),
              '@shared/types': path.resolve(__dirname, '../shared/types/src'),
              '@shared/crypto': path.resolve(__dirname, '../shared/crypto/src'),
              '@shared/constants': path.resolve(__dirname, '../shared/constants/src'),
              '@shared/validators': path.resolve(__dirname, '../shared/validators/src'),
            },
          },
        });
        console.log('Content script built successfully!');
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
        // content is built separately in the plugin above
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
        // Prevent code splitting - inline all dependencies into their entry files
        inlineDynamicImports: false,
        manualChunks(id) {
          // Don't create any shared chunks - keep dependencies with their entries
          // This prevents webextension-polyfill from being extracted
          return undefined;
        },
      },
      // Ensure each entry is self-contained
      preserveEntrySignatures: 'strict',
    },
  },
});
