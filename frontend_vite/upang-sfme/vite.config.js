import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google.com https://www.gstatic.com https://*.googleapis.com https://*.ggpht.com",
  "font-src 'self' data:",
  "connect-src 'self' ws://127.0.0.1:5173 http://127.0.0.1:5173 http://localhost:8000 http://127.0.0.1:8000 https://www.google.com https://www.gstatic.com",
  "frame-src 'self' https://www.google.com https://www.gstatic.com https://www.google.com/recaptcha/ https://www.google.com/maps/",
  "worker-src 'self' blob:",
  "form-action 'self'",
].join('; ')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    headers: {
      'Content-Security-Policy': cspDirectives,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
    },
    // Allow ngrok forwarded hostnames to access Vite in dev.
    allowedHosts: ['.ngrok-free.dev'],
  },

})
