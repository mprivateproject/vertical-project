import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// ════════════════════════════════════════════════════════
// 🚨 GLOBAL FETCH GUARD — blocks any /entities/ call
// This fires BEFORE any component mounts.
// ════════════════════════════════════════════════════════
const _nativeFetch = window.fetch.bind(window)
window.fetch = new Proxy(_nativeFetch, {
  apply(target, thisArg, args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url ?? ''
    if (url.includes('/entities/')) {
      const msg = `🚫 FORBIDDEN: Direct /entities/ call blocked → ${url}`
      console.error(msg)
      throw new Error(msg)
    }
    return target.apply(thisArg, args)
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)