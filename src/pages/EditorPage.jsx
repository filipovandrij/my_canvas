import { useRef, useState, useCallback } from 'react'
import CanvasEraser from '../components/CanvasEraser.jsx'
import Toolbar from '../components/Toolbar.jsx'

function EditorPage() {
  const canvasRef = useRef(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [brushSize, setBrushSize] = useState(40)
  const [brushShape, setBrushShape] = useState('circle') // 'circle' | 'square' | 'triangle'
  const [zoom, setZoom] = useState(1) // 0.25 - 4

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
            Загрузите изображение, чтобы начать редактирование
          </div>
        )}
      </div>
    </div>
  )
}

export default EditorPage


