import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // VITE_* variables in .env are automatically exposed to the client via import.meta.env
  // Set VITE_API_URL in .env (local) or in your hosting platform (production)
  envPrefix: 'VITE_',
})
