// All tools share this IndexedDB database.

export const SCHEMA_VERSION = 1
const DB = 'nemesismods'
const LISTS = 'lists'
const HANDLES = 'handles'
const CHANNEL = 'nemesismods-workspace'

export type ListKey = 'lab-characters' | 'builder-characters' | 'arenas'
export type HandleKey = 'gamecube-disc' | 'recomp-port'
export type Key = ListKey | HandleKey

// .imperfect or .imperfectarena files
export interface Entry {
  id: string
  name: string
  source: string
  bytes: Uint8Array
}

export class WorkspaceError extends Error {}

let opening: Promise<IDBDatabase> | null = null

function open(): Promise<IDBDatabase> {
  opening ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, SCHEMA_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(LISTS)) db.createObjectStore(LISTS)
      if (!db.objectStoreNames.contains(HANDLES)) db.createObjectStore(HANDLES)
    }
    req.onsuccess = () => {
      req.result.onversionchange = () => { req.result.close(); opening = null }
      resolve(req.result)
    }
    req.onerror = () => {
      opening = null
      reject(req.error?.name === 'VersionError' ? new WorkspaceError('another NemesisMods tool saved a newer workspace: reload this page to update it') : req.error)
    }
  })
  return opening
}

async function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(store, mode).objectStore(store))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function announce(key: Key) {
  if (typeof BroadcastChannel === 'undefined') return
  const ch = new BroadcastChannel(CHANNEL)
  ch.postMessage({ key })
  ch.close()
}

export async function getList(key: ListKey): Promise<Entry[]> {
  return (await run<Entry[] | undefined>(LISTS, 'readonly', (s) => s.get(key))) ?? []
}

export async function setList(key: ListKey, entries: Entry[]): Promise<void> {
  await run(LISTS, 'readwrite', (s) => s.put(entries, key))
  announce(key)
}

export async function getHandle<T = FileSystemHandle>(key: HandleKey): Promise<T | null> {
  return (await run<T | undefined>(HANDLES, 'readonly', (s) => s.get(key))) ?? null
}

export async function setHandle(key: HandleKey, value: unknown): Promise<void> {
  await run(HANDLES, 'readwrite', (s) => s.put(value, key))
  announce(key)
}

export async function forgetHandle(key: HandleKey): Promise<void> {
  await run(HANDLES, 'readwrite', (s) => s.delete(key))
  announce(key)
}

// called after another tab (or this one, through another channel object) changes the key
export function subscribe(key: Key, cb: () => void): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => {}
  const ch = new BroadcastChannel(CHANNEL)
  ch.onmessage = (e: MessageEvent<{ key: Key }>) => { if (e.data?.key === key) cb() }
  return () => ch.close()
}

type Permissioned = FileSystemHandle & {
  queryPermission(o: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
  requestPermission(o: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
}

export async function permission(handle: FileSystemHandle, mode: 'read' | 'readwrite', ask: boolean): Promise<PermissionState> {
  const h = handle as Permissioned
  const now = await h.queryPermission({ mode })
  return now === 'granted' || !ask ? now : h.requestPermission({ mode })
}

export function newId(): string {
  return crypto.randomUUID()
}