const TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif']
export const ACCEPT = TYPES.join(',')
const MAX_BYTES = 1024 * 1024
const MAX_ENCODED = Math.ceil(MAX_BYTES / 3) * 4
const STORAGE_KEY = 'dsh.sidebar-brand.image'

export async function chooseImage(file: Blob, decode: (url: string) => Promise<void>): Promise<string | null> {
  if (!TYPES.includes(file.type) || file.size === 0 || file.size > MAX_BYTES) return null
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    let binary = ''
    for (let offset = 0; offset < bytes.length; offset += 8192) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192))
    }
    const src = `data:${file.type};base64,${btoa(binary)}`
    await decode(src)
    return src
  } catch {
    return null
  }
}

export function imagePreference(browser: Pick<Window, 'localStorage' | 'addEventListener' | 'removeEventListener'>) {
  const listeners = new Set<() => void>()
  return {
    read() {
      try {
        const src = browser.localStorage.getItem(STORAGE_KEY)
        if (!src || src.length > MAX_ENCODED + 26) return null
        const comma = src.indexOf(',')
        const prefix = src.slice(0, comma)
        if (comma < 0 || !TYPES.some(type => prefix === `data:${type};base64`)) return null
        const body = src.slice(comma + 1)
        return body.length <= MAX_ENCODED && /^[A-Za-z0-9+/]+={0,2}$/u.test(body) ? src : null
      } catch {
        return null
      }
    },
    write(src: string | null) {
      try {
        if (src === null) browser.localStorage.removeItem(STORAGE_KEY)
        else browser.localStorage.setItem(STORAGE_KEY, src)
      } catch {
        return false
      }
      for (const listener of listeners) listener()
      return true
    },
    subscribe(listener: () => void) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY || event.key === null) listener()
      }
      listeners.add(listener)
      browser.addEventListener('storage', onStorage)
      return () => {
        listeners.delete(listener)
        browser.removeEventListener('storage', onStorage)
      }
    },
  }
}
