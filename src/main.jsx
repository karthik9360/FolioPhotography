import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { installImageFallback } from './lib/imageFallback'
import './styles/index.css'

// Demo photographs come from a free placeholder host; if it is unreachable, draw stand-ins locally.
installImageFallback()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
