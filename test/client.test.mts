import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as React from 'react'
import { chooseImage, imagePreference } from '../src/client/image.ts'

let registration
const styles = new Set()
globalThis.document = {
  createElement: () => ({ remove() { styles.delete(this) } }),
  head: { append(style) { styles.add(style) } },
}
globalThis.window = { __ModuleLoader__: { load(entry) { registration = entry } } }
await import('../client.js')
assert.equal(registration.id, '@miorin/dsh-sidebar-brand')
const plugin = registration.factory((name) => {
  assert.equal(name, 'react')
  return React
})

test('shadows only the brand slots, follows Host enable state, and cleans up on unload', async () => {
  const disposers: (() => void)[] = []
  const slots = new Map<string, Record<string, unknown>>()
  const locales = new Map()
  let enabled = true
  let listener: (() => void) | undefined
  const ctx = {
    remote: {
      $on(event, callback) {
        assert.equal(event, 'plugin-manager/changed')
        listener = callback
        return () => { listener = undefined }
      },
      pluginManager: { listBundles: async () => ({ ok: true, value: [{
        name: '@miorin/dsh-sidebar-brand', enabled, rows: [{
          rowId: 'dsh-sidebar-brand', moduleName: '@miorin/dsh-sidebar-brand', enabled,
        }],
      }] }) },
    },
    effect: (install) => disposers.push(install()),
    locale: { register(ns, labels) { locales.set(ns, labels); return () => locales.delete(ns) } },
    slots: {
      inject(name, install) { assert.equal(typeof name, 'string'); return install() },
      register(options) { slots.set(options.name, options); return () => slots.delete(options.name) },
    },
  }
  assert.deepEqual(plugin.inject, ['slots', 'locale', 'remote', 'remote.pluginManager'])
  plugin.apply(ctx)
  assert.equal(Object.keys(locales.get('dsh-sidebar-brand')).length, 8)
  assert.deepEqual([...slots.values()], [
    { name: 'sidebar.brand.mark', priority: -10 },
    { name: 'sidebar.brand.name', priority: -10 },
    { name: 'plugins.bundle.config', key: '@miorin/dsh-sidebar-brand', locale: 'dsh-sidebar-brand' },
  ])
  assert.equal(styles.size, 1)
  enabled = false
  listener?.()
  await Promise.resolve()
  assert.deepEqual([slots.size, styles.size, locales.size], [0, 0, 0])
  enabled = true
  listener?.()
  await Promise.resolve()
  assert.deepEqual([slots.size, styles.size, locales.size], [3, 1, 1])
  listener?.()
  for (const dispose of disposers.reverse()) dispose()
  await Promise.resolve()
  assert.deepEqual([slots.size, styles.size, locales.size], [0, 0, 0])
  assert.equal(listener, undefined)
})

test('validates type, size and browser decoding before replacing an existing image', async () => {
  const svg = new Blob(['<svg/>'], { type: 'image/svg+xml' })
  assert.equal(await chooseImage(svg, async (src) => {
    assert.equal(src, 'data:image/svg+xml;base64,PHN2Zy8+')
  }), 'data:image/svg+xml;base64,PHN2Zy8+')
  assert.equal(await chooseImage(svg, async () => { throw new Error('decode failed') }), null)
  for (const file of [new Blob(['<svg/>'], { type: 'text/html' }), new Blob([], { type: 'image/png' }),
    new Blob([new Uint8Array(1024 * 1024 + 1)], { type: 'image/png' })]) {
    let decoded = false
    assert.equal(await chooseImage(file, async () => { decoded = true }), null)
    assert.equal(decoded, false)
  }
})

test('persists, observes and clears the local choice while rejecting corrupt storage', () => {
  const storage = new Map<string, string>()
  const bus = new EventTarget()
  let blocked = false
  const browser = Object.assign(bus, { localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem(key, value) { if (blocked) throw new Error('quota'); storage.set(key, value) },
    removeItem: (key) => storage.delete(key),
  } }) as unknown as Window
  const preference = imagePreference(browser)
  let updates = 0
  const unsubscribe = preference.subscribe(() => { updates++ })
  const image = 'data:image/png;base64,YQ=='
  assert.equal(preference.read(), null)
  assert.equal(preference.write(image), true)
  assert.equal(imagePreference(browser).read(), image)
  blocked = true
  assert.equal(preference.write('data:image/gif;base64,Yg=='), false)
  assert.equal(preference.read(), image)
  assert.equal(preference.write(null), true)
  assert.equal(updates, 2)
  unsubscribe()
  storage.set('dsh.sidebar-brand.image', 'https://example.test/image.png')
  assert.equal(preference.read(), null)
  assert.equal(updates, 2)
})
