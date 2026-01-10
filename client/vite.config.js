import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Using PostCSS instead of @tailwindcss/vite plugin to avoid Rust panic
// The @tailwindcss/vite plugin causes percentage.rs:30:16 panic
// Tailwind CSS v3 uses PostCSS which is more stable and doesn't trigger the bug
export default defineConfig({
  plugins: [
    react(),
    // Removed @tailwindcss/vite plugin - using PostCSS instead
    // Vite automatically detects postcss.config.js in the root directory
  ],
  build: {
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: false,
  },
})
