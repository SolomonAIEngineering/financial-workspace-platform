import { defineConfig } from 'vite'
import path from 'path';
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@observablehq/plot'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Ensure external packages that are CJS are processed properly
      output: {
        manualChunks: {
          'observable-plot': ['@observablehq/plot'],
        },
      },
    },
  },
})
