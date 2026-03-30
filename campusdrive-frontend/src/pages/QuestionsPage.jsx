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
export default function QuestionsPage() {
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Filtros
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState(null)
  const [page, setPage] = useState(0)

  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  // Cargar categorías al montar
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const catRes = await categoriesApi.getAll()
        setCategories(catRes.data)
      } catch (err) {
        console.error('Error loading initial data:', err)
      }
    }
    loadInitialData()
  }, [])

  // Cargar preguntas con filtros
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true)
      try {
        const params = {
          page,
          size: 20,
          search: search || '',
          ...(selectedCategory && { categoryId: selectedCategory }),
          ...(selectedDifficulty && { difficulty: selectedDifficulty }),
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
  }, [page, search, selectedCategory, selectedDifficulty])

  const handleToggleComplete = async (e, questionId) => {
    e.stopPropagation()
    // Optimistic update
    const previousQuestions = [...questions]
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, completed: !q.completed } : q
    ))

    try {
      await activityApi.markCompleted(questionId)
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
    } catch (err) {
      setQuestions(previousQuestions)
      showToast('Failed to update bookmark', 'error')
    }
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0)
    }
  }

  return (
    <div className="page-container">
      {/* Encabezado */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Questions</h1>
          <p className="page-subtitle">
            {totalElements} questions available • Practice and prepare for placements
          </p>
        </div>
      </div>



      {/* Barra de filtros */}
      <div className="filter-bar">
        <div className="navbar-search" style={{ width: 280 }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          <button
            className={`filter-chip ${!selectedDifficulty ? 'active' : ''}`}
            onClick={() => { setSelectedDifficulty(null); setPage(0) }}
          >
            All
          </button>
          {['EASY', 'MEDIUM', 'HARD'].map(d => (
            <button
              key={d}
              className={`filter-chip ${selectedDifficulty === d ? 'active' : ''}`}
              onClick={() => { setSelectedDifficulty(d === selectedDifficulty ? null : d); setPage(0) }}
            >
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <select
          className="form-select"
          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', borderRadius: 99 }}
          value={selectedCategory || ''}
          onChange={(e) => {
            setSelectedCategory(e.target.value || null)
            setPage(0)
          }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Lista de preguntas (estilo LeetCode) */}
      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
        </div>
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} />
          <h3 style={{ marginTop: '0.5rem', fontWeight: 600 }}>No questions found</h3>
          <p style={{ fontSize: '0.85rem' }}>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {questions.map((q, i) => (
            <>
              {/* ── Anuncio inline cada 10 preguntas ── */}
              {i > 0 && i % 10 === 0 && (
                <div key={`ad-${i}`} style={{ padding: '0.25rem 0' }}>
                  <AdComponent type="inline" />
                </div>
              )}

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
            </>
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
    </div>
  )
}
