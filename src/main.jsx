import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// ════════════════════════════════════════════════════════
// 🚨 FETCH GUARD — dev only, blocks direct /entities/ calls
//
// Fixes applied vs original:
//   1. Wrapped in import.meta.env.DEV — stripped from prod builds entirely
//   2. URL check is scoped to same-origin calls only, skipping all
//      external requests (LIFF SDK, analytics, CDNs) with zero overhead
// ════════════════════════════════════════════════════════
if (import.meta.env.DEV) {
  const _nativeFetch = window.fetch.bind(window)
  window.fetch = new Proxy(_nativeFetch, {
    apply(target, thisArg, args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url ?? ''

      // Only inspect same-origin requests — skip all external URLs fast
      const isSameOrigin = url.startsWith('/') || url.startsWith(window.location.origin)
      if (isSameOrigin && url.includes('/entities/')) {
        const msg = `🚫 FORBIDDEN: Direct /entities/ call blocked → ${url}`
        console.error(msg)
        throw new Error(msg)
      }

      return target.apply(thisArg, args)
    },
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
