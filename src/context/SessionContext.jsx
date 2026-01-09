import { createContext, useContext, useState, useEffect } from 'react'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null)

  // Load session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('faithguard_session')
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession)
        // Check if session is still valid (not expired)
        if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          setSession(parsed)
        } else {
          // Session expired, clear it
          localStorage.removeItem('faithguard_session')
          localStorage.removeItem('faithguard_temple_code')
        }
      } catch (e) {
        localStorage.removeItem('faithguard_session')
        localStorage.removeItem('faithguard_temple_code')
      }
    }
  }, [])

  // Check session validity periodically
  useEffect(() => {
    if (!session) return

    const checkInterval = setInterval(() => {
      setSession((currentSession) => {
        if (!currentSession) return null
        if (currentSession.expiresAt && new Date(currentSession.expiresAt) <= new Date()) {
          // Session expired
          localStorage.removeItem('faithguard_session')
          localStorage.removeItem('faithguard_temple_code')
          return null
        }
        return currentSession
      })
    }, 1000) // Check every second

    return () => clearInterval(checkInterval)
  }, [session])

  const createSession = (templeCode, method = 'code') => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours from now

    const newSession = {
      id: sessionId,
      templeCode: templeCode,
      checkInMethod: method,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
    }

    setSession(newSession)
    localStorage.setItem('faithguard_session', JSON.stringify(newSession))
    localStorage.setItem('faithguard_temple_code', templeCode)
    return newSession
  }

  const clearSession = () => {
    setSession(null)
    localStorage.removeItem('faithguard_session')
    localStorage.removeItem('faithguard_temple_code')
  }

  const isSessionValid = () => {
    if (!session) return false
    if (session.expiresAt && new Date(session.expiresAt) <= new Date()) {
      clearSession()
      return false
    }
    return session.isActive === true
  }

  const getTempleCode = () => {
    return session?.templeCode || localStorage.getItem('faithguard_temple_code')
  }

  const getTimeUntilExpiry = () => {
    if (!session?.expiresAt) return null
    const expires = new Date(session.expiresAt)
    const now = new Date()
    const diff = expires - now
    return diff > 0 ? diff : 0
  }

  const value = {
    session,
    createSession,
    clearSession,
    isSessionValid,
    getTempleCode,
    getTimeUntilExpiry,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}
