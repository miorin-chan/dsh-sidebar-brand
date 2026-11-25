export const NS = 'dsh-sidebar-brand'

type Label =
  | 'sectionTitle'
  | 'image'
  | 'hint'
  | 'choose'
  | 'replace'
  | 'preview'
  | 'clear'
  | 'invalid'
  | 'saveError'

export const LABELS = {
  en: {
    sectionTitle: 'Sidebar brand',
    image: 'Brand image',
    hint: 'Choose a local image up to 1 MiB. Without an image, the brand is hidden.',
    choose: 'Choose image',
    replace: 'Replace',
    preview: 'Current preview',
    clear: 'Remove image',
    invalid: 'Choose a valid PNG, JPEG, WebP, SVG, GIF or AVIF up to 1 MiB.',
    saveError: 'The browser could not save the image preference.',
  },
  zh: {
    sectionTitle: '侧栏品牌',
    image: '品牌图片',
    hint: '选择不超过 1 MiB 的本地图片。未选择图片时隐藏品牌。',
    choose: '选择图片',
    replace: '更换图片',
    preview: '当前预览',
    clear: '移除图片',
    invalid: '请选择不超过 1 MiB 的有效 PNG、JPEG、WebP、SVG、GIF 或 AVIF 图片。',
    saveError: '浏览器无法保存图片设置。',
  },
  ja: {
    sectionTitle: 'サイドバーブランド',
    image: 'ブランド画像',
    hint: '1 MiB 以下のローカル画像を選択してください。画像がなければブランドを非表示にします。',
    choose: '画像を選択',
    replace: '画像を変更',
    preview: '現在のプレビュー',
    clear: '画像を削除',
    invalid: '1 MiB 以下の有効な PNG、JPEG、WebP、SVG、GIF、AVIF を選択してください。',
    saveError: 'ブラウザーに画像設定を保存できませんでした。',
  },
  de: {
    sectionTitle: 'Seitenleisten-Marke',
    image: 'Markenbild',
    hint: 'Wähle ein lokales Bild bis 1 MiB. Ohne Bild wird die Marke ausgeblendet.',
    choose: 'Bild wählen',
    replace: 'Ersetzen',
    preview: 'Aktuelle Vorschau',
    clear: 'Bild entfernen',
    invalid: 'Wähle eine gültige PNG-, JPEG-, WebP-, SVG-, GIF- oder AVIF-Datei bis 1 MiB.',
    saveError: 'Der Browser konnte die Bildeinstellung nicht speichern.',
  },
  es: {
    sectionTitle: 'Marca de la barra lateral',
    image: 'Imagen de marca',
    hint: 'Elige una imagen local de hasta 1 MiB. Sin imagen, la marca se oculta.',
    choose: 'Elegir imagen',
    replace: 'Reemplazar',
    preview: 'Vista previa actual',
    clear: 'Quitar imagen',
    invalid: 'Elige un PNG, JPEG, WebP, SVG, GIF o AVIF válido de hasta 1 MiB.',
    saveError: 'El navegador no pudo guardar la preferencia de imagen.',
  },
  fr: {
    sectionTitle: 'Marque de la barre latérale',
    image: 'Image de marque',
    hint: 'Choisissez une image locale de 1 Mio maximum. Sans image, la marque est masquée.',
    choose: 'Choisir une image',
    replace: 'Remplacer',
    preview: 'Aperçu actuel',
    clear: 'Supprimer l’image',
    invalid: 'Choisissez un fichier PNG, JPEG, WebP, SVG, GIF ou AVIF valide de 1 Mio maximum.',
    saveError: 'Le navigateur n’a pas pu enregistrer ce réglage.',
  },
  pt: {
    sectionTitle: 'Marca da barra lateral',
    image: 'Imagem da marca',
    hint: 'Escolha uma imagem local de até 1 MiB. Sem imagem, a marca fica oculta.',
    choose: 'Escolher imagem',
    replace: 'Substituir',
    preview: 'Pré-visualização atual',
    clear: 'Remover imagem',
    invalid: 'Escolha um PNG, JPEG, WebP, SVG, GIF ou AVIF válido de até 1 MiB.',
    saveError: 'O navegador não conseguiu salvar a preferência de imagem.',
  },
  ru: {
    sectionTitle: 'Бренд боковой панели',
    image: 'Изображение бренда',
    hint: 'Выберите локальное изображение до 1 МиБ. Без изображения бренд скрыт.',
    choose: 'Выбрать изображение',
    replace: 'Заменить',
    preview: 'Текущий предпросмотр',
    clear: 'Удалить изображение',
    invalid: 'Выберите корректный файл PNG, JPEG, WebP, SVG, GIF или AVIF размером до 1 МиБ.',
    saveError: 'Не удалось сохранить настройку изображения в браузере.',
  },
} satisfies Record<string, Record<Label, string>>

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    [NS]: Label
  }
}
