/* global liff */
import { createContext, useContext, useEffect, useState } from 'react'

const LineContext = createContext(null)

export const LineProvider = ({ children }) => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ ต้อง init ก่อนทุกอย่าง
        await liff.init({
          liffId: '2009806106-7u8AyzZg'
        })

        console.log('✅ LIFF init')

        if (!liff.isLoggedIn()) {
          console.log('🔄 redirect login')
          liff.login()
          return
        }

        const prof = await liff.getProfile()
        setProfile(prof)

      } catch (e) {
        console.error('❌ LIFF init error:', e)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  return (
    <LineContext.Provider value={{ profile, loading }}>
      {children}
    </LineContext.Provider>
  )
}

export const useLine = () => {
  const ctx = useContext(LineContext)
  if (!ctx) throw new Error('useLine must be used within LineProvider')
  return ctx
}