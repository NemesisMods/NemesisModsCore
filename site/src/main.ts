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

function show() {
  const id = TABS.some((t) => `#${t.id}` === location.hash) ? location.hash.slice(1) : TABS[0].id
  TABS.forEach((t, i) => links[i].setAttribute('aria-selected', String(t.id === id)))
  if (!frames.has(id)) {
    const f = document.createElement('iframe')
    f.src = `/${id}/`
    f.title = TABS.find((t) => t.id === id)!.label
    panes.append(f)
    frames.set(id, f)
  }
  for (const [k, f] of frames) f.hidden = k !== id
  document.title = `${TABS.find((t) => t.id === id)!.label} · NemesisMods`
}

addEventListener('hashchange', show)
show()