'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  phone: string
  name: string | null
  role: string
  profileImage?: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const res = await axios.get('/api/users/profile')
      setUser(res.data.data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshUser() }, [])

  const logout = async () => {
    await axios.post('/api/auth/logout')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
