import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type { BundleInfo } from '@deepseek-ai/dsh-plugin-manager/types'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { createElement as h, useRef, useState, useSyncExternalStore } from 'react'
import { LABELS, NS } from './labels.js'
import { ACCEPT, chooseImage, imagePreference } from './image.js'

const MARK = 'sidebar.brand.mark'
const NAME = 'sidebar.brand.name'
const SETTINGS = 'plugins.bundle.config'
const PRIORITY = -10 // Single slots use the lowest priority. The shipped occupants use 0.

// @deepseek-ai/dsh-client-ui-sidebar 0.2.2-rc.5, src/client/SidebarRoot.tsx and
// SidebarRoot.module.css: the host owns the brand button, drag row, and rail toggle.
// Scope layout to our own slot markers and semantic host attributes (no generated class names).
const STYLES = `
  [data-dsh-brand-mark], [data-dsh-brand-name='hidden'] { display: none; }
  [data-sidebar-toggle] [data-dsh-brand-mark='image'] { display: block; }
  button[data-sidebar-toggle]:has([data-dsh-brand-mark='hidden']) > svg[data-icon='dsw-icon-panel-left-outline-regular'] {
    display: block;
  }
  span[aria-hidden='true']:has(> span [data-dsh-brand-name='image']) { inline-size: 100%; }
  span[aria-hidden='true']:has(> span [data-dsh-brand-name='image']) > span:has([data-dsh-brand-mark]) { display: none; }
  [data-dsh-brand-name='image'] { display: block; max-inline-size: 100%; }
  :is(button, span):has(> span[aria-hidden='true'] [data-dsh-brand-name='hidden']) { display: none; }
  [data-window-drag]:has(> :is(button, span) > span[aria-hidden='true'] [data-dsh-brand-name='hidden']):not(:has([data-sidebar-toggle])) {
    display: none;
  }
  [data-window-drag]:has(> :is(button, span) > span[aria-hidden='true'] [data-dsh-brand-name='hidden']):has([data-sidebar-toggle]) {
    height: 28px;
    padding-block: 0;
  }
`

type Preference = ReturnType<typeof imagePreference>

function ImageSettings({ preference, t }: { preference: Preference } & PropsLocale<typeof NS>) {
  const image = useSyncExternalStore(preference.subscribe, preference.read)
  const picker = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<'invalid' | 'saveError' | null>(null)
  return h('section', { 'data-dsh-brand-settings': '', style: { display: 'grid', justifyItems: 'start', gap: 8 } },
    h('label', null, t('image'), ' ', h('input', {
      ref: picker, type: 'file', accept: ACCEPT, disabled: busy,
      style: { maxInlineSize: '100%', color: 'inherit', font: 'inherit' },
      onChange: async (event) => {
        const file = event.currentTarget.files?.[0]
        event.currentTarget.value = ''
        if (!file) return
        setBusy(true)
        setError(null)
        try {
          const selected = await chooseImage(file, async (src) => {
            const candidate = new Image()
            candidate.src = src
            await candidate.decode()
          })
          setError(selected === null ? 'invalid' : preference.write(selected) ? null : 'saveError')
        } finally {
          setBusy(false)
        }
      },
    })),
    h('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, t('hint')),
    image && h('div', { style: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' } },
      h('img', { src: image, alt: t('image'), style: { height: 24, maxWidth: 'min(160px, 100%)', objectFit: 'contain' } }),
      h('button', {
        type: 'button', disabled: busy,
        style: { font: 'inherit', color: 'inherit' },
        onClick: () => {
          if (!preference.write(null)) { setError('saveError'); return }
          setError(null)
          picker.current?.focus()
        },
      }, t('clear')),
    ),
    error && h('span', { role: 'alert' }, t(error)),
  )
}

const BUNDLE = `@miorin/${NS}`

function* installPresentation(ctx: Context, preference: Preference) {
  yield ctx.locale.register(NS, LABELS)
  const sheet = document.createElement('style')
  sheet.textContent = STYLES
  document.head.append(sheet)
  yield () => sheet.remove()
  yield ctx.slots.inject(MARK, () => ctx.slots.register({ name: MARK, priority: PRIORITY },
    function BrandMark({ size }: PropsRuntime<typeof MARK>) {
      const image = useSyncExternalStore(preference.subscribe, preference.read)
      return image === null
        ? h('span', { 'data-dsh-brand-mark': 'hidden', hidden: true })
        : h('img', {
          'data-dsh-brand-mark': 'image', src: image, alt: '', draggable: false,
          width: size, height: size, style: { objectFit: 'contain' },
        })
    },
  ))
  yield ctx.slots.inject(NAME, () => ctx.slots.register({ name: NAME, priority: PRIORITY },
    function BrandName() {
      const image = useSyncExternalStore(preference.subscribe, preference.read)
      return image === null
        ? h('span', { 'data-dsh-brand-name': 'hidden', hidden: true })
        : h('img', {
          'data-dsh-brand-name': 'image', src: image, alt: '', draggable: false,
          style: { blockSize: 24, minInlineSize: 0, objectFit: 'contain', objectPosition: 'left center' },
        })
    },
  ))
  yield ctx.slots.inject(SETTINGS, () => ctx.slots.register({ name: SETTINGS, key: BUNDLE, locale: NS },
    ({ t, view }: PropsRuntime<typeof SETTINGS> & PropsLocale<typeof NS>) =>
      view === 'page' ? h(ImageSettings, { preference, t }) : null,
  ))
}

export const inject = ['slots', 'locale', 'remote', 'remote.pluginManager']

export function apply(ctx: Context) {
  const preference = imagePreference(window)
  ctx.effect(() => {
    let presentation: (() => void)[] | undefined
    let revision = 0
    const show = (enabled: boolean) => {
      if (enabled) presentation ??= [...installPresentation(ctx, preference)]
      else {
        for (const dispose of presentation?.reverse() ?? []) dispose()
        presentation = undefined
      }
    }
    // The live graph can retain an already-loaded client bundle after Host disable.
    // Follow the supported inventory event so the stock UI is restored in the same page.
    const sync = async () => {
      const current = ++revision
      const result = await ctx.remote.pluginManager.listBundles()
      if (current !== revision || !result.ok) return
      const bundles: readonly BundleInfo[] = result.value
      const bundle = bundles.find(item => item.name === BUNDLE)
      show(bundle?.enabled === true)
    }
    const refresh = () => { void sync().catch(() => {}) }
    const unwatch = ctx.remote.$on('plugin-manager/changed', refresh)
    show(true)
    refresh()
    return () => {
      revision++
      unwatch()
      show(false)
    }
  })
}
