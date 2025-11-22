export function stampShape(ctx, x, y, size, shape) {
  const half = size / 2
  ctx.beginPath()
  if (shape === 'circle') {
    ctx.arc(x, y, half, 0, Math.PI * 2)
  } else if (shape === 'square') {
    ctx.rect(x - half, y - half, size, size)
  } else if (shape === 'triangle') {
    const h = (Math.sqrt(3) / 2) * size
    const x1 = x
    const y1 = y - h / 2
    const x2 = x - half
    const y2 = y + h / 2
    const x3 = x + half
    const y3 = y + h / 2
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.closePath()
  } else {
    ctx.arc(x, y, half, 0, Math.PI * 2)
  }
  ctx.fill()
}

export function stampLine(ctx, x0, y0, x1, y1, size, shape) {
  const dx = x1 - x0
  const dy = y1 - y0
  const dist = Math.hypot(dx, dy)
  const step = Math.max(1, size * 0.35)
  const steps = Math.max(1, Math.ceil(dist / step))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = x0 + dx * t
    const y = y0 + dy * t
    stampShape(ctx, x, y, size, shape)
  }
}

export function strokeShapeOutline(ctx, x, y, size, shape) {
  const half = size / 2
  ctx.beginPath()
  if (shape === 'circle') {
    ctx.arc(x, y, half, 0, Math.PI * 2)
  } else if (shape === 'square') {
    ctx.rect(x - half, y - half, size, size)
  } else if (shape === 'triangle') {
    const h = (Math.sqrt(3) / 2) * size
    const x1 = x
    const y1 = y - h / 2
    const x2 = x - half
    const y2 = y + h / 2
    const x3 = x + half
    const y3 = y + h / 2
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.closePath()
  } else {
    ctx.arc(x, y, half, 0, Math.PI * 2)
  }
  ctx.stroke()
}


