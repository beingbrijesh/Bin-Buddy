import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import App from './App'
// Import styles
import './index.css'

// Create future flags object for React Router
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find the root element')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter {...router}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <App />
      </LocalizationProvider>
    </BrowserRouter>
  </React.StrictMode>
)
