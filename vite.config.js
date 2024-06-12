// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        demo2: 'demo2.html'
      }
    },
    outDir: 'dist', // specify output directory
    assetsDir: 'assets', // specify assets directory
  },
  base: './', // set base path for the application
});