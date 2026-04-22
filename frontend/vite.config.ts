import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Must match the Flask static URL for the globe folder
  base: '/dashboard/static/globe/',

  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },

  build: {
    // Output goes directly into Flask's static folder — no manual copying needed
    outDir: path.resolve(__dirname, '../app/dashboard/static/globe'),
    emptyOutDir: true,
  },

  // Dev-only: proxy /api calls to Flask so hot-reload works without CORS issues
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
