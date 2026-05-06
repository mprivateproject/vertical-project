/// <reference path="../liff-globals.d.ts" />
// ════════════════════════════════════════════════════════
// liffSyncClient — production-grade LIFF API layer
//
// KEY INSIGHT: liff.getIDToken() returns a JWT that expires
// in ~10 minutes and CANNOT be refreshed — only a new login
// produces a new token. Therefore:
//
// • Public actions (services, therapists) → no auth needed
// • Private actions (syncCustomer, bookings) → send idToken
// • Admin actions → ALWAYS require idToken (not public)
// • On 401 → force re-login (only cure for expired token)
// ════════════════════════════════════════════════════════

const API_BASE = '/api/apps/69df58a04843389be3df3f2e'
const TIMEOUT  = 15000

// Actions that do NOT require LINE identity verification (calendar browse / catalog only)
// NOTE: Admin actions are intentionally excluded — they must always send an idToken
// so that server-side RLS can verify the caller has an admin role.
const PUBLIC_ACTIONS = new Set([
  'getServices',
  'getTherapists',
  'getServiceById',
  'getBookingsByDate',
  'getBookingsByDateRange',
  'getAvailabilitySlots',
])

// ───────────────────────────────────────────────────────
// Get fresh idToken — null if not logged in
// ───────────────────────────────────────────────────────
function getIdToken() {
  if (typeof liff === 'undefined' || !liff.isLoggedIn()) return null
  return liff.getIDToken() || null
}

// ───────────────────────────────────────────────────────
// Force re-login — only called when token is truly expired
// ───────────────────────────────────────────────────────
function forceRelogin(reason) {
  console.warn('🔄 liffSyncClient: forcing re-login —', reason)
  if (typeof liff !== 'undefined') {
    liff.logout()
    liff.login({ redirectUri: window.location.href })
  }
}

// ───────────────────────────────────────────────────────
// Core request — no retry loop, 401 = re-login
// ───────────────────────────────────────────────────────
async function request(config) {
  const action   = config.data?.action
  const isPublic = PUBLIC_ACTIONS.has(action)

  // Build headers
  const headers = { 'Content-Type': 'application/json' }

  if (!isPublic) {
    // Private / admin action — must have a valid idToken
    if (typeof liff === 'undefined') {
      throw new Error('LIFF_NOT_LOADED')
    }
    if (!liff.isLoggedIn()) {
      console.warn('🔄 liffSyncClient: not logged in for private action, redirecting...')
      liff.login({ redirectUri: window.location.href })
      return
    }
    const token = getIdToken()
    if (!token) {
      forceRelogin('no idToken available')
      return
    }
    console.log('🔑 liffSyncClient: attaching idToken, length:', token.length, 'action:', action)
    headers['Authorization'] = `Bearer ${token}`
  } else {
    console.log('🌐 liffSyncClient: public action, no auth needed:', action)
  }

  const url = API_BASE + config.url
  console.log('🚀 API REQUEST', { action, ts: new Date().toISOString() })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)

  let res
  try {
    res = await fetch(url, {
      method:  config.method || 'POST',
      headers,
      body:    config.data ? JSON.stringify(config.data) : undefined,
      signal:  controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  // 401 on a private action = token expired → force re-login (no retry)
  if (res.status === 401 && !isPublic) {
    const body = await res.text()
    console.error('❌ liffSyncClient: 401 on private action — token expired, forcing re-login', body)
    forceRelogin('TOKEN_EXPIRED')
    return
  }

  if (!res.ok) {
    const text = await res.text()
    console.error('❌ API ERROR', { action, status: res.status, body: text })
    throw Object.assign(new Error(text || `HTTP ${res.status}`), { status: res.status })
  }

  const data = await res.json()
  console.log('✅ API RESPONSE', { action, status: res.status })
  return data
}

// ───────────────────────────────────────────────────────
// Public API
// ───────────────────────────────────────────────────────
export const liffSyncClient = {
  syncCustomer(payload = {}) {
    return request({
      url:    '/functions/liffSync',
      method: 'POST',
      data:   { action: 'syncCustomer', profile: payload },
    })
  },
  call({ url, method = 'POST', data }) {
    return request({ url, method, data })
  },
}

// Legacy no-op — token is now fetched fresh on each request
export function setLiffToken() {}
