import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiLogin, apiMe } from '../api/client'

interface AuthUser {
  id: string
  email: string
  nombre: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'cafelog_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    apiMe()
      .then(({ usuario }) => setUser(usuario))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function onUnauthorized() {
      setUser(null)
    }
    window.addEventListener('cafelog:unauthorized', onUnauthorized)
    return () => window.removeEventListener('cafelog:unauthorized', onUnauthorized)
  }, [])

  async function login(email: string, password: string) {
    const { token, usuario } = await apiLogin(email, password)
    localStorage.setItem(TOKEN_KEY, token)
    setUser(usuario)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
