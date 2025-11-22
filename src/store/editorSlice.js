import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  brushSize: 40,
  brushShape: 'circle', // 'circle' | 'square' | 'triangle'
  zoom: 1, // 0.25 - 8
  imageSrc: null,
  history: { canUndo: false, canRedo: false },
  showOriginal: false,
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setBrushSize(state, action) {
      state.brushSize = clamp(Number(action.payload) || 1, 1, 200)
    },
    setBrushShape(state, action) {
      const next = String(action.payload || 'circle')
      state.brushShape = ['circle', 'square', 'triangle'].includes(next) ? next : 'circle'
    },
    setZoom(state, action) {
      state.zoom = clamp(Number(action.payload) || 1, 0.25, 8)
    },
    setImageSrc(state, action) {
      state.imageSrc = action.payload || null
    },
    setHistory(state, action) {
      const next = action.payload || {}
      state.history = {
        canUndo: Boolean(next.canUndo),
        canRedo: Boolean(next.canRedo),
      }
    },
    setShowOriginal(state, action) {
      state.showOriginal = Boolean(action.payload)
    },
    resetEditorState() {
      return { ...initialState }
    },
  },
})

export const {
  setBrushSize,
  setBrushShape,
  setZoom,
  setImageSrc,
  setHistory,
  setShowOriginal,
  resetEditorState,
} = editorSlice.actions

export default editorSlice.reducer


