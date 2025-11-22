export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function drawImageContain(ctx, img, canvas) {
  const canvasW = canvas.width
  const canvasH = canvas.height
  const scale = Math.min(canvasW / img.width, canvasH / img.height)
  const dw = Math.floor(img.width * scale)
  const dh = Math.floor(img.height * scale)
  const dx = Math.floor((canvasW - dw) / 2)
  const dy = Math.floor((canvasH - dh) / 2)
  ctx.drawImage(img, dx, dy, dw, dh)
  return { x: dx, y: dy, width: dw, height: dh }
}


