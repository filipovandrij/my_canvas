import { useRef, useState, useCallback } from 'react'
import CanvasEraser from '../features/editor/components/CanvasEraser.jsx'
import Toolbar from '../features/editor/components/Toolbar.jsx'
import { useTranslation } from 'react-i18next'

function EditorPage() {
  const canvasRef = useRef(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [brushSize, setBrushSize] = useState(40)
  const [brushShape, setBrushShape] = useState('circle') // 'circle' | 'square' | 'triangle'
  const [zoom, setZoom] = useState(1) // 0.25 - 4
  const { t } = useTranslation()

  const handleUpload = useCallback((file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDownload = useCallback(() => {
    const dataUrl = canvasRef.current?.getImageDataURL()
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'edited.png'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }, [])

  return (
    <div className="page">
      <div className="editor">
        <aside className="sidebar">
          <Toolbar
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            brushShape={brushShape}
            onBrushShapeChange={setBrushShape}
            zoom={zoom}
            onZoomChange={setZoom}
            onUpload={handleUpload}
            onDownload={handleDownload}
            hasImage={Boolean(imageSrc)}
          />
        </aside>
        <div className="canvas-wrap">
          <CanvasEraser
            ref={canvasRef}
            imageSrc={imageSrc}
            brushSize={brushSize}
            brushShape={brushShape}
            zoom={zoom}
            onZoomChange={setZoom}
          />
          {!imageSrc && (
            <div className="empty-hint">
              {t('emptyHint')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditorPage


