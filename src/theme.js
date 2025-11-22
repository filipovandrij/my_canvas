import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f7f9fc' },
  },
  shape: {
    borderRadius: 10,
  },
})

export default theme


