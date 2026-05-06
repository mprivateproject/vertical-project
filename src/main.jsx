import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// ─── DEV guard: block direct /entities/ calls ─────────────────────────────────
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

// ─── Root error boundary ──────────────────────────────────────────────────────
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[RootErrorBoundary]', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100dvh',
          background: '#080604', color: 'rgba(229,211,179,0.7)',
          fontFamily: 'Inter, system-ui, sans-serif', gap: '12px', padding: '24px'
        }}>
          <p style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Something went wrong</p>
          <p style={{ fontSize: '11px', opacity: 0.5, textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px', padding: '8px 20px', borderRadius: '100px',
              border: '1px solid rgba(229,211,179,0.3)', background: 'transparent',
              color: 'rgba(229,211,179,0.7)', fontSize: '11px',
              letterSpacing: '0.08em', cursor: 'pointer'
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Splash screen hide ───────────────────────────────────────────────────────
function hideSplash() {
  const splash = document.getElementById('splash')
  if (!splash) return
  splash.style.transition = 'opacity 0.25s ease'
  splash.style.opacity = '0'
  setTimeout(() => splash.remove(), 250)
}

// ─── Mount ────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App onReady={hideSplash} />
    </RootErrorBoundary>
  </React.StrictMode>
)
