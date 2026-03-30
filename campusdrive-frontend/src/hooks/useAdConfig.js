import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

/**
 * Hook que determina si los anuncios deben mostrarse para el usuario actual.
 * - Consulta el endpoint de configuración del backend.
 * - Oculta anuncios para roles ADMIN y SUBADMIN.
 * - Provee un fallback seguro si el endpoint falla.
 */
export function useAdConfig() {
  const { user, isAdminOrSubAdmin } = useAuth()
  const [adsEnabled, setAdsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // No mostrar anuncios a administradores
    if (isAdminOrSubAdmin()) {
      setAdsEnabled(false)
      setLoading(false)
      return
    }

    const fetchConfig = async () => {
      try {
        const res = await api.get('/ads/config')
        setAdsEnabled(res.data?.adsEnabled ?? true)
      } catch (err) {
        // Si el endpoint falla, habilitamos los anuncios por defecto
        console.warn('Ad config endpoint not reachable, defaulting to enabled.', err.message)
        setAdsEnabled(true)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [user])

  return { adsEnabled, loading }
}
