import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'fs'
import { execFileSync } from 'child_process'

/**
 * Dev-server only: lets the visual editor (public/editor.html) save a view's walk_area straight into
 * scenarios/<id>/scenario.json, keeping the file's canonical format (indent 2, [x, y] pairs on one line),
 * then refreshes the arrival spots into that view and returns the validator's findings for it.
 */
function editorSave(): Plugin {
  const root = path.resolve(__dirname, '..')
  return {
    name: 'editor-save',
    configureServer(server) {
      server.middlewares.use('/__editor/walk-area', (req, res) => {
        const reply = (code: number, body: unknown) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)) }
        if (req.method !== 'POST') return reply(405, { error: 'POST only' })
        let raw = ''
        req.on('data', (c) => { raw += c })
        req.on('end', () => {
          try {
            const { scenario, view, walk_area } = JSON.parse(raw)
            if (!/^[a-z0-9-]+$/.test(scenario) || typeof view !== 'string') return reply(400, { error: 'bad scenario or view id' })
            const pts = (r: unknown) => Array.isArray(r) && r.every((p) => Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === 'number' && isFinite(n)))
            if (!walk_area || !pts(walk_area.floor) || (walk_area.blocked && !(Array.isArray(walk_area.blocked) && walk_area.blocked.every(pts))))
              return reply(400, { error: 'walk_area needs a floor of [x, y] points' })
            const file = path.join(root, 'scenarios', scenario, 'scenario.json')
            const s = JSON.parse(fs.readFileSync(file, 'utf8'))
            const v = s.views.find((x: { id: string }) => x.id === view)
            if (!v) return reply(404, { error: `no view ${view}` })
            const keep = v.walk_area || {}
            v.walk_area = { ...keep, floor: walk_area.floor }
            if (walk_area.blocked?.length) v.walk_area.blocked = walk_area.blocked; else delete v.walk_area.blocked
            if (walk_area.depth_scale) v.walk_area.depth_scale = walk_area.depth_scale; else delete v.walk_area.depth_scale
            const out = JSON.stringify(s, null, 2).replace(/\[\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*\]/g, '[$1, $2]') + '\n'
            fs.writeFileSync(file, out)
            const run = (args: string[]) => { try { return execFileSync('node', args, { cwd: root, encoding: 'utf8' }) } catch (e) { return String((e as { stdout?: string }).stdout ?? e) } }
            const arrivals = run(['tools/arrival-spots.mjs', file, '--into', view, '--write', '--overwrite'])
            const report = run(['tools/validate-scenario.mjs', file])
            const findings = report.split('\n').filter((l) => /^(ERROR|WARN)/.test(l) && l.includes(view))
            reply(200, { ok: true, walk_area: v.walk_area, arrivals: (arrivals.match(/(\d+) arrival spot/) || [])[1] ?? '0', findings })
          } catch (e) {
            reply(500, { error: String(e) })
          }
        })
      })
    },
  }
}

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
  plugins: [react(), serveScenarios(), editorSave()],
  server: {
    port: 5173,
  },
})
