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

const BRAND = '@miorin/dsh-sidebar-brand'
const ATLAS = '@miorin/dsh-atlas-visual'
const brandRow = (enabled: boolean) => ({
  entryId: 'include:dsh-sidebar-brand', patchId: 'dsh-sidebar-brand', moduleName: BRAND,
  enabled, fiberPhase: enabled ? 'active' : null,
})

for (const bundleName of [BRAND, ATLAS]) {
  test(`${bundleName}: follows the brand row through disable, re-enable and bundle removal`, async () => {
    const disposers: (() => void)[] = []
    const slots = new Map<string, Record<string, unknown>>()
    const locales = new Map()
    const otherRow = { ...brandRow(true), entryId: 'include:other', patchId: 'other', moduleName: '@miorin/other' }
    let brand: ReturnType<typeof brandRow> | undefined = brandRow(true)
    let listener: (() => void) | undefined
    const ctx = {
      remote: {
        $on(event, callback) {
          assert.equal(event, 'plugin-manager/changed')
          listener = callback
          return () => { listener = undefined }
        },
        pluginManager: {
          listPlugins: async () => ({ ok: true, value: brand ? [otherRow, brand] : [otherRow] }),
          // The bundle stays selected when just the row is disabled. Under Atlas there is no standalone bundle.
          listBundles: async () => ({ ok: true, value: [{ name: bundleName, enabled: brand !== undefined }] }),
        },
      },
      effect: (install) => disposers.push(install()),
      locale: { register(ns, labels) { locales.set(ns, labels); return () => locales.delete(ns) } },
      slots: {
        inject(name, install) { assert.equal(typeof name, 'string'); return install() },
        register(options) { slots.set(options.name, options); return () => slots.delete(options.name) },
      },
    }
    const change = async (row: typeof brand) => {
      brand = row
      assert.ok(listener)
      listener()
      await Promise.resolve()
    }
    const counts = () => [slots.size, styles.size, locales.size]

    assert.deepEqual(plugin.inject, ['slots', 'locale', 'remote', 'remote.pluginManager'])
    plugin.apply(ctx)
    await Promise.resolve()
    assert.deepEqual([...slots.values()], [
      { name: 'sidebar.brand.mark', priority: -10 },
      { name: 'sidebar.brand.name', priority: -10 },
      { name: 'plugins.bundle.config', key: BRAND, locale: 'dsh-sidebar-brand' },
    ])
    assert.equal(Object.keys(locales.get('dsh-sidebar-brand')).length, 8)
    assert.deepEqual(counts(), [3, 1, 1])
    await change(brandRow(false))
    assert.deepEqual(counts(), [0, 0, 0])
    await change(brandRow(true))
    assert.deepEqual(counts(), [3, 1, 1])
    await change(undefined)
    assert.deepEqual(counts(), [0, 0, 0])
    const pending = change(brandRow(true))
    for (const dispose of disposers.reverse()) dispose()
    await pending
    assert.deepEqual(counts(), [0, 0, 0])
    assert.equal(listener, undefined)
  })
}

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
