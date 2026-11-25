import { relocate, route } from './router'

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  LAB_ORIGIN: string
  BUILDER_ORIGIN: string
  ARENA_ORIGIN: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origins = { lab: env.LAB_ORIGIN, builder: env.BUILDER_ORIGIN, arena: env.ARENA_ORIGIN }
    const r = route(url, origins)
    if (r.kind === 'redirect') return Response.redirect(new URL(r.to, url).toString(), r.status)
    if (r.kind === 'shell') return env.ASSETS.fetch(request)
    const upstream = await fetch(r.to, { method: request.method, headers: request.headers, body: request.body, redirect: 'manual' })
    const location = upstream.headers.get('Location')
    if (!location) return upstream
    const res = new Response(upstream.body, upstream)
    res.headers.set('Location', relocate(location, r.app, origins[r.app]))
    return res
  },
}