import { defineConfig } from 'vite'
import { DEV_PORTS } from './scripts/ports.mjs'

export default defineConfig({
  server: {
    port: DEV_PORTS.site,
    strictPort: true,
    proxy: Object.fromEntries(['lab', 'builder', 'arena'].map((app) => [`/${app}`, { target: `http://localhost:${DEV_PORTS[app]}`, ws: true }])),
  },
})