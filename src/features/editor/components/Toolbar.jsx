import { useTranslation } from 'react-i18next'
import {
  Box,
  Stack,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

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
      <Stack spacing={2}>
        <FormControl size="small">
          <InputLabel id="lang-label">{t('language')}</InputLabel>
          <Select
            labelId="lang-label"
            label={t('language')}
            value={i18n.resolvedLanguage || i18n.language || 'en'}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ru">Русский</MenuItem>
            <MenuItem value="uk">Українська</MenuItem>
            <MenuItem value="ka">ქართული</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(showOriginal)}
              onChange={onToggleShowOriginal}
              disabled={!hasImage}
              size="small"
            />
          }
          label={t('showOriginal')}
        />

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={t('undo')}>
            <span>
              <IconButton onClick={onUndo} disabled={!canUndo} size="small">
                <ArrowBackIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('redo')}>
            <span>
              <IconButton onClick={onRedo} disabled={!canRedo} size="small">
                <ArrowForwardIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Button variant="contained" component="label" size="small">
          {t('upload')}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onUpload(e.target.files?.[0] || null)}
          />
        </Button>

        <Stack spacing={1}>
          <Box sx={{ fontSize: 12, opacity: 0.8 }}>{t('size')}: {brushSize}px</Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              onClick={() => onBrushSizeChange(Math.max(1, brushSize - 1))}
            >
              −
            </Button>
            <TextField
              type="number"
              size="small"
              inputProps={{ min: 1, max: 200 }}
              value={brushSize}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (Number.isNaN(v)) return
                const clamped = Math.max(1, Math.min(200, v))
                onBrushSizeChange(clamped)
              }}
              sx={{ width: 90 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => onBrushSizeChange(Math.min(200, brushSize + 1))}
            >
              +
            </Button>
          </Stack>
        </Stack>

        <FormControl size="small">
          <InputLabel id="shape-label">{t('shape')}</InputLabel>
          <Select
            labelId="shape-label"
            label={t('shape')}
            value={brushShape}
            onChange={(e) => onBrushShapeChange(e.target.value)}
          >
            <MenuItem value="circle">{t('shape_circle')}</MenuItem>
            <MenuItem value="square">{t('shape_square')}</MenuItem>
            <MenuItem value="triangle">{t('shape_triangle')}</MenuItem>
          </Select>
        </FormControl>

        <Stack spacing={1}>
          <Box sx={{ fontSize: 12, opacity: 0.8 }}>{t('zoom')}: {Math.round(zoom * 100)}%</Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                const current = Math.round(zoom * 100)
                const nextPct = Math.max(25, current - 5)
                onZoomChange(nextPct / 100)
              }}
            >
              −
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                const current = Math.round(zoom * 100)
                const nextPct = Math.min(800, current + 5)
                onZoomChange(nextPct / 100)
              }}
            >
              +
            </Button>
          </Stack>
        </Stack>

        <Button variant="contained" disabled={!hasImage} onClick={onDownload} size="small">
          {t('download')}
        </Button>
      </Stack>
    </div>
  )
}

export default Toolbar



