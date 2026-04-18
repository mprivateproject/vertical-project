/* global liff */

// ⚙️ CONFIG
const API_BASE = '/api/apps/69df58a04843389be3df3f2e'
const TIMEOUT = 10000
const MAX_RETRY = 2

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function fetchWithTimeout(url, options, timeout) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ])
}

// 🔐 ดึง token แบบปลอดภัย (ไม่ init ซ้ำ)
function getTokenOrThrow() {
  if (typeof liff === 'undefined') {
    throw new Error('LIFF not loaded')
  }

  if (!liff.isLoggedIn()) {
    liff.login()
    throw new Error('Redirecting to login')
  }

  const token = liff.getIDToken()
  if (!token) {
    throw new Error('Missing ID Token')
  }

  return token
}

// 📡 core request
async function requestWithRetry(config, retryCount = 0) {
  const url = API_BASE + config.url

  try {
    const token = getTokenOrThrow()

    console.log('🚀 LIFF API REQUEST', {
      url,
      method: config.method,
      retryCount,
    })

    const res = await fetchWithTimeout(
      url,
      {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(config.headers || {}),
        },
        body: config.data ? JSON.stringify(config.data) : undefined,
      },
      TIMEOUT
    )

    if (!res.ok) {
      const text = await res.text()
      throw { status: res.status, message: text }
    }

    const data = await res.json()

    console.log('✅ LIFF API RESPONSE', {
      url,
      status: res.status,
    })

    return data

  } catch (err) {
    const status = err?.status

    console.error('❌ LIFF API ERROR', {
      url,
      status,
      retryCount,
      message: err?.message,
    })

    const shouldRetry =
      retryCount < MAX_RETRY &&
      (status === 401 || status === 429 || !status)

    if (shouldRetry) {
      if (status === 401) {
        console.warn('🔄 401 → forcing re-login')
        try {
          liff.logout()
          liff.login()
        } catch {}
      }

      await sleep(500 * (retryCount + 1))
      return requestWithRetry(config, retryCount + 1)
    }

    throw err
  }
}

// 🎯 public API
export const liffSyncClient = {
  async syncCustomer(payload = {}) {
    return requestWithRetry({
      url: '/functions/liffSync',
      method: 'POST',
      data: {
        action: 'syncCustomer',
        ...payload,
      },
    })
  },

  async call({ url, method = 'GET', data, params }) {
    return requestWithRetry({
      url,
      method,
      data,
      params,
    })
  },
}