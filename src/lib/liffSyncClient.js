// ════════════════════════════════════════════════════════
// liffSyncClient — LIFF-first API layer
// • Does NOT import or call liff directly
// • Token is injected by LineContext after LIFF is ready
// • All requests are blocked until token is set
// ════════════════════════════════════════════════════════

const API_BASE = '/api/apps/69df58a04843389be3df3f2e'
const TIMEOUT = 10000

// 🔑 Token store — set ONLY by LineContext after ready === true
let _token = null

export function setLiffToken(token) {
  _token = token
  console.log('🔑 liffSyncClient: token registered', !!token)
}

function getToken() {
  return _token
}

// ─────────────────────────────────────────────────────────
// Core request — no liff calls, token-gated
// ─────────────────────────────────────────────────────────
async function request(config) {
  const token = getToken()

  if (!token) {
    console.warn('🚫 liffSyncClient: blocked — token not ready')
    return Promise.reject(new Error('TOKEN_NOT_READY'))
  }

  const url = API_BASE + config.url

  console.log('🚀 API REQUEST', { action: config.data?.action, url })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const res = await fetch(url, {
      method: config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: config.data ? JSON.stringify(config.data) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (!res.ok) {
      const text = await res.text()
      throw Object.assign(new Error(text), { status: res.status })
    }

    const data = await res.json()
    console.log('✅ API RESPONSE', { action: config.data?.action, status: res.status })
    return data

  } catch (err) {
    clearTimeout(timer)
    console.error('❌ API ERROR', { action: config.data?.action, message: err?.message })
    throw err
  }
}

// ─────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────
export const liffSyncClient = {
  /** Called once by LineContext after LIFF ready */
  syncCustomer(payload = {}) {
    return request({
      url: '/functions/liffSync',
      method: 'POST',
      data: { action: 'syncCustomer', ...payload },
    })
  },

  /** General-purpose call for all other actions */
  call({ url, method = 'POST', data }) {
    return request({ url, method, data })
  },
}