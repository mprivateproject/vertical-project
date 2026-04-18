/* global liff */
import { createContext, useContext, useEffect, useRef, useState } from 'react'

const LineContext = createContext(null)

export const LineProvider = ({ children }) => {
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [idToken, setIdToken] = useState(null)
  const [error, setError] = useState(null)

  // 🔒 กัน init ซ้ำ + กัน race
  const initPromiseRef = useRef(null)
  const initializedRef = useRef(false)

  const LIFF_ID = '2009806106-7u8AyzZg'

  const initLiff = async () => {
    if (initializedRef.current) return
    if (initPromiseRef.current) return initPromiseRef.current

    initPromiseRef.current = (async () => {
      try {
        console.log('🔄 LIFF: init start')

        await liff.init({ liffId: LIFF_ID })

        console.log('✅ LIFF: init success')

        if (!liff.isLoggedIn()) {
          console.warn('🔄 LIFF: redirect to login')
          liff.login()
          return // redirect ออกจากหน้า
        }

        const [prof, token] = await Promise.all([
          liff.getProfile(),
          liff.getIDToken(),
        ])

        if (!token) {
          throw new Error('No ID Token after login')
        }

        setProfile(prof)
        setIdToken(token)
        setReady(true)

        console.log('✅ LIFF: ready', {
          userId: prof?.userId,
          hasToken: !!token,
        })

      } catch (err) {
        console.error('❌ LIFF: init error', err)
        setError(err)
      } finally {
        setLoading(false)
        initializedRef.current = true
      }
    })()

    return initPromiseRef.current
  }

  // 🚀 bootstrap ครั้งเดียว
  useEffect(() => {
    initLiff()
  }, [])

  // 🔁 expose helper (เผื่อ manual refresh)
  const refresh = async () => {
    console.warn('🔄 LIFF: manual refresh')
    initializedRef.current = false
    initPromiseRef.current = null
    setReady(false)
    setLoading(true)
    return initLiff()
  }

  const value = {
    ready,
    loading,
    profile,
    idToken,
    error,
    refresh,
  }

  return (
    <LineContext.Provider value={value}>
      {children}
    </LineContext.Provider>
  )
}

export const useLine = () => {
  const ctx = useContext(LineContext)
  if (!ctx) throw new Error('useLine must be used within LineProvider')
  return ctx
}