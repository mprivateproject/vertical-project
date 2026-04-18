/* global liff */

// ⚙️ CONFIG
const API_BASE = '/api/apps/69df58a04843389be3df3f2e'
const TIMEOUT = 10000
const MAX_RETRY = 2

let isRefreshing = false

const sleep = (ms) => new Promise(res => setTimeout(res, ms))

// 🔐 token
async function getValidIdToken() {
  if (!liff.isLoggedIn()) {
    throw new Error('LIFF not logged in')
  }

  let token = liff.getIDToken()

  if (!token) {
    console.warn('⚠️ Token missing → re-init LIFF')
    await liff.init({ liffId: '2009806106-7u8AyzZg' })
    token = liff.getIDToken()
  }

  if (!token) throw new Error('No ID Token')

  return token
}

// ⏱ timeout wrapper
function fetchWithTimeout(url, options, timeout) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ])
}

// 📡 request
async function requestWithRetry(config, retryCount = 0) {
  try {
    const token = await getValidIdToken()

    const url = API_BASE + config.url

    console.log('🚀 LIFF REQUEST:', {
      url,
      method: config.method,
      retryCount,
    })

    const res = await fetchWithTimeout(url, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(config.headers || {})
      },
      body: config.data ? JSON.stringify(config.data) : undefined,
    }, TIMEOUT)

    if (!res.ok) {
      const text = await res.text()
      throw { status: res.status, message: text }
    }

    const data = await res.json()

    console.log('✅ LIFF RESPONSE:', { url, data })

    return data

  } catch (err) {
    const status = err.status

    console.error('❌ LIFF ERROR:', {
      url: config.url,
      status,
      retryCount,
      message: err.message,
    })

    const shouldRetry =
      retryCount < MAX_RETRY &&
      (status === 401 || status === 429 || !status)

    if (shouldRetry) {
      if (status === 401 && !isRefreshing) {
        isRefreshing = true

        console.warn('🔄 Refreshing LIFF session...')
        try {
          await liff.logout()
          liff.login()
          await sleep(1500)
        } catch (e) {
          console.error('Refresh failed', e)
        }

        isRefreshing = false
      }

      await sleep(500 * (retryCount + 1))
      return requestWithRetry(config, retryCount + 1)
    }

    throw err
  }
}

// 🎯 API
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

  async getMe() {
    return requestWithRetry({
      url: '/entities/User/me',
      method: 'GET',
    })
  },
}