import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { questionsApi, categoriesApi, activityApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  BookOpen, CheckCircle, Bookmark, BookmarkCheck,
  Filter, ChevronLeft, ChevronRight, Search, Target,
  Code, FileText
} from 'lucide-react'
import AdComponent from '../components/AdComponent'

/**
 * Dashboard del estudiante estilo LeetCode.
 * Muestra estadísticas, filtros, y lista de preguntas con paginación.
 */
export default function StudentDashboard() {
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Paginación para Bookmarks
  const [page, setPage] = useState(0)

  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  // Cargar categorías y estadísticas al montar
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [catRes, statsRes] = await Promise.all([
          categoriesApi.getAll(),
          activityApi.getStats(),
        ])
        setCategories(catRes.data)
        setStats(statsRes.data)
      } catch (err) {
        console.error('Error loading initial data:', err)
      }
    }
    loadInitialData()
  }, [])

  // Cargar preguntas cacheadas/bookmarked
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true)
      try {
        const params = {
          page,
          size: 10,
          bookmarkedOnly: true,
        }
        const res = await questionsApi.getAll(params)
        setQuestions(res.data.content)
        setTotalPages(res.data.totalPages)
        setTotalElements(res.data.totalElements)
      } catch (err) {
        console.error('Error loading questions:', err)
      } finally {
        setLoading(false)
      }
    }
    loadQuestions()
  }, [page])

  const handleToggleComplete = async (e, questionId) => {
    e.stopPropagation()
    // Optimistic update
    const previousQuestions = [...questions]
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, completed: !q.completed } : q
    ))

    try {
      await activityApi.markCompleted(questionId)
      const statsRes = await activityApi.getStats()
      setStats(statsRes.data)
    } catch (err) {
      // Revert on error
      setQuestions(previousQuestions)
      showToast('Failed to update progress', 'error')
    }
  }

  const handleToggleBookmark = async (e, questionId) => {
    e.stopPropagation()
    const previousQuestions = [...questions]
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, bookmarked: !q.bookmarked } : q
    ))

    try {
      await activityApi.toggleBookmark(questionId)
      const statsRes = await activityApi.getStats()
      setStats(statsRes.data)
    } catch (err) {
      setQuestions(previousQuestions)
      showToast('Failed to update bookmark', 'error')
    }
  }



  return (
    <div className="page-container">
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back! Here is your progress so far.
          </p>
        </div>
      </div>

      {/* Google Ad - Top Section */}
      <AdComponent className="dashboard-ad-top" />

      {/* Tarjetas de estadísticas */}
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
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.15))'
            }}>
              <CheckCircle size={22} style={{ color: 'var(--color-easy)' }} />
            </div>
            <div>
              <div className="stat-card-value">{stats.completedByUser}</div>
              <div className="stat-card-label">Completed</div>
            </div>
          </div>

          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="stat-card-icon" style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.15))'
            }}>
              <Bookmark size={22} style={{ color: 'var(--color-medium)' }} />
            </div>
            <div>
              <div className="stat-card-value">{stats.bookmarkedByUser}</div>
              <div className="stat-card-label">Bookmarked</div>
            </div>
          </div>

          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="stat-card-icon" style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(8,145,178,0.15))'
            }}>
              <Target size={22} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <div className="stat-card-value">
                {stats.totalQuestions > 0
                  ? Math.round((stats.completedByUser / stats.totalQuestions) * 100)
                  : 0}%
              </div>
              <div className="stat-card-label">Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Google Ad - Middle Section */}
      <AdComponent className="dashboard-ad-middle" />

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Your Bookmarked Questions</h2>
        {totalElements > 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You have {totalElements} bookmarked questions.</p>
        )}
      </div>

      {/* Lista de preguntas bookmarked */}
      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
        </div>
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <Bookmark size={64} style={{ opacity: 0.5 }} />
          <h3 style={{ marginTop: '0.5rem', fontWeight: 600 }}>No Bookmarks Yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
             Star questions from the Questions page to see them here!
          </p>
          <button 
             className="btn btn-primary" 
             style={{ marginTop: '1rem' }}
             onClick={() => navigate('/questions')}
          >
             Browse Questions
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`question-card animate-fade-in ${q.completed ? 'completed' : ''}`}
              style={{ animationDelay: `${i * 0.03}s` }}
              onClick={() => navigate(`/questions/${q.id}`)}
            >
              {/* Estado de completitud */}
              <button
                className={`question-status ${q.completed ? 'done' : ''}`}
                onClick={(e) => handleToggleComplete(e, q.id)}
                title={q.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {q.completed && <CheckCircle size={14} />}
              </button>

              {/* Título */}
              <div className="question-title">{q.title}</div>

              {/* Badge de tipo */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                padding: '0.15rem 0.5rem', borderRadius: 6,
                fontSize: '0.65rem', fontWeight: 600, flexShrink: 0,
                background: q.questionType === 'CODING'
                  ? 'rgba(6,182,212,0.12)' : 'rgba(148,163,184,0.1)',
                color: q.questionType === 'CODING'
                  ? 'var(--color-accent)' : 'var(--text-muted)',
              }}>
                {q.questionType === 'CODING' ? <Code size={10} /> : <FileText size={10} />}
                {q.questionType === 'CODING' ? 'CODE' : 'THEORY'}
              </span>

              {/* Categoría y dificultad */}
              <span className="category-badge">{q.categoryName}</span>
              <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>
                {q.difficulty}
              </span>

              {/* Bookmark */}
              <button
                className="btn btn-ghost btn-icon"
                onClick={(e) => handleToggleBookmark(e, q.id)}
                title={q.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                style={{ color: q.bookmarked ? 'var(--color-medium)' : 'var(--text-muted)' }}
              >
                {q.bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum = i
            if (totalPages > 7) {
              if (page < 4) pageNum = i
              else if (page > totalPages - 5) pageNum = totalPages - 7 + i
              else pageNum = page - 3 + i
            }
            return (
              <button
                key={pageNum}
                className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum + 1}
              </button>
            )
          })}

          <button
            className="pagination-btn"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Google Ad - Bottom Section */}
      <AdComponent className="dashboard-ad-bottom" />
    </div>
  )
}