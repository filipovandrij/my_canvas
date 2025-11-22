import { configureStore } from '@reduxjs/toolkit'
import editorReducer from './editorSlice.js'

export const store = configureStore({
  reducer: {
    editor: editorReducer,
  },
})


