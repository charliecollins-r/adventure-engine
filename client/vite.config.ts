import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'fs'

function serveScenarios(): Plugin {
  const scenariosDir = path.resolve(__dirname, '../scenarios')
  return {
    name: 'serve-scenarios',
    configureServer(server) {
      server.middlewares.use('/scenarios', (req, res, next) => {
        const filePath = path.join(scenariosDir, decodeURIComponent(req.url || ''))
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          const ext = path.extname(filePath).toLowerCase()
          const types: Record<string, string> = {
            '.json': 'application/json',
            '.webp': 'image/webp',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
          }
          if (types[ext]) res.setHeader('Content-Type', types[ext])
          fs.createReadStream(filePath).pipe(res)
        } else {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), serveScenarios()],
  server: {
    port: 5173,
  },
})
