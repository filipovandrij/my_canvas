import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SidebarTabs from '../components/SidebarTabs.jsx'
import CollageCanvas from '../features/collage/CollageCanvas.jsx'
import { Button, Stack, MenuItem, FormControl, InputLabel, Select } from '@mui/material'
import { useState } from 'react'

function CollagePage() {
  const { t } = useTranslation()
  const canvasRef = useRef(null)
  const [size, setSize] = useState({ w: 1280, h: 720 })
  const [preset, setPreset] = useState('yt')

  const presets = [
    { key: 'yt', label: t('preset_youtube'), w: 1280, h: 720 },
    { key: '16:9', label: 'Presentation 16:9', w: 1920, h: 1080 },
    { key: '1:1', label: 'Square 1:1', w: 1080, h: 1080 },
    { key: '9:16', label: 'Story 9:16', w: 1080, h: 1920 },
    { key: '4:3', label: 'Classic 4:3', w: 1600, h: 1200 },
  ]

  function applyPreset(key) {
    const p = presets.find((x) => x.key === key)
    if (!p) return
    setSize({ w: p.w, h: p.h })
  }

  return (
    <div className="page">
      <div className="editor">
        <aside className="sidebar">
          <SidebarTabs />
          <Stack spacing={1}>
            <div className="control" style={{ opacity: 0.8 }}>
              {t('collageHint')}
            </div>
            <FormControl fullWidth size="small">
              <InputLabel id="preset-label">{t('preset')}</InputLabel>
              <Select
                labelId="preset-label"
                label={t('preset')}
                value={preset}
                onChange={(e) => {
                  setPreset(e.target.value)
                  applyPreset(e.target.value)
                }}
              >
                {presets.map((p) => (
                  <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Only presets, no manual width/height */}
            <Button variant="contained" component="label" size="small">
              {t('upload')}
              <input
                type="file"
                accept="image/*"
                hidden
                multiple
                onChange={(e) => {
                  const files = e.target.files
                  if (files && files.length) {
                    canvasRef.current?.addFiles(files)
                    e.target.value = ''
                  }
                }}
              />
            </Button>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => canvasRef.current?.setSelectedAsBackground()}
              >
                {t('setAsBackground')}
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => canvasRef.current?.clearBackground()}
              >
                {t('clearBackground')}
              </Button>
            </Stack>
          </Stack>
        </aside>
        <div className="canvas-wrap">
          <CollageCanvas
            ref={canvasRef}
            canvasWidth={size.w}
            canvasHeight={size.h}
          />
          <div style={{ position: 'absolute', right: 12, bottom: 12, display: 'flex', gap: 8 }}>
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                const dataUrl = await canvasRef.current?.exportPNG()
                if (!dataUrl) return
                const a = document.createElement('a')
                a.href = dataUrl
                a.download = 'collage.png'
                document.body.appendChild(a)
                a.click()
                a.remove()
              }}
            >
              {t('downloadCollage')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollagePage


