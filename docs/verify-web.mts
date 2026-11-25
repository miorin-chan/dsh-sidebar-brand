import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { byLabel, bySel, byText, open } from '../../../tools/dsh-web-drive/lib/page.mts'

const url = process.env.SIDEBAR_BRAND_TEST_URL
assert.ok(url, 'Set SIDEBAR_BRAND_TEST_URL to the disposable Web profile URL')
const mode = process.argv[2] ?? 'standalone'
assert.ok(mode === 'standalone' || mode === 'atlas', 'Expected standalone or atlas')
const bundle = mode === 'atlas' ? 'dsh-atlas-visual' : 'dsh-sidebar-brand'
const title = mode === 'atlas' ? 'Visual Modular Improvement Plan' : 'Sidebar brand'
const page = await open(url, { viewport: { width: 1440, height: 900 } })
const toggle = '[data-sidebar-toggle]'
const expanded = '[data-slot="sidebar.brand.name"]'
const mark = '[data-slot="sidebar.brand.mark"]'
const input = '[data-dsh-brand-settings] input[type=file]'
const detail = `[data-plugin-detail="@miorin/${bundle}"]`
const brandSwitch = `${detail} [role=switch][aria-label="Enable component Sidebar brand"]`
const bundleSwitch = `${detail} [role=switch][aria-label="Enable ${title}"]`
const visible = (selector: string) => `Boolean(document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect().height)`
const imageReady = (selector: string) => `(() => {
  const image = document.querySelector(${JSON.stringify(selector)})
  return image?.complete && image.naturalWidth > 0 && image.getBoundingClientRect().height > 0
})()`
const click = async (finder: string) => {
  await page.waitFor(`(() => {
    const el = ${finder}
    if (!el) return false
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    const r = el.getBoundingClientRect()
    return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
  })()`)
  assert.equal(typeof await page.click(finder), 'object', finder)
}
const collapse = async () => {
  await click(bySel(toggle))
  await page.session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 380, y: 60 })
  await page.waitFor(`document.querySelector('${toggle}').getAttribute('aria-label') === 'Open sidebar' && !document.querySelector('${expanded}')`)
}
const expand = async (keyboard = false) => {
  if (keyboard) {
    await page.eval(`document.querySelector('${toggle}').focus()`)
    await page.key('Enter')
  } else await click(bySel(toggle))
  await page.waitFor(`document.querySelector('${expanded}') !== null && !document.querySelector('[data-animating="true"]')`)
}
const selectFixture = async (file: string) => {
  const doc = await page.session.send('DOM.getDocument')
  const result = await page.session.send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector: input })
  assert.ok(result.result.nodeId, 'native file input is present')
  const picked = await page.session.send('DOM.setFileInputFiles', {
    nodeId: result.result.nodeId, files: [fileURLToPath(new URL(file, import.meta.url))],
  })
  assert.equal(picked.error, undefined)
}

try {
  await page.waitFor(visible(toggle))
  const preview = byText('Continue', '[role="dialog"] button')
  if (await page.waitFor(`Boolean(${preview})`, 5000).catch(() => false)) await click(preview)
  await page.waitFor(`!document.querySelector('[role="dialog"][aria-modal="true"]')`)
  if (await page.eval(`document.querySelector('${toggle}').getAttribute('aria-label') === 'Open sidebar'`)) await expand()
  await page.waitFor(`document.querySelector('[data-dsh-brand-name="hidden"]') !== null`)
  assert.equal(await page.eval(`document.querySelector('${toggle}').parentElement.getBoundingClientRect().height`), 28)
  assert.equal(await page.eval(`document.querySelector('${expanded}').closest('button').getClientRects().length`), 0)
  assert.ok(await page.center(byLabel('New session')))
  await collapse()
  assert.ok(await page.eval(visible(`${toggle} > svg`)), 'the original expand glyph stays visible without a brand')
  assert.ok(await page.eval(`document.querySelector('${toggle} [data-dsh-brand-mark="hidden"]') !== null`))
  await expand()
  console.log('PASS no image: expanded brand removed and row compact, collapsed toggle visible and clickable')

  const pluginsButton = byLabel('Plugins', 'button[aria-label="Plugins"]')
  await click(pluginsButton)
  await page.waitFor(`(${byLabel(`View ${title}`)}) !== null`)
  await click(byLabel(`View ${title}`))
  await page.waitFor(visible(input))
  if (mode === 'standalone') {
    await page.waitFor(`/Choose a local image below/.test(document.querySelector('[data-plugin-detail] [data-detail-document]')?.innerText ?? '')`)
  }
  await selectFixture('./fixtures/brand.svg')
  await page.waitFor(imageReady('img[data-dsh-brand-name]'))
  assert.deepEqual(await page.eval(`(() => { const rect = document.querySelector('img[data-dsh-brand-name]').getBoundingClientRect(); return [rect.width, rect.height] })()`), [108, 24])
  assert.equal(await page.eval(visible('img[data-dsh-brand-mark]')), false)
  await selectFixture('./fixtures/undecodable.svg')
  await page.waitFor(visible('[data-dsh-brand-settings] [role=alert]'))
  assert.ok(await page.eval(imageReady('img[data-dsh-brand-name]')), 'bad selection preserves the existing image')
  await collapse()
  await page.waitFor(imageReady(`${toggle} img[data-dsh-brand-mark]`))
  assert.equal(await page.eval(`document.querySelector('${toggle} img').getBoundingClientRect().width`), 24)
  assert.equal(await page.eval(visible(`${toggle} > svg`)), false, 'the image occupies the resting rail toggle')
  await page.hover(bySel(toggle))
  await page.waitFor(visible(`${toggle} > svg`))
  await expand(true)
  console.log('PASS file selection: wide image replaces logo and text, rail fits same image and retains hover affordance, invalid image preserves choice')

  await click(bySel(brandSwitch))
  await page.waitFor(`document.querySelector('${brandSwitch}')?.getAttribute('aria-checked') === 'false' && !document.querySelector('[data-dsh-brand-name]')`)
  assert.equal(await page.eval(`document.querySelector('${bundleSwitch}')?.getAttribute('aria-checked')`), 'true')
  await page.waitFor(visible(`${expanded} > *`))
  assert.ok(await page.eval(visible(`${mark} svg`)), 'original expanded mark returns')
  await collapse()
  await page.waitFor(visible(`${toggle} ${mark} svg`))
  assert.equal(await page.eval(visible(`${toggle} > svg`)), false, 'original rail rest behavior returns')
  await expand()
  console.log('PASS disable: native expanded mark and name, collapsed mark and hover behavior restored')

  await click(bySel(brandSwitch))
  await page.waitFor(imageReady('img[data-dsh-brand-name]'))
  await click(byText('Remove image'))
  await page.waitFor(`document.querySelector('[data-dsh-brand-name="hidden"]') !== null`)
  await collapse()
  await page.waitFor(visible(`${toggle} > svg`))
  await expand()
  console.log('PASS re-enable restores saved image and clearing returns to hide mode')
  assert.deepEqual(page.errors(), { consoleErrors: [], exceptions: [], logErrors: [] })
} catch (error) {
  console.error('Page diagnostics', await page.eval(`({ title: document.title, toggle: document.querySelector('[data-sidebar-toggle]')?.getAttribute('aria-label'), brand: document.querySelector('[data-dsh-brand-name]')?.getAttribute('data-dsh-brand-name'), dialog: document.querySelector('[role=dialog]')?.textContent.slice(0, 160), text: document.body.innerText.slice(0, 600) })`), page.errors())
  throw error
} finally {
  await page.close()
}
