import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: true, // allow network access
    port: 5173,
    // Allow ngrok forwarded hostnames to access Vite in dev.
    allowedHosts: ['.ngrok-free.dev'],
  },

})
