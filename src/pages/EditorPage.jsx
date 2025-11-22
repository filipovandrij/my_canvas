import { useRef, useCallback } from 'react'
import CanvasEraser from '../features/editor/components/CanvasEraser.jsx'
import Toolbar from '../features/editor/components/Toolbar.jsx'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { setBrushSize, setBrushShape, setZoom, setImageSrc, setHistory, setShowOriginal } from '../store/editorSlice.js'
import SidebarTabs from '../components/SidebarTabs.jsx'

function EditorPage() {
  const canvasRef = useRef(null)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const imageSrc = useSelector((state) => state.editor.imageSrc)
  const brushSize = useSelector((state) => state.editor.brushSize)
  const brushShape = useSelector((state) => state.editor.brushShape)
  const zoom = useSelector((state) => state.editor.zoom)
  const history = useSelector((state) => state.editor.history)
  const showOriginal = useSelector((state) => state.editor.showOriginal)

  const handleUpload = useCallback((file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      dispatch(setImageSrc(reader.result))
    }
    reader.readAsDataURL(file)
  }, [dispatch])

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
          <SidebarTabs />
          <Toolbar
            brushSize={brushSize}
            onBrushSizeChange={(v) => dispatch(setBrushSize(v))}
            brushShape={brushShape}
            onBrushShapeChange={(v) => dispatch(setBrushShape(v))}
            zoom={zoom}
            onZoomChange={(v) => dispatch(setZoom(v))}
            onUpload={handleUpload}
            onDownload={handleDownload}
            hasImage={Boolean(imageSrc)}
            onUndo={() => canvasRef.current?.undo?.()}
            onRedo={() => canvasRef.current?.redo?.()}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            showOriginal={showOriginal}
            onToggleShowOriginal={() => dispatch(setShowOriginal(!showOriginal))}
          />
        </aside>
        <div className="canvas-wrap">
          <CanvasEraser
            ref={canvasRef}
            imageSrc={imageSrc}
            brushSize={brushSize}
            brushShape={brushShape}
            zoom={zoom}
            onZoomChange={(v) => dispatch(setZoom(v))}
            onHistoryChange={(h) => dispatch(setHistory(h))}
            showOriginal={showOriginal}
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


