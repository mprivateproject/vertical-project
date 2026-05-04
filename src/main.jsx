import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

if (import.meta.env.DEV) {
  const _nativeFetch = window.fetch.bind(window)
  window.fetch = new Proxy(_nativeFetch, {
    apply(target, thisArg, args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url ?? ''
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

function hideSplash() {
  const splash = document.getElementById('splash')
  if (!splash) return
  splash.style.transition = 'opacity 0.25s ease'
  splash.style.opacity = '0'
  setTimeout(() => splash.remove(), 250)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App onReady={hideSplash} />
)