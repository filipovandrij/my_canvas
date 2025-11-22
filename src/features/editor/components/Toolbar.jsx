import { useTranslation } from 'react-i18next'

function Toolbar(props) {
  const {
    brushSize,
    onBrushSizeChange,
    brushShape,
    onBrushShapeChange,
    zoom,
    onZoomChange,
    onUpload,
    onDownload,
    hasImage,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    showOriginal,
    onToggleShowOriginal,
  } = props

  const { t, i18n } = useTranslation()

  return (
    <div className="sidebar-inner">
      <div className="control">
        <span>{t('language')}:</span>
        <select
          value={i18n.resolvedLanguage || i18n.language || 'en'}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ru">Русский</option>
          <option value="uk">Українська</option>
          <option value="ka">ქართული</option>
        </select>
      </div>

      <div className="control">
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={Boolean(showOriginal)}
            onChange={onToggleShowOriginal}
            disabled={!hasImage}
          />
          <span>{t('showOriginal')}</span>
        </label>
      </div>

      <div className="control">
        <button
          className="btn"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label={t('undo')}
          title={t('undo')}
        >
          ←
        </button>
        <button
          className="btn"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label={t('redo')}
          title={t('redo')}
        >
          →
        </button>
      </div>

      <label className="btn">
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => onUpload(e.target.files?.[0] || null)}
        />
        {t('upload')}
      </label>

      <div className="control">
        <span>{t('size')}: {brushSize}px</span>
        <button
          className="btn"
          onClick={() => onBrushSizeChange(Math.max(1, brushSize - 1))}
        >
          −
        </button>
        <input
          type="number"
          min="1"
          max="200"
          value={brushSize}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isNaN(v)) return
            const clamped = Math.max(1, Math.min(200, v))
            onBrushSizeChange(clamped)
          }}
          style={{ width: 72 }}
        />
        <button
          className="btn"
          onClick={() => onBrushSizeChange(Math.min(200, brushSize + 1))}
        >
          +
        </button>
      </div>

      <div className="control">
        <span>{t('shape')}:</span>
        <select
          value={brushShape}
          onChange={(e) => onBrushShapeChange(e.target.value)}
        >
          <option value="circle">{t('shape_circle')}</option>
          <option value="square">{t('shape_square')}</option>
          <option value="triangle">{t('shape_triangle')}</option>
        </select>
      </div>

      <div className="control">
        <span>{t('zoom')}: {Math.round(zoom * 100)}%</span>
        <button
          className="btn"
          onClick={() => {
            const current = Math.round(zoom * 100)
            const nextPct = Math.max(25, current - 5)
            onZoomChange(nextPct / 100)
          }}
        >
          −
        </button>
        <button
          className="btn"
          onClick={() => {
            const current = Math.round(zoom * 100)
            const nextPct = Math.min(800, current + 5)
            onZoomChange(nextPct / 100)
          }}
        >
          +
        </button>
      </div>

      <button className="btn" disabled={!hasImage} onClick={onDownload}>
        {t('download')}
      </button>
    </div>
  )
}

export default Toolbar



