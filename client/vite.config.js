import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Minimal config to avoid Vite 6.x Rust panic bug in percentage.rs
// This removes all custom output configurations that trigger the bug
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: false,
    // Remove all rollupOptions to avoid Rust panic
  },
})
