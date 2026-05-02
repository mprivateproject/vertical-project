/* global liff */
// ════════════════════════════════════════════════════════
// LineContext — SINGLE SOURCE OF TRUTH for LIFF auth
//
// State machine:
//   loading → liff.init() → login redirect (if needed)
//           → ready (liff ready + profile fetched)
//           → synced (syncCustomer completed)
//
// Components should guard on `synced` before calling API.
// ════════════════════════════════════════════════════════
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { liffSyncClient } from '@/lib/liffSyncClient'

const LineContext = createContext(null)

const LIFF_ID = '2009806106-7u8AyzZg'

// ─────────────────────────────────────────────────────────
// SANDBOX MODE — bypass LINE login entirely
// Set to false when ready to go live
// ─────────────────────────────────────────────────────────
const SANDBOX_MODE = false

export const LineProvider = ({ children }) => {
  const [loading, setLoading] = useState(!SANDBOX_MODE) // sandbox = instant
  const [ready, setReady] = useState(SANDBOX_MODE)      // sandbox = always ready
  const [synced, setSynced] = useState(SANDBOX_MODE)    // sandbox = skip sync
  const [profile, setProfile] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [error, setError] = useState(null)

  const initDoneRef = useRef(false)
  const syncDoneRef = useRef(false)

  // ── Step 1: LIFF init + login (skipped in SANDBOX_MODE) ─
  useEffect(() => {
    if (SANDBOX_MODE) return // skip entirely
    if (initDoneRef.current) return
    initDoneRef.current = true

    ;(async () => {
      try {
        console.log('🔄 LIFF: init start')
        await liff.init({ liffId: LIFF_ID })
        console.log('✅ LIFF: init success')

        if (!liff.isLoggedIn()) {
          console.warn('🔄 LIFF: not logged in → redirect')
          liff.login()
          return // page will reload after login
        }

        const idToken = liff.getIDToken()
        console.log('🔑 LIFF: idToken present:', !!idToken, 'length:', idToken?.length)

        if (!idToken) {
          throw new Error('No ID Token after LIFF login — cannot authenticate')
        }

        const prof = await liff.getProfile()
        setProfile(prof)
        setReady(true)
        console.log('✅ LIFF: ready', { userId: prof?.userId })

      } catch (err) {
        console.error('❌ LIFF: init error', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // ── Step 2: syncCustomer — skipped in SANDBOX_MODE ──────
  useEffect(() => {
    if (SANDBOX_MODE) return // skip sync in sandbox
    if (!ready) return
    if (syncDoneRef.current) return
    syncDoneRef.current = true

    console.log('🔄 SYNC: syncCustomer start')

    liffSyncClient.syncCustomer({
      displayName: profile?.displayName,
      pictureUrl: profile?.pictureUrl,
    }).then(result => {
      console.log('✅ SYNC: syncCustomer done', { customerId: result?.customer?.id })
      if (result?.customer) setCustomer(result.customer)
      setSynced(true)
    }).catch(err => {
      console.error('❌ SYNC: syncCustomer failed', err)
      setSynced(true)
    })
  }, [ready])

  // ── Logout ──────────────────────────────────────────────
  const logout = () => {
    if (typeof liff !== 'undefined' && liff.isLoggedIn()) {
      liff.logout()
      window.location.reload()
    }
  }

  return (
    <LineContext.Provider value={{
      loading,
      ready,
      synced,
      profile,
      lineProfile: profile,
      customer,
      error,
      isLoggedIn: ready,
      logout,
    }}>
      {children}
    </LineContext.Provider>
  )
}

export const useLine = () => {
  const ctx = useContext(LineContext)
  if (!ctx) throw new Error('useLine must be used within LineProvider')
  return ctx
}