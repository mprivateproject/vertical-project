/* global liff */
// ════════════════════════════════════════════════════════
// liffSyncClient — production-grade LIFF API layer
//
// • Gets a FRESH idToken on every request (no caching)
// • Retries once on 401 with a new token
// • Blocks requests if LIFF not logged in
// ════════════════════════════════════════════════════════

const API_BASE = '/api/apps/69df58a04843389be3df3f2e'
const TIMEOUT = 15000

// ─────────────────────────────────────────────────────────
// Token — always fetched fresh from liff, never cached
// ─────────────────────────────────────────────────────────
function getFreshToken() {
  if (typeof liff === 'undefined') {
    throw new Error('LIFF_NOT_LOADED')
  }
  if (!liff.isLoggedIn()) {
    console.warn('🔄 liffSyncClient: not logged in → redirect')
    liff.login()
    return null
  }
  const token = liff.getIDToken()
  if (!token) {
    throw new Error('NO_ID_TOKEN')
  }
  console.log('🔑 liffSyncClient: fresh idToken length:', token.length)
  return token
}

// ─────────────────────────────────────────────────────────
// Core request with auto-retry on 401
// ─────────────────────────────────────────────────────────
async function request(config, isRetry = false) {
  const token = getFreshToken()
  if (!token) return // login redirect happened

  const url = API_BASE + config.url
  console.log('🚀 API REQUEST', { action: config.data?.action, retry: isRetry })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)

  let res
  try {
    res = await fetch(url, {
      method: config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: config.data ? JSON.stringify(config.data) : undefined,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  // Auto-retry once on 401 — token may have just expired
  if (res.status === 401 && !isRetry) {
    console.warn('⚠️ liffSyncClient: 401 received — retrying with fresh token')
    return request(config, true)
  }

  if (!res.ok) {
    const text = await res.text()
    console.error('❌ API ERROR', { action: config.data?.action, status: res.status, body: text })
    throw Object.assign(new Error(text || `HTTP ${res.status}`), { status: res.status })
  }

  const data = await res.json()
  console.log('✅ API RESPONSE', { action: config.data?.action, status: res.status })
  return data
}

// ─────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────
export const liffSyncClient = {
  syncCustomer(payload = {}) {
    return request({
      url: '/functions/liffSync',
      method: 'POST',
      data: { action: 'syncCustomer', profile: payload },
    })
  },

  call({ url, method = 'POST', data }) {
    return request({ url, method, data })
  },
}

// Legacy export — no longer needed but kept for safety
export function setLiffToken() {
  // no-op: token is now fetched fresh on each request
}