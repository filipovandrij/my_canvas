
import { Routes, Route, Navigate } from 'react-router-dom'
import EditorPage from './pages/EditorPage.jsx'
import CollagePage from './pages/CollagePage.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/eraser" replace />} />
        <Route path="/eraser" element={<EditorPage />} />
        <Route path="/collage" element={<CollagePage />} />
        <Route path="*" element={<Navigate to="/eraser" replace />} />
      </Routes>
    </>
  )
}

export default App
