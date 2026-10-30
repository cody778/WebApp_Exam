import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { pathApi } from './server/path-api.js'

export default defineConfig({
  plugins: [pathApi(), tailwindcss(), reactRouter()],
  resolve: { tsconfigPaths: true },
})
