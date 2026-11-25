export const APPS = ['lab', 'builder', 'arena'] as const
export type App = (typeof APPS)[number]
export type Origins = Record<App, string>

export type Route =
  | { kind: 'redirect'; to: string; status: 308 }
  | { kind: 'proxy'; app: App; to: string }
  | { kind: 'shell' }

export function route(url: URL, origins: Origins): Route {
  for (const app of APPS) {
    if (url.pathname === `/${app}`) return { kind: 'redirect', to: `/${app}/${url.search}`, status: 308 }
    if (url.pathname.startsWith(`/${app}/`)) return { kind: 'proxy', app, to: origins[app] + url.pathname.slice(app.length + 1) + url.search }
  }
  return { kind: 'shell' }
}

// an app's own redirect, back under its path
export function relocate(location: string, app: App, origin: string): string {
  if (location.startsWith(origin)) return `/${app}${location.slice(origin.length) || '/'}`
  return location.startsWith('/') ? `/${app}${location}` : location
}