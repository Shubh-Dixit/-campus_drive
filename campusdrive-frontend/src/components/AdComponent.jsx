import { useEffect, useRef, useState, memo } from 'react'
import { useAdConfig } from '../hooks/useAdConfig'

// Leer credenciales desde variables de entorno (Vite)
const AD_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || ''
const AD_SLOTS = {
  banner: import.meta.env.VITE_ADSENSE_SLOT_BANNER || '',
  sidebar: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || '',
  inline: import.meta.env.VITE_ADSENSE_SLOT_INLINE || '',
  footer: import.meta.env.VITE_ADSENSE_SLOT_FOOTER || '',
}

// Dimensiones fijas por tipo para evitar layout shift (CLS)
const AD_DIMENSIONS = {
  banner:  { minHeight: '90px',  width: '100%' },
  sidebar: { minHeight: '250px', width: '100%' },
  inline:  { minHeight: '100px', width: '100%' },
  footer:  { minHeight: '90px',  width: '100%' },
}

// Colores del placeholder de desarrollo
const DEV_COLORS = {
  banner:  { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.25)',  label: '📢 Banner Ad (728×90)' },
  sidebar: { bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.25)',   label: '📌 Sidebar Ad (300×250)' },
  inline:  { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  label: '📋 Inline Ad (468×60)' },
  footer:  { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.25)',  label: '🦶 Footer Ad (728×90)' },
}

/**
 * Componente de anuncio reutilizable con carga diferida (IntersectionObserver).
 *
 * Props:
 *   type  - 'banner' | 'sidebar' | 'inline' | 'footer'
 *   style - estilos adicionales opcionales para el contenedor
 *
 * Uso:
 *   <AdComponent type="banner" />
 *   <AdComponent type="inline" />
 */
const AdComponent = memo(function AdComponent({ type = 'banner', style = {} }) {
  const { adsEnabled, loading } = useAdConfig()
  const containerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [adPushed, setAdPushed] = useState(false)

  const isDev = !AD_CLIENT || !AD_SLOTS[type]
  const dimensions = AD_DIMENSIONS[type] || AD_DIMENSIONS.banner

  // Cargar el anuncio solo cuando el contenedor entra al viewport
  useEffect(() => {
    if (!adsEnabled || loading) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // Pre-cargar 200px antes de que sea visible
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [adsEnabled, loading])

  // Inicializar AdSense solo una vez por slot visible
  useEffect(() => {
    if (!isVisible || adPushed || isDev) return

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      setAdPushed(true)
    } catch (err) {
      console.error('[AdComponent] AdSense push error:', err)
    }
  }, [isVisible, adPushed, isDev])

  // No renderizar nada si los anuncios están desactivados o cargando
  if (loading || !adsEnabled) return null

  return (
    <div
      ref={containerRef}
      className={`ad-container ad-${type}`}
      style={style}
      aria-label="Advertisement"
      role="complementary"
    >
      {/* Modo desarrollo: mostrar placeholder visual */}
      {isDev ? (
        <DevAdPlaceholder type={type} />
      ) : (
        // Modo producción: renderizar slot de AdSense solo cuando es visible
        isVisible && (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client={AD_CLIENT}
            data-ad-slot={AD_SLOTS[type]}
            data-ad-format={type === 'sidebar' ? 'auto' : 'horizontal'}
            data-full-width-responsive="true"
          />
        )
      )}
    </div>
  )
})

/**
 * Placeholder visual para desarrollo (cuando no hay credenciales de AdSense).
 * Muestra claramente el tipo y tamaño del anuncio esperado.
 */
function DevAdPlaceholder({ type }) {
  const config = DEV_COLORS[type] || DEV_COLORS.banner

  return (
    <div
      className="ad-dev-placeholder"
      style={{
        width: '100%',
        height: '100%',
        background: config.bg,
        border: `1.5px dashed ${config.border}`,
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        {config.label}
      </span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.7 }}>
        Set VITE_ADSENSE_CLIENT &amp; VITE_ADSENSE_SLOT_{type.toUpperCase()} to activate
      </span>
    </div>
  )
}

export default AdComponent
