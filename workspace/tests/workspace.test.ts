import { describe, expect, it } from 'vitest'
import { type Entry, forgetHandle, getHandle, getList, newId, SCHEMA_VERSION, setHandle, setList, subscribe, WorkspaceError } from '../src/index'

const entry = (name: string): Entry => ({ id: newId(), name, source: `${name}.imperfect`, bytes: Uint8Array.of(1, 2, 3) })

describe('workspace', () => {
  it('keeps lists, empty until set', async () => {
    expect(await getList('arenas')).toEqual([])
    const list = [entry('a'), entry('b')]
    await setList('lab-characters', list)
    expect(await getList('lab-characters')).toEqual(list)
    expect(await getList('builder-characters')).toEqual([])
  })

  it('keeps and forgets linked things', async () => {
    expect(await getHandle('recomp-port')).toBeNull()
    await setHandle('gamecube-disc', { kind: 'file', name: 'disc.iso' })
    expect(await getHandle('gamecube-disc')).toEqual({ kind: 'file', name: 'disc.iso' })
    await forgetHandle('gamecube-disc')
    expect(await getHandle('gamecube-disc')).toBeNull()
  })

  it('tells other listeners which key changed', async () => {
    const seen: string[] = []
    const stopArenas = subscribe('arenas', () => seen.push('arenas'))
    const stopLab = subscribe('lab-characters', () => seen.push('lab'))
    await setList('arenas', [entry('x')])
    await new Promise((r) => setTimeout(r, 20))
    stopArenas(); stopLab()
    expect(seen).toEqual(['arenas'])
  })

  it('says to reload when another tool saved a newer workspace', async () => {
    const newer = indexedDB.open('nemesismods', SCHEMA_VERSION + 1)
    await new Promise((r) => { newer.onsuccess = r })
    newer.result.close()
    await expect(getList('arenas')).rejects.toBeInstanceOf(WorkspaceError)
  })
})