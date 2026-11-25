import { describe, expect, it } from 'vitest'
import { relocate, route } from '../src/router'

const O = { lab: 'https://lab.pages.dev', builder: 'https://builder.pages.dev', arena: 'https://arena.pages.dev' }
const at = (u: string) => route(new URL(u), O)

describe('router', () => {
  it('sends each app path to its own project', () => {
    expect(at('https://nemesismods.com/lab/')).toEqual({ kind: 'proxy', app: 'lab', to: 'https://lab.pages.dev/' })
    expect(at('https://nemesismods.com/builder/assets/x.js?v=1')).toEqual({ kind: 'proxy', app: 'builder', to: 'https://builder.pages.dev/assets/x.js?v=1' })
    expect(at('https://nemesismods.com/arena/')).toMatchObject({ kind: 'proxy', app: 'arena' })
  })

  it('adds the slash relative asset paths need', () => {
    expect(at('https://nemesismods.com/lab?x=1')).toEqual({ kind: 'redirect', to: '/lab/?x=1', status: 308 })
  })

  it('serves the shell for everything else', () => {
    expect(at('https://nemesismods.com/')).toEqual({ kind: 'shell' })
    expect(at('https://nemesismods.com/labs/')).toEqual({ kind: 'shell' })
  })


  it('keeps an app\'s own redirects under its path', () => {
    expect(relocate('https://lab.pages.dev/index', 'lab', O.lab)).toBe('/lab/index')
    expect(relocate('https://lab.pages.dev', 'lab', O.lab)).toBe('/lab/')
    expect(relocate('/x', 'arena', O.arena)).toBe('/arena/x')
    expect(relocate('https://elsewhere.example/', 'lab', O.lab)).toBe('https://elsewhere.example/')
  })
})