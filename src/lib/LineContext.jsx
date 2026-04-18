/* global liff */
// ════════════════════════════════════════════════════════
// LineContext — SINGLE SOURCE OF TRUTH for LIFF auth
//
// RULES (enforced here, nowhere else):
//   • liff.init / liff.isLoggedIn / liff.getIDToken / liff.getProfile
//     are called ONLY inside this file.
//   • syncCustomer is called ONCE here after ready === true.
//   • Token is injected into liffSyncClient here.
//   • Components must only consume { ready, loading, profile, ... }
// ════════════════════════════════════════════════════════
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { liffSyncClient, setLiffToken } from '@/lib/liffSyncClient'

const LineContext = createContext(null)

const LIFF_ID = '2009806106-7u8AyzZg'

export const LineProvider = ({ children }) => {
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [error, setError] = useState(null)

  // Guards: no double-init, no double-sync
  const initDoneRef = useRef(false)
  const initPromiseRef = useRef(null)
  const syncDoneRef = useRef(false)

  // ── LIFF init ──────────────────────────────────────────
  const initLiff = () => {
    if (initDoneRef.current) return Promise.resolve()
    if (initPromiseRef.current) return initPromiseRef.current

    initPromiseRef.current = (async () => {
      try {
        console.log('🔄 LIFF: init start')
        await liff.init({ liffId: LIFF_ID })
        console.log('✅ LIFF: init success')

        if (!liff.isLoggedIn()) {
          console.warn('🔄 LIFF: not logged in → redirect')
          liff.login()
          return // page will reload
        }

        const [prof, token] = await Promise.all([
          liff.getProfile(),
          Promise.resolve(liff.getIDToken()),
        ])

        if (!token) throw new Error('No ID Token after LIFF login')

        // Inject token into client BEFORE setting ready
        setLiffToken(token)

        setProfile(prof)
        setReady(true)
        console.log('✅ LIFF: ready', { userId: prof?.userId })

      } catch (err) {
        console.error('❌ LIFF: init error', err)
        setError(err)
      } finally {
        setLoading(false)
        initDoneRef.current = true
      }
    })()

    return initPromiseRef.current
  }

  // Bootstrap once on mount
  useEffect(() => {
    initLiff()
  }, [])

  // ── Auto-sync customer (once, after ready) ─────────────
  useEffect(() => {
    if (!ready) return
    if (syncDoneRef.current) return
    syncDoneRef.current = true

    console.log('🔄 SYNC: start')
    liffSyncClient.syncCustomer({
      displayName: profile?.displayName,
      pictureUrl: profile?.pictureUrl,
      userId: profile?.userId,
    }).then(result => {
      console.log('✅ SYNC: done')
      if (result?.customer) setCustomer(result.customer)
    }).catch(err => {
      console.error('❌ SYNC: failed', err)
    })
  }, [ready])

  // ── Logout ─────────────────────────────────────────────
  const logout = () => {
    setLiffToken(null)
    if (typeof liff !== 'undefined' && liff.isLoggedIn()) {
      liff.logout()
      window.location.reload()
    }
  }

  return (
    <LineContext.Provider value={{
      ready,
      loading,
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