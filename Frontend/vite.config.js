import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/register-admin': 'http://localhost:5000',
      '/register': 'http://localhost:5000',
      '/login': 'http://localhost:5000',
      '/questions': 'http://localhost:5000',
      '/submit-code': 'http://localhost:5000',
      '/generate-review': 'http://localhost:5000',
      // Add other API endpoints as needed
    }
  }
})
