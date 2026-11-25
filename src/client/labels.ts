export const NS = 'dsh-sidebar-brand'

type Label = 'image' | 'hint' | 'clear' | 'invalid' | 'saveError'
export const LABELS = {
  en: {
    image: 'Brand image', hint: 'Choose a local image up to 1 MiB. Without an image, the brand is hidden.',
    clear: 'Remove image', invalid: 'Choose a valid PNG, JPEG, WebP, SVG, GIF or AVIF up to 1 MiB.',
    saveError: 'The browser could not save the image preference.',
  },
  zh: {
    image: '品牌图片', hint: '选择不超过 1 MiB 的本地图片。未选择图片时隐藏品牌。',
    clear: '移除图片', invalid: '请选择不超过 1 MiB 的有效 PNG、JPEG、WebP、SVG、GIF 或 AVIF 图片。',
    saveError: '浏览器无法保存图片设置。',
  },
  ja: {
    image: 'ブランド画像', hint: '1 MiB 以下のローカル画像を選択してください。画像がなければブランドを非表示にします。',
    clear: '画像を削除', invalid: '1 MiB 以下の有効な PNG、JPEG、WebP、SVG、GIF、AVIF を選択してください。',
    saveError: 'ブラウザーに画像設定を保存できませんでした。',
  },
  de: {
    image: 'Markenbild', hint: 'Wähle ein lokales Bild bis 1 MiB. Ohne Bild wird die Marke ausgeblendet.',
    clear: 'Bild entfernen', invalid: 'Wähle eine gültige PNG-, JPEG-, WebP-, SVG-, GIF- oder AVIF-Datei bis 1 MiB.',
    saveError: 'Der Browser konnte die Bildeinstellung nicht speichern.',
  },
  es: {
    image: 'Imagen de marca', hint: 'Elige una imagen local de hasta 1 MiB. Sin imagen, la marca se oculta.',
    clear: 'Quitar imagen', invalid: 'Elige un PNG, JPEG, WebP, SVG, GIF o AVIF válido de hasta 1 MiB.',
    saveError: 'El navegador no pudo guardar la preferencia de imagen.',
  },
  fr: {
    image: 'Image de marque', hint: 'Choisissez une image locale de 1 Mio maximum. Sans image, la marque est masquée.',
    clear: 'Supprimer l’image', invalid: 'Choisissez un fichier PNG, JPEG, WebP, SVG, GIF ou AVIF valide de 1 Mio maximum.',
    saveError: 'Le navigateur n’a pas pu enregistrer ce réglage.',
  },
  pt: {
    image: 'Imagem da marca', hint: 'Escolha uma imagem local de até 1 MiB. Sem imagem, a marca fica oculta.',
    clear: 'Remover imagem', invalid: 'Escolha um PNG, JPEG, WebP, SVG, GIF ou AVIF válido de até 1 MiB.',
    saveError: 'O navegador não conseguiu salvar a preferência de imagem.',
  },
  ru: {
    image: 'Изображение бренда', hint: 'Выберите локальное изображение до 1 МиБ. Без изображения бренд скрыт.',
    clear: 'Удалить изображение', invalid: 'Выберите корректный файл PNG, JPEG, WebP, SVG, GIF или AVIF размером до 1 МиБ.',
    saveError: 'Не удалось сохранить настройку изображения в браузере.',
  },
} satisfies Record<string, Record<Label, string>>

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    [NS]: Label
  }
}
