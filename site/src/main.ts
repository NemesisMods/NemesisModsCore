const TABS = [
  { id: 'lab', label: 'ImperfectLab' },
  { id: 'arena', label: 'Arena Lab' },
  { id: 'builder', label: 'Lab Builder' },
]

const nav = document.querySelector<HTMLElement>('.tabs')!
const panes = document.querySelector<HTMLElement>('.panes')!
const frames = new Map<string, HTMLIFrameElement>()

const links = TABS.map((t) => {
  const a = document.createElement('a')
  a.href = `#${t.id}`
  a.textContent = t.label
  a.setAttribute('role', 'tab')
  nav.append(a)
  return a
})

// keep iframe invisible until load to avoid white flash
function ensureFrame(id: string, hidden: boolean): HTMLIFrameElement {
  const existing = frames.get(id)
  if (existing) return existing
  const f = document.createElement('iframe')
  f.src = `/${id}/`
  f.title = TABS.find((t) => t.id === id)!.label
  f.hidden = hidden
  f.classList.add('loading')
  f.addEventListener('load', () => f.classList.remove('loading'), { once: true })
  panes.append(f)
  frames.set(id, f)
  return f
}

function show() {
  const id = TABS.some((t) => `#${t.id}` === location.hash) ? location.hash.slice(1) : TABS[0].id
  TABS.forEach((t, i) => links[i].setAttribute('aria-selected', String(t.id === id)))
  ensureFrame(id, false)
  for (const [k, f] of frames) f.hidden = k !== id
  document.title = `${TABS.find((t) => t.id === id)!.label} · NemesisMods`
}

addEventListener('hashchange', show)
show()

// tool preload
const [first] = frames.values()
first.addEventListener('load', () => {
  for (const t of TABS) ensureFrame(t.id, true)
}, { once: true })
