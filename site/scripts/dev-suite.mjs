import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { DEV_PORTS } from './ports.mjs'

const here = import.meta.dirname
const dirs = {
  lab: process.env.LAB_DIR ?? resolve(here, '../../../../ImperfectLab'),
  builder: process.env.BUILDER_DIR ?? resolve(here, '../../../LabBuilder'),
  arena: process.env.ARENA_DIR ?? resolve(here, '../../../ArenaLab'),
}
const run = (cwd, args, env = {}) => spawn('npx', ['vite', ...args], { cwd, stdio: 'inherit', env: { ...process.env, ...env } })
const kids = Object.entries(dirs).map(([app, cwd]) => run(cwd, ['--port', String(DEV_PORTS[app]), '--strictPort'], { SUITE_BASE: `/${app}/` }))
kids.push(run(resolve(here, '..'), []))
const stop = () => { for (const k of kids) k.kill(); process.exit() }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)