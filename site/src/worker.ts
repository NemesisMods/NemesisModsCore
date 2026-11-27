import { relocate, route, type Origins } from './router'

interface Fetcher {
  fetch(input: Request | string, init?: RequestInit): Promise<Response>
}

interface Env {
  ASSETS: Fetcher
  LAB: Fetcher
  BUILDER: Fetcher
  ARENA: Fetcher
}

// placeholders: a service binding picks the Worker, not the hostname
const ORIGINS: Origins = { lab: 'https://lab.internal', builder: 'https://builder.internal', arena: 'https://arena.internal' }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const r = route(url, ORIGINS)
    if (r.kind === 'redirect') return Response.redirect(new URL(r.to, url).toString(), r.status)
    if (r.kind === 'shell') return env.ASSETS.fetch(request)
    const tools = { lab: env.LAB, builder: env.BUILDER, arena: env.ARENA }
    const upstream = await tools[r.app].fetch(r.to, { method: request.method, headers: request.headers, body: request.body, redirect: 'manual' })
    const location = upstream.headers.get('Location')
    if (!location) return upstream
    const res = new Response(upstream.body, upstream)
    res.headers.set('Location', relocate(location, r.app, ORIGINS[r.app]))
    return res
  },
}