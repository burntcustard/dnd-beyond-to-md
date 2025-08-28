import tailwind from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: './',
  plugins: [tailwind()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
