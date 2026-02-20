import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173
    },
    // Set base path to relative for GitHub Pages compatibility if needed
    base: './',
    build: {
        chunkSizeWarningLimit: 2000
    }
})
