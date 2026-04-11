import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Tailwind v4 emits custom at-rules that LightningCSS warns about.
    cssMinify: 'esbuild',
    // Current app bundle is intentionally large during refactor phase.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('react-router')) {
            return 'vendor-router'
          }

          if (id.includes('lucide-react')) {
            return 'vendor-icons'
          }

          if (
            /node_modules\/(react|react-dom|scheduler)\//.test(id)
          ) {
            return 'vendor-react'
          }

          if (
            id.includes('recharts') ||
            id.includes('d3-')
          ) {
            return 'vendor-charts'
          }

          if (
            id.includes('@radix-ui') ||
            id.includes('cmdk') ||
            id.includes('vaul') ||
            id.includes('sonner')
          ) {
            return 'vendor-ui'
          }

          if (
            id.includes('date-fns') ||
            id.includes('axios') ||
            id.includes('zustand')
          ) {
            return 'vendor-utils'
          }

          return undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
