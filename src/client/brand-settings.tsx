import {
  Button,
  IconPersonalizationOutlineMedium,
  IconTrashOutlineRegular,
  IconUploadOutlineMedium,
  StateDot,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { KNOBS_DANGER_CLASS, KnobItem, KnobRow, KnobsPanel } from '@miorin/dsh-plugin-knobs-ui'
import { useRef, useState, useSyncExternalStore } from 'react'
import { ACCEPT, chooseImage, imagePreference } from './image.js'
import type { NS } from './labels.js'

export type Preference = ReturnType<typeof imagePreference>

const SCOPE = '@miorin/dsh-sidebar-brand'

const EXTRA_CSS = `
[data-knobs-scope="${SCOPE}"] .dsh-sb-upload-wrap {
  position: relative;
  display: inline-flex;
}
[data-knobs-scope="${SCOPE}"] .dsh-sb-file-input {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  margin: 0;
  padding: 0;
  border: 0;
  overflow: hidden;
}
[data-knobs-scope="${SCOPE}"] .dsh-sb-preview-group {
  display: flex;
  flex: 1;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  min-width: 0;
}
[data-knobs-scope="${SCOPE}"] .dsh-sb-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 36px;
  max-width: 100%;
  padding: 6px 12px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-2);
}
[data-knobs-scope="${SCOPE}"] .dsh-sb-preview-img {
  display: block;
  height: 24px;
  max-width: min(180px, 100%);
  object-fit: contain;
}
@container (max-width: 440px) {
  [data-knobs-scope="${SCOPE}"] .dsh-sb-preview-group {
    flex: 1 1 100%;
  }
}
`

export function ImageSettings({ preference, t }: { preference: Preference } & PropsLocale<typeof NS>) {
  const image = useSyncExternalStore(preference.subscribe, preference.read)
  const picker = useRef<HTMLInputElement>(null)
  const uploadButton = useRef<HTMLButtonElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<'invalid' | 'saveError' | null>(null)

  return (
    <KnobsPanel
      scope={SCOPE}
      heading={t('sectionTitle')}
      className="dsh-sb-panel"
      data-dsh-brand-settings=""
      styles={EXTRA_CSS}
      feedback={error !== null ? { text: t(error), tone: 'alert' } : undefined}
    >
      <KnobRow
        icon={<IconPersonalizationOutlineMedium size={16} />}
        title={t('image')}
        indicator={<StateDot state={image !== null ? 'done' : 'idle'} />}
        description={t('hint')}
        control={(
          <span className="dsh-sb-upload-wrap">
            <Button
              ref={uploadButton}
              variant="outline"
              size="sm"
              icon={<IconUploadOutlineMedium size={14} />}
              disabled={busy}
              onClick={() => { picker.current?.click() }}
            >
              {t(image !== null ? 'replace' : 'choose')}
            </Button>
            <input
              ref={picker}
              type="file"
              accept={ACCEPT}
              disabled={busy}
              tabIndex={-1}
              aria-hidden="true"
              className="dsh-sb-file-input"
              onChange={async (event) => {
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
              }}
            />
          </span>
        )}
      />
      {image !== null && (
        <KnobItem>
          <div className="knobs-row dsh-sb-preview-row">
            <div className="dsh-sb-preview-group">
              <span className="dsh-sb-preview">
                <img src={image} alt={t('image')} className="dsh-sb-preview-img" />
              </span>
              <span className="knobs-desc">{t('preview')}</span>
            </div>
            <div className="knobs-control">
              <Button
                variant="outline"
                size="sm"
                className={KNOBS_DANGER_CLASS}
                icon={<IconTrashOutlineRegular size={13} />}
                disabled={busy}
                onClick={() => {
                  if (!preference.write(null)) { setError('saveError'); return }
                  setError(null)
                  uploadButton.current?.focus()
                }}
              >
                {t('clear')}
              </Button>
            </div>
          </div>
        </KnobItem>
      )}
    </KnobsPanel>
  )
}
