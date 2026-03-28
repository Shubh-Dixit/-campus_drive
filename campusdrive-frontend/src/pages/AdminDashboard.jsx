import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  BookOpen, Users, FolderOpen, TrendingUp,
  BarChart3, PieChart
} from 'lucide-react'

/**
 * Panel de administración con estadísticas generales
 * y accesos rápidos a las secciones de gestión.
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await adminApi.getStats()
        setStats(res.data)
      } catch (err) {
        console.error('Error loading admin stats:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Manage Questions',
      description: 'Create, edit, and delete questions',
      icon: BookOpen,
      path: '/admin/questions',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
    {
      title: 'Manage Categories',
      description: 'Organize questions by category',
      icon: FolderOpen,
      path: '/admin/categories',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      path: '/admin/users',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card animate-fade-in">
            <div className="stat-card-icon" style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))'
            }}>
              <BookOpen size={22} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <div className="stat-card-value">{stats.totalQuestions}</div>
              <div className="stat-card-label">Total Questions</div>
            </div>
          </div>

          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <div className="stat-card-icon" style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(8,145,178,0.15))'
            }}>
              <FolderOpen size={22} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <div className="stat-card-value">{stats.totalCategories}</div>
              <div className="stat-card-label">Categories</div>
            </div>
          </div>

          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="stat-card-icon" style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.15))'
            }}>
              <Users size={22} style={{ color: 'var(--color-medium)' }} />
            </div>
            <div>
              <div className="stat-card-value">{stats.totalUsers}</div>
              <div className="stat-card-label">Registered Users</div>
            </div>
          </div>

          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="stat-card-icon" style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.15))'
            }}>
              <TrendingUp size={22} style={{ color: 'var(--color-easy)' }} />
            </div>
            <div>
              <div className="stat-card-value">{stats.completedByUser}</div>
              <div className="stat-card-label">Your Completed</div>
            </div>
          </div>
        </div>
      )}

      {/* Distribución de dificultad */}
      {stats?.difficultyBreakdown && (
        <div className="card animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{
            fontSize: '1rem', fontWeight: 600, marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <BarChart3 size={18} style={{ color: 'var(--color-primary)' }} />
            Difficulty Distribution
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {Object.entries(stats.difficultyBreakdown).map(([diff, count]) => {
              const total = stats.totalQuestions || 1
              const percentage = Math.round((count / total) * 100)
              const colors = {
                EASY: 'var(--color-easy)',
                MEDIUM: 'var(--color-medium)',
                HARD: 'var(--color-hard)',
              }
              return (
                <div key={diff} style={{ flex: 1, minWidth: 140 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.375rem',
                  }}>
                    <span>{diff}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count}</span>
                  </div>
                  <div style={{
                    height: 8, borderRadius: 99,
                    background: 'var(--bg-tertiary)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      background: colors[diff],
                      width: `${percentage}%`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <h2 style={{
        fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem',
        color: 'var(--text-secondary)',
      }}>
        Quick Actions
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
      }}>
        {quickActions.map((action, i) => {
          const Icon = action.icon
          return (
            <div
              key={action.path}
              className="card animate-fade-in"
              style={{
                cursor: 'pointer', animationDelay: `${i * 0.05}s`,
              }}
              onClick={() => navigate(action.path)}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: action.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.75rem',
              }}>
                <Icon size={20} style={{ color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                {action.title}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {action.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
