import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { drawImageContain, loadImage } from '../lib/images.js'
import { stampShape, stampLine, strokeShapeOutline } from '../lib/brushes.js'

const CanvasEraser = forwardRef(function CanvasEraser(props, ref) {
  const { imageSrc, brushSize, brushShape, zoom = 1, onZoomChange } = props
  const wrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const ctxRef = useRef(null)
  const overlayCtxRef = useRef(null)
  const imageRef = useRef(null)
  const isErasingRef = useRef(false)
  const lastPointRef = useRef(null)
  const hasDrawnImageRef = useRef(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isPanningRef = useRef(false)
  const panStartRef = useRef({ x: 0, y: 0 })
  const panAtStartRef = useRef({ x: 0, y: 0 })

  // Overlay helpers defined early to satisfy no-use-before-define
  function clearOverlay() {
    const overlay = overlayRef.current
    const octx = overlayCtxRef.current
    if (!overlay || !octx) return
    octx.clearRect(0, 0, overlay.width, overlay.height)
  }

  function drawPreview(x, y) {
    const octx = overlayCtxRef.current
    const overlay = overlayRef.current
    if (!octx || !overlay) return
    // Clear previous
    octx.clearRect(0, 0, overlay.width, overlay.height)
    // Dual stroke for visibility on any background
    octx.save()
    octx.setLineDash([4, 3])
    octx.lineJoin = 'round'
    octx.lineCap = 'round'
    // Outer dark stroke
    octx.strokeStyle = 'rgba(0,0,0,0.85)'
    octx.lineWidth = 2
    strokeShapeOutline(octx, x, y, brushSize, brushShape)
    // Inner light stroke
    octx.strokeStyle = 'rgba(255,255,255,0.95)'
    octx.lineWidth = 1
    strokeShapeOutline(octx, x, y, brushSize, brushShape)
    octx.restore()
  }

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    ctxRef.current = canvas.getContext('2d')
    if (overlayRef.current) {
      overlayCtxRef.current = overlayRef.current.getContext('2d')
    }
  }, [])

  // Size canvas to wrapper (once)
  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!wrapper || !canvas) return
    const rect = wrapper.getBoundingClientRect()
    canvas.width = Math.max(320, Math.floor(rect.width))
    canvas.height = Math.max(240, Math.floor(rect.height))
    if (overlay) {
      overlay.width = canvas.width
      overlay.height = canvas.height
    }
    // If the image is already loaded, redraw it
    if (imageRef.current && !hasDrawnImageRef.current) {
      const ctx = ctxRef.current
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawImageContain(ctx, imageRef.current, canvas)
      hasDrawnImageRef.current = true
    }
  }, [])

  // Load and draw image when imageSrc changes
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!imageSrc) {
        imageRef.current = null
        hasDrawnImageRef.current = false
        const ctx = ctxRef.current
        const canvas = canvasRef.current
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height)
        clearOverlay()
        return
      }
      const img = await loadImage(imageSrc)
      if (cancelled) return
      imageRef.current = img
      const canvas = canvasRef.current
      const ctx = ctxRef.current
      if (!canvas || !ctx) return

      // Ensure canvas has size (in case mounted before layout)
      if (canvas.width === 0 || canvas.height === 0) {
        const rect = canvas.getBoundingClientRect()
        canvas.width = Math.max(320, Math.floor(rect.width || 800))
        canvas.height = Math.max(240, Math.floor(rect.height || 600))
        if (overlayRef.current) {
          overlayRef.current.width = canvas.width
          overlayRef.current.height = canvas.height
        }
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawImageContain(ctx, img, canvas)
      hasDrawnImageRef.current = true
      clearOverlay()
      // reset pan on new image
      setPan({ x: 0, y: 0 })
    }
    run()
    return () => {
      cancelled = true
    }
  }, [imageSrc])

  // Pointer helpers
  function getOffsetPos(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    let clientX
    let clientY
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    return {
      x: (clientX - rect.left) / (zoom || 1),
      y: (clientY - rect.top) / (zoom || 1),
    }
  }



  function beginErase(e) {
    if (!imageRef.current) return
    e.preventDefault()
    // ignore right/middle click for erase
    if (typeof e.button === 'number' && e.button !== 0) {
      return
    }
    const ctx = ctxRef.current
    const pos = getOffsetPos(e)
    isErasingRef.current = true
    lastPointRef.current = pos
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    stampShape(ctx, pos.x, pos.y, brushSize, brushShape)
    ctx.restore()
    drawPreview(pos.x, pos.y)
  }

  function moveErase(e) {
    e.preventDefault()
    const pos = getOffsetPos(e)
    drawPreview(pos.x, pos.y)
    if (!isErasingRef.current) return
    const ctx = ctxRef.current
    const last = lastPointRef.current || pos
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    stampLine(ctx, last.x, last.y, pos.x, pos.y, brushSize, brushShape)
    ctx.restore()
    lastPointRef.current = pos
  }

  function endErase() {
    isErasingRef.current = false
    lastPointRef.current = null
    // Keep preview where cursor is until leave; do not clear here
  }

  useImperativeHandle(ref, () => ({
    getImageDataURL() {
      const canvas = canvasRef.current
      if (!canvas) return null
      return canvas.toDataURL('image/png')
    },
  }))

  // Wheel zoom with passive: false to prevent browser/page zoom/scroll
  useEffect(() => {
    const el = wrapperRef.current
    if (!el || !onZoomChange) return
    const onWheel = (e) => {
      e.preventDefault()
      const direction = e.deltaY > 0 ? -1 : 1
      const factor = direction > 0 ? 1.1 : 1 / 1.1
      const next = Math.max(0.25, Math.min(8, zoom * factor))
      onZoomChange(next)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
    }
  }, [zoom, onZoomChange])

  function beginPan(e) {
    if (!imageRef.current) return
    if (e.button !== 2) return
    e.preventDefault()
    isPanningRef.current = true
    panStartRef.current = { x: e.clientX, y: e.clientY }
    panAtStartRef.current = { x: pan.x, y: pan.y }
  }

  function movePan(e) {
    if (!isPanningRef.current) return
    e.preventDefault()
    const dx = e.clientX - panStartRef.current.x
    const dy = e.clientY - panStartRef.current.y
    setPan({ x: panAtStartRef.current.x + dx, y: panAtStartRef.current.y + dy })
  }

  function endPan() {
    isPanningRef.current = false
  }

  return (
    <div
      ref={wrapperRef}
      className="canvas-area"
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={beginPan}
      onMouseMove={movePan}
      onMouseUp={endPan}
      onMouseLeave={endPan}
    >
      <div
        className="canvas-stack"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <canvas
          ref={canvasRef}
          className="canvas"
          onMouseDown={beginErase}
          onMouseMove={moveErase}
          onMouseUp={endErase}
          onMouseLeave={() => {
            endErase()
            clearOverlay()
          }}
          onTouchStart={beginErase}
          onTouchMove={moveErase}
          onTouchEnd={endErase}
        />
        <canvas
          ref={overlayRef}
          className="canvas-overlay"
          aria-hidden="true"
        />
      </div>
    </div>
  )
})

export default CanvasEraser



