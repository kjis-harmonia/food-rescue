import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { DataProvider } from './context/DataContext'
import { initAnalytics } from './lib/analytics'
import './index.css'

// Auto-updates the cached app shell in the background; the next navigation
// picks up the new version with no manual "refresh to update" step.
registerSW({ immediate: true })

// No-ops until a real analytics SDK is wired in (see lib/analytics.ts).
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </BrowserRouter>
  </StrictMode>,
)
