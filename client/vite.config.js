import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  css: {
    postcss: {
      plugins: [],
    },
    // Optimize CSS processing
    devSourcemap: false,
  },
  build: {
    // Enable minification (esbuild is faster and built-in)
    minify: 'esbuild',
    // Remove console.log in production
    esbuild: {
      drop: ['console', 'debugger'],
      legalComments: 'none',
    },
    // Target modern browsers for better optimization
    target: 'esnext',
    // Optimize chunk splitting - simplified to avoid Vite 6.x bug
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Use function-based chunking instead of object to avoid percentage calculation bug
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor'
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'redux-vendor'
            }
            if (id.includes('react-icons') || id.includes('framer-motion')) {
              return 'ui-vendor'
            }
            if (id.includes('axios') || id.includes('react-hot-toast')) {
              return 'utils-vendor'
            }
            // Other vendor chunks
            return 'vendor'
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'axios',
    ],
  },
})
