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
/* global liff */
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { liffSyncClient } from '@/lib/liffSyncClient'

const LineContext = createContext(null)
const LIFF_ID = '2009806106-7u8AyzZg'

export const LineProvider = ({ children, onReady }) => {
  const [loading, setLoading] = useState(true)
  const [ready,   setReady]   = useState(false)
  const [synced,  setSynced]  = useState(false)
  const [profile, setProfile] = useState(null)
  const [customer,setCustomer]= useState(null)
  const [error,   setError]   = useState(null)

  const initDoneRef = useRef(false)
  const syncDoneRef = useRef(false)

  // ── Step 1: LIFF init + login ────────────────────────────
  useEffect(() => {
    if (initDoneRef.current) return
    initDoneRef.current = true

    ;(async () => {
      try {
        console.log('🔄 LIFF: init start')
        await liff.init({ liffId: LIFF_ID , withLoginOnExternalBrowser : true})
        console.log('✅ LIFF: init success')

        if (!liff.isLoggedIn()) {
          console.warn('🔄 LIFF: not logged in → redirect')
          liff.login()
          return
        }

        const idToken = liff.getIDToken()
        if (!idToken) throw new Error('No ID Token after LIFF login')

        const prof = await liff.getProfile()
        setProfile(prof)
        setReady(true)
        console.log('✅ LIFF: ready', { userId: prof?.userId })

      } catch (err) {
        console.error('❌ LIFF: init error', err)
        setError(err)
        onReady?.() // ← ซ่อน splash แม้ error
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // ── Step 2: syncCustomer ─────────────────────────────────
  useEffect(() => {
    if (!ready) return
    if (syncDoneRef.current) return
    syncDoneRef.current = true

    console.log('🔄 SYNC: syncCustomer start')

    liffSyncClient.syncCustomer({
      displayName: profile?.displayName,
      pictureUrl:  profile?.pictureUrl,
    }).then(result => {
      console.log('✅ SYNC: done', { customerId: result?.customer?.id })
      if (result?.customer) setCustomer(result.customer)
      setSynced(true)
      onReady?.() // ← ซ่อน splash หลัง sync เสร็จสมบูรณ์
    }).catch(err => {
      console.error('❌ SYNC: failed', err)
      setSynced(true)
      onReady?.() // ← ซ่อน splash แม้ sync fail
    })
  }, [ready])

  const logout = () => {
    if (typeof liff !== 'undefined' && liff.isLoggedIn()) {
      liff.logout()
      window.location.reload()
    }
  }

  return (
    <LineContext.Provider value={{ loading, ready, synced, profile, customer, error, logout }}>
      {children}
    </LineContext.Provider>
  )
}

export const useLine = () => {
  const ctx = useContext(LineContext)
  if (!ctx) throw new Error('useLine must be used within LineProvider')
  return ctx
}