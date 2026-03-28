import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restaurar sesión desde localStorage al montar
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await authApi.login({ email, password })
    const data = response.data

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setToken(data.token)
    setUser(data)

    return data
  }

  const register = async (name, email, password) => {
    const response = await authApi.register({ name, email, password })
    const data = response.data

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setToken(data.token)
    setUser(data)

    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const isAdmin = () => user?.role === 'ADMIN'
  const isSubAdmin = () => user?.role === 'SUBADMIN'
  const isAdminOrSubAdmin = () => isAdmin() || isSubAdmin()

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      isAdmin, isSubAdmin, isAdminOrSubAdmin,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
