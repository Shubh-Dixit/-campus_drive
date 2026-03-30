import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import AdComponent from './AdComponent'
import {
  LayoutDashboard, BookOpen, Trophy, Users, FolderOpen,
  LogOut, ChevronLeft, ChevronRight, Sun, Moon,
  Search, Menu, Shield
} from 'lucide-react'

/**
 * Layout principal con sidebar colapsable y navbar.
 * Los anuncios solo se muestran en páginas de usuario normal (no admin).
 */
export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isAdmin, isAdminOrSubAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  // Determinar si la ruta actual es una página de administración
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Los anuncios se muestran SOLO si el usuario no es admin/subadmin
  const showAds = !isAdminOrSubAdmin()

  // Links del sidebar según rol
  const navLinks = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { path: '/questions', icon: BookOpen, label: 'Questions', show: true },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard', show: true },
    { type: 'divider', show: isAdminOrSubAdmin() },
    { type: 'label', label: 'ADMIN', show: isAdminOrSubAdmin() },
    { path: '/admin', icon: Shield, label: 'Admin Panel', show: isAdminOrSubAdmin() },
    { path: '/admin/questions', icon: BookOpen, label: 'Manage Questions', show: isAdminOrSubAdmin() },
    { path: '/admin/categories', icon: FolderOpen, label: 'Manage Categories', show: isAdminOrSubAdmin() },
    { path: '/admin/users', icon: Users, label: 'Manage Users', show: isAdmin() },
  ]

  return (
    <div className="layout">
      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 35 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">CD</div>
          <span>Campus Drive</span>
        </div>

        <nav className="sidebar-nav">
          {navLinks.filter(l => l.show).map((link, i) => {
            if (link.type === 'divider') {
              return <div key={i} style={{ height: 1, background: 'var(--border-color)', margin: '0.5rem 0' }} />
            }
            if (link.type === 'label') {
              return (
                <div key={i} style={{
                  fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)',
                  padding: '0.25rem 1rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  {link.label}
                </div>
              )
            }
            const Icon = link.icon
            return (
              <div
                key={link.path}
                className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => { navigate(link.path); setMobileOpen(false) }}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </div>
            )
          })}
        </nav>

        {/* ──────────────────────────────────────
            Anuncio Sidebar — visible solo para usuarios normales
            ────────────────────────────────────── */}
        {showAds && (
          <div className="sidebar-ad-slot">
            <AdComponent type="sidebar" />
          </div>
        )}
      </aside>

      {/* ── Main content area ── */}
      <div className="main-content">

        {/* ── Navbar ── */}
        <header className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="btn btn-ghost btn-icon mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              id="mobile-menu-btn"
            >
              <Menu size={20} />
            </button>
            <div className="navbar-search">
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search questions..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    navigate(`/questions?search=${encodeURIComponent(e.target.value)}`)
                  }
                }}
              />
            </div>
          </div>

          <div className="navbar-actions">
            <button
              className="btn btn-ghost btn-icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              id="theme-toggle"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 0.75rem', borderRadius: 10,
              background: 'var(--bg-tertiary)', cursor: 'default',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '0.7rem', fontWeight: 700,
              }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{user?.role}</div>
              </div>
            </div>

            <button
              className="btn btn-ghost btn-icon"
              onClick={handleLogout}
              aria-label="Logout"
              id="logout-btn"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* ──────────────────────────────────────
            Anuncio Banner Superior — aparece en todas las páginas de usuario normal
            ────────────────────────────────────── */}
        {showAds && (
          <div className="top-banner-ad-slot">
            <AdComponent type="banner" />
          </div>
        )}

        {/* ── Contenido de la página (Outlet) ── */}
        <main>
          <Outlet />
        </main>

        {/* ──────────────────────────────────────
            Anuncio Footer — aparece al final de cada página para usuarios normales
            ────────────────────────────────────── */}
        {showAds && (
          <div className="footer-ad-slot">
            <AdComponent type="footer" />
          </div>
        )}
      </div>
    </div>
  )
}
