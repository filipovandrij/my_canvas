import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

function loadFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImageSize(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height })
    img.onerror = reject
    img.src = src
  })
}

const CollageCanvas = forwardRef(function CollageCanvas(props, ref) {
  const { canvasWidth = 1280, canvasHeight = 720 } = props
  const boardRef = useRef(null)
  const [layers, setLayers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [backgroundId, setBackgroundId] = useState(null)
  const dragRef = useRef({ mode: null, id: null, startX: 0, startY: 0, originX: 0, originY: 0, startScaleX: 1, startScaleY: 1 })

  useImperativeHandle(ref, () => ({
    async addFiles(files) {
      const list = Array.from(files || [])
      if (list.length === 0) return
      const rect = boardRef.current?.getBoundingClientRect()
      const cx = rect ? rect.width / 2 : 300
      const cy = rect ? rect.height / 2 : 200
      const next = []
      for (let i = 0; i < list.length; i++) {
        const file = list[i]
        try {
          const src = await loadFileAsDataURL(file)
          const { width, height } = await loadImageSize(src)
          const maxScaleFit = Math.min(
            canvasWidth / (width || 1),
            canvasHeight / (height || 1),
          )
          const initialScale = Math.max(0.1, Math.min(0.8, maxScaleFit || 1))
          next.push({
            id: `${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}`,
            src,
            x: Math.round(cx + i * 20),
            y: Math.round(cy + i * 20),
            scaleX: initialScale,
            scaleY: initialScale,
            imgWidth: width,
            imgHeight: height,
          })
        } catch {
          // ignore
        }
      }
      setLayers((prev) => [...prev, ...next])
      if (next.length) setSelectedId(next[next.length - 1].id)
    },
    setSelectedAsBackground() {
      if (!selectedId) return
      setBackgroundId(selectedId)
      // Center and cover board
      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== selectedId) return l
          const scaleX = canvasWidth / (l.imgWidth || 1)
          const scaleY = canvasHeight / (l.imgHeight || 1)
          const coverScale = Math.max(scaleX, scaleY)
          return {
            ...l,
            x: Math.round(canvasWidth / 2),
            y: Math.round(canvasHeight / 2),
            scaleX: coverScale,
            scaleY: coverScale,
          }
        }),
      )
    },
    clearBackground() {
      setBackgroundId(null)
    },
    async exportPNG() {
      // Prepare canvas
      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const ctx = canvas.getContext('2d')
      // Fill white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Order layers: background first, then others in stacking order
      const ordered = layers
        .slice()
        .sort((a, b) => {
          if (a.id === backgroundId) return -1
          if (b.id === backgroundId) return 1
          return 0
        })

      // Load images (fresh instances to ensure draw safety)
      const images = await Promise.all(
        ordered.map(
          (l) =>
            new Promise((resolve) => {
              const img = new Image()
              img.onload = () => resolve(img)
              img.onerror = () => resolve(null)
              img.src = l.src
            }),
        ),
      )

      // Draw each layer
      for (let i = 0; i < ordered.length; i++) {
        const layer = ordered[i]
        const img = images[i]
        if (!img) continue
        const sx = layer.scaleX || layer.scale || 1
        const sy = layer.scaleY || layer.scale || 1
        const centerX = layer.id === backgroundId ? Math.round(canvasWidth / 2) : layer.x
        const centerY = layer.id === backgroundId ? Math.round(canvasHeight / 2) : layer.y
        const drawW = (layer.imgWidth || img.naturalWidth || img.width || 1) * sx
        const drawH = (layer.imgHeight || img.naturalHeight || img.height || 1) * sy
        const dx = Math.round(centerX - drawW / 2)
        const dy = Math.round(centerY - drawH / 2)
        ctx.drawImage(img, dx, dy, Math.round(drawW), Math.round(drawH))
      }

      return canvas.toDataURL('image/png')
    },
  }))

  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current
      if (!d.mode || !d.id) return
      const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX
      const clientY = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY
      const dx = clientX - d.startX
      const dy = clientY - d.startY
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id !== d.id) return layer
          if (d.mode === 'move') {
            // Keep fully inside board
            const halfW = (layer.imgWidth || 1) * (layer.scaleX || layer.scale || 1) / 2
            const halfH = (layer.imgHeight || 1) * (layer.scaleY || layer.scale || 1) / 2
            const minX = halfW
            const maxX = canvasWidth - halfW
            const minY = halfH
            const maxY = canvasHeight - halfH
            const nextX = Math.max(minX, Math.min(maxX, d.originX + dx))
            const nextY = Math.max(minY, Math.min(maxY, d.originY + dy))
            return { ...layer, x: nextX, y: nextY }
          }
          if (d.mode === 'resize' || d.mode === 'resize-x' || d.mode === 'resize-y') {
            const delta = Math.max(dx, dy)
            const fitMaxScale = Math.min(
              canvasWidth / (layer.imgWidth || 1),
              canvasHeight / (layer.imgHeight || 1),
            )
            let nextScaleX = layer.scaleX || layer.scale || 1
            let nextScaleY = layer.scaleY || layer.scale || 1
            if (d.mode === 'resize') {
              const unclamped = ((d.startScaleX + d.startScaleY) / 2) * (1 + delta / 200)
              const uni = Math.max(0.05, Math.min(fitMaxScale || 1, unclamped))
              nextScaleX = uni
              nextScaleY = uni
            } else if (d.mode === 'resize-x') {
              const fitMaxX = canvasWidth / (layer.imgWidth || 1)
              const unclampedX = d.startScaleX * (1 + dx / 200)
              nextScaleX = Math.max(0.05, Math.min(fitMaxX || 1, unclampedX))
            } else if (d.mode === 'resize-y') {
              const fitMaxY = canvasHeight / (layer.imgHeight || 1)
              const unclampedY = d.startScaleY * (1 + dy / 200)
              nextScaleY = Math.max(0.05, Math.min(fitMaxY || 1, unclampedY))
            }
            const halfW = (layer.imgWidth || 1) * nextScaleX / 2
            const halfH = (layer.imgHeight || 1) * nextScaleY / 2
            const minX = halfW
            const maxX = canvasWidth - halfW
            const minY = halfH
            const maxY = canvasHeight - halfH
            const clampedX = Math.max(minX, Math.min(maxX, layer.x))
            const clampedY = Math.max(minY, Math.min(maxY, layer.y))
            return { ...layer, scaleX: nextScaleX, scaleY: nextScaleY, x: clampedX, y: clampedY }
          }
          return layer
        }),
      )
    }
    const onUp = () => {
      dragRef.current.mode = null
      dragRef.current.id = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  function beginMove(e, id) {
    e.preventDefault()
    e.stopPropagation()
    const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX
    const clientY = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY
    const layer = layers.find((l) => l.id === id)
    if (!layer) return
    if (backgroundId && id === backgroundId) return
    setSelectedId(id)
    dragRef.current = {
      mode: 'move',
      id,
      startX: clientX,
      startY: clientY,
      originX: layer.x,
      originY: layer.y,
      startScaleX: layer.scaleX || layer.scale || 1,
      startScaleY: layer.scaleY || layer.scale || 1,
    }
  }

  function beginResize(e, id, mode = 'uniform') {
    e.preventDefault()
    e.stopPropagation()
    const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX
    const clientY = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY
    const layer = layers.find((l) => l.id === id)
    if (!layer) return
    if (backgroundId && id === backgroundId) return
    setSelectedId(id)
    dragRef.current = {
      mode: mode === 'x' ? 'resize-x' : mode === 'y' ? 'resize-y' : 'resize',
      id,
      startX: clientX,
      startY: clientY,
      originX: layer.x,
      originY: layer.y,
      startScaleX: layer.scaleX || layer.scale || 1,
      startScaleY: layer.scaleY || layer.scale || 1,
    }
  }

  function bringToFront(id) {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id)
      if (idx === -1) return prev
      const copy = prev.slice()
      const [item] = copy.splice(idx, 1)
      copy.push(item)
      return copy
    })
    setSelectedId(id)
  }

  const orderedLayers = layers.slice().sort((a, b) => {
    if (a.id === backgroundId) return -1
    if (b.id === backgroundId) return 1
    return 0
  })

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div
        ref={boardRef}
        style={{
          position: 'relative',
          width: canvasWidth,
          height: canvasHeight,
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 25px 60px rgba(2, 8, 20, 0.08), 0 4px 10px rgba(2, 8, 20, 0.06)',
          cursor: dragRef.current.mode === 'move' ? 'grabbing' : 'default',
          userSelect: 'none',
        }}
        onMouseDown={() => setSelectedId(null)}
      >
        {orderedLayers.map((layer, index) => {
        const isSelected = layer.id === selectedId
          const isBackground = backgroundId && layer.id === backgroundId
        return (
          <div
            key={layer.id}
            onMouseDown={(e) => beginMove(e, layer.id)}
            onTouchStart={(e) => beginMove(e, layer.id)}
            onDoubleClick={() => bringToFront(layer.id)}
            style={{
              position: 'absolute',
                left: isBackground ? Math.round(canvasWidth / 2) : layer.x,
                top: isBackground ? Math.round(canvasHeight / 2) : layer.y,
              transform: `translate(-50%, -50%) scale(${layer.scaleX || layer.scale || 1}, ${layer.scaleY || layer.scale || 1})`,
              transformOrigin: 'center center',
              zIndex: index + 1,
                border: isSelected && !isBackground ? '2px solid #1976d2' : '2px solid transparent',
              borderRadius: 4,
                boxShadow: isSelected && !isBackground ? '0 0 0 2px rgba(25,118,210,0.2)' : 'none',
              background: 'transparent',
            }}
          >
            <img
              src={layer.src}
              alt=""
              draggable={false}
              style={{
                display: 'block',
                pointerEvents: 'none',
                borderRadius: 4,
              }}
            />
              {isSelected && !isBackground && (
              <div
                onMouseDown={(e) => beginResize(e, layer.id, 'uniform')}
                onTouchStart={(e) => beginResize(e, layer.id, 'uniform')}
                style={{
                  position: 'absolute',
                  right: -8,
                  bottom: -8,
                  width: 14,
                  height: 14,
                  background: '#1976d2',
                  border: '2px solid white',
                  borderRadius: 3,
                  cursor: 'nwse-resize',
                }}
                aria-label="resize"
              />
            )}
            {isSelected && !isBackground && (
              <div
                onMouseDown={(e) => beginResize(e, layer.id, 'x')}
                onTouchStart={(e) => beginResize(e, layer.id, 'x')}
                style={{
                  position: 'absolute',
                  right: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 14,
                  height: 14,
                  background: '#1976d2',
                  border: '2px solid white',
                  borderRadius: 3,
                  cursor: 'ew-resize',
                }}
                aria-label="resize-x"
              />
            )}
            {isSelected && !isBackground && (
              <div
                onMouseDown={(e) => beginResize(e, layer.id, 'y')}
                onTouchStart={(e) => beginResize(e, layer.id, 'y')}
                style={{
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 14,
                  height: 14,
                  background: '#1976d2',
                  border: '2px solid white',
                  borderRadius: 3,
                  cursor: 'ns-resize',
                }}
                aria-label="resize-y"
              />
            )}
          </div>
        )
        })}
      </div>
    </div>
  )
})

export default CollageCanvas


