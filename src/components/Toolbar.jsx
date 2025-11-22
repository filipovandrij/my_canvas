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
  } = props

  return (
    <div className="toolbar">
      <label className="btn">
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => onUpload(e.target.files?.[0] || null)}
        />
        Загрузить
      </label>

      <div className="control">
        <span>Размер: {brushSize}px</span>
        <input
          type="range"
          min="1"
          max="200"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
        />
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
      </div>

      <div className="control">
        <span>Форма:</span>
        <select
          value={brushShape}
          onChange={(e) => onBrushShapeChange(e.target.value)}
        >
          <option value="circle">Круг</option>
          <option value="square">Квадрат</option>
          <option value="triangle">Треугольник</option>
        </select>
      </div>

      <div className="control">
        <span>Зум: {Math.round(zoom * 100)}%</span>
        <input
          type="range"
          min="25"
          max="800"
          step="5"
          value={Math.round(zoom * 100)}
          onChange={(e) => onZoomChange(Math.max(0.25, Math.min(8, Number(e.target.value) / 100)))}
        />
      </div>

      <button className="btn" disabled={!hasImage} onClick={onDownload}>
        Скачать
      </button>
    </div>
  )
}

export default Toolbar


