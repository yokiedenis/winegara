import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import 'dotenv/config';  // ESM-compatible dotenv import

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL, // Backend server URL
        changeOrigin: true,
        secure: false,
      },
    },
  }
});