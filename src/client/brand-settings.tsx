import {
  Button,
  IconPersonalizationOutlineMedium,
  IconTrashOutlineRegular,
  IconUploadOutlineMedium,
  StateDot,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { useRef, useState, useSyncExternalStore } from 'react'
import { ACCEPT, chooseImage, imagePreference } from './image.js'
import type { NS } from './labels.js'

export type Preference = ReturnType<typeof imagePreference>

const SETTINGS_CSS = `
.dsh-sb-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  container-type: inline-size;
  color: var(--dsw-alias-label-primary);
}
[data-dsh-aggregate-member] .dsh-sb-head {
  display: none;
}
.dsh-sb-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.dsh-sb-heading {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
}
.dsh-sb-list {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.dsh-sb-row {
  display: flex;
  align-items: center;
  gap: 10px 12px;
  min-width: 0;
  padding: 12px 0;
}
.dsh-sb-row:first-child {
  padding-top: 4px;
}
.dsh-sb-row:last-child {
  padding-bottom: 4px;
}
.dsh-sb-row + .dsh-sb-row {
  border-top: 0.5px solid var(--dsw-alias-border-l1);
}
.dsh-sb-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  align-self: flex-start;
  margin-top: 2px;
  color: var(--dsw-alias-label-secondary);
}
.dsh-sb-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.dsh-sb-title-line {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}
.dsh-sb-title {
  font-size: 13.5px;
  line-height: 20px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
}
.dsh-sb-status-dot {
  flex: none;
}
.dsh-sb-desc {
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
  overflow-wrap: anywhere;
}
.dsh-sb-control {
  display: inline-flex;
  flex: none;
  align-items: center;
  margin-inline-start: 4px;
}
.dsh-sb-upload {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 0.5px solid transparent;
  border-radius: var(--dsw-radius-sm, 8px);
  background: transparent;
  box-shadow: inset 0 0 0 var(--dsh-hairline-width, 0.5px) var(--dsw-alias-border-l3);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  cursor: pointer;
}
.dsh-sb-upload[data-disabled='true'] {
  opacity: 0.4;
  cursor: not-allowed;
}
.dsh-sb-upload:not([data-disabled='true']):active {
  background: var(--dsw-alias-interactive-bg-active);
}
@media (hover: hover) {
  .dsh-sb-upload:not([data-disabled='true']):hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}
.dsh-sb-upload:has(:focus-visible) {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 2px;
}
.dsh-sb-file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}
.dsh-sb-file-input:disabled {
  cursor: not-allowed;
}
.dsh-sb-preview-group {
  display: flex;
  flex: 1;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  min-width: 0;
}
.dsh-sb-preview {
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
.dsh-sb-preview-img {
  display: block;
  height: 24px;
  max-width: min(180px, 100%);
  object-fit: contain;
}
.dsh-sb-danger {
  color: var(--dsw-alias-state-error-primary);
  --dsh-button-outline-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, transparent);
  --dsw-alias-interactive-bg-hover: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);
}
.dsh-sb-error {
  margin: 4px 0 0;
  padding: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-state-error-primary);
  overflow-wrap: anywhere;
}
@container (max-width: 440px) {
  .dsh-sb-row {
    flex-wrap: wrap;
    align-items: flex-start;
  }
  .dsh-sb-copy {
    flex: 1 1 calc(100% - 32px);
  }
  .dsh-sb-control {
    width: 100%;
    box-sizing: border-box;
    margin-inline-start: 0;
    padding-inline-start: 32px;
  }
  .dsh-sb-preview-group {
    flex: 1 1 100%;
  }
  .dsh-sb-preview-row .dsh-sb-control {
    padding-inline-start: 0;
  }
}
`

export function ImageSettings({ preference, t }: { preference: Preference } & PropsLocale<typeof NS>) {
  const image = useSyncExternalStore(preference.subscribe, preference.read)
  const picker = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<'invalid' | 'saveError' | null>(null)

  return (
    <section className="dsh-sb-panel" data-dsh-brand-settings="">
      <style>{SETTINGS_CSS}</style>
      <div className="dsh-sb-head">
        <h4 className="dsh-sb-heading">{t('sectionTitle')}</h4>
      </div>
      <div className="dsh-sb-list">
        <div className="dsh-sb-row">
          <span className="dsh-sb-icon" aria-hidden="true">
            <IconPersonalizationOutlineMedium size={16} />
          </span>
          <div className="dsh-sb-copy">
            <div className="dsh-sb-title-line">
              <span className="dsh-sb-title">{t('image')}</span>
              <StateDot state={image !== null ? 'done' : 'idle'} className="dsh-sb-status-dot" />
            </div>
            <p className="dsh-sb-desc">{t('hint')}</p>
          </div>
          <div className="dsh-sb-control">
            <label className="dsh-sb-upload" data-disabled={busy ? 'true' : undefined}>
              <IconUploadOutlineMedium size={14} aria-hidden="true" />
              <span>{t(image !== null ? 'replace' : 'choose')}</span>
              <input
                ref={picker}
                type="file"
                accept={ACCEPT}
                disabled={busy}
                aria-label={t(image !== null ? 'replace' : 'choose')}
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
            </label>
          </div>
        </div>
        {image !== null && (
          <div className="dsh-sb-row dsh-sb-preview-row">
            <div className="dsh-sb-preview-group">
              <span className="dsh-sb-preview">
                <img src={image} alt={t('image')} className="dsh-sb-preview-img" />
              </span>
              <span className="dsh-sb-desc">{t('preview')}</span>
            </div>
            <div className="dsh-sb-control">
              <Button
                variant="outline"
                size="sm"
                className="dsh-sb-danger"
                icon={<IconTrashOutlineRegular size={13} />}
                disabled={busy}
                onClick={() => {
                  if (!preference.write(null)) { setError('saveError'); return }
                  setError(null)
                  picker.current?.focus()
                }}
              >
                {t('clear')}
              </Button>
            </div>
          </div>
        )}
        {error !== null && (
          <p className="dsh-sb-error" role="alert">{t(error)}</p>
        )}
      </div>
    </section>
  )
}
