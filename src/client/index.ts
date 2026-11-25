import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type { PluginInfo } from '@deepseek-ai/dsh-plugin-manager/types'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { createElement as h, useSyncExternalStore } from 'react'
import { ImageSettings, type Preference } from './brand-settings.js'
import { imagePreference } from './image.js'
import { LABELS, NS } from './labels.js'

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
    // A disabled Host row may leave its Client module loaded. Use the live row inventory
    // so both standalone and Atlas installations follow the same enable state.
    const sync = async () => {
      const current = ++revision
      const result = await ctx.remote.pluginManager.listPlugins()
      if (current !== revision || !result.ok) return
      const rows: readonly PluginInfo[] = result.value
      show(rows.some(row => row.moduleName === BUNDLE && row.enabled))
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
