import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { questionsApi, activityApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Editor from '@monaco-editor/react'
import {
  ArrowLeft, CheckCircle, Bookmark, BookmarkCheck, Code,
  Clock, HardDrive, FileText, Terminal, AlertTriangle
} from 'lucide-react'

/**
 * Página de detalle de una pregunta individual.
 * Muestra descripción, campos de coding (si aplica), solución, y un editor Monaco.
 */
export default function QuestionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAnswer, setShowAnswer] = useState(false)
  const [editorValue, setEditorValue] = useState('// Write your solution here\n\n')

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const res = await questionsApi.getById(id)
        setQuestion(res.data)
        // Si tiene boilerplate code, usarlo como valor inicial del editor
        if (res.data.boilerplateCode) {
          setEditorValue(res.data.boilerplateCode)
        }
      } catch (err) {
        showToast('Question not found', 'error')
        navigate('/questions')
      } finally {
        setLoading(false)
      }
    }
    loadQuestion()
  }, [id])

  const handleComplete = async () => {
    try {
      await activityApi.markCompleted(question.id)
      setQuestion(prev => ({ ...prev, completed: !prev.completed }))
      showToast(
        question.completed ? 'Marked as incomplete' : 'Marked as complete!',
        'success'
      )
    } catch (err) {
      showToast('Failed to update', 'error')
    }
  }

  const handleBookmark = async () => {
    try {
      await activityApi.toggleBookmark(question.id)
      setQuestion(prev => ({ ...prev, bookmarked: !prev.bookmarked }))
    } catch (err) {
      showToast('Failed to update bookmark', 'error')
    }
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    )
  }

  if (!question) return null

  const isCoding = question.questionType === 'CODING'

  // Determinar lenguaje del editor Monaco según la pregunta
  const editorLanguage = (() => {
    const lang = question.programmingLanguage || 'java'
    const langMap = {
      java: 'java', python: 'python', cpp: 'cpp',
      javascript: 'javascript', c: 'c', go: 'go',
    }
    return langMap[lang] || 'java'
  })()

  return (
    <div className="page-container" style={{ maxWidth: 960 }}>
      {/* Navegación */}
      <button
        className="btn btn-ghost"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1rem' }}
      >
        <ArrowLeft size={18} />
        Back to Questions
      </button>

      <div className="animate-fade-in">
        {/* Encabezado de la pregunta */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: '1rem',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '0.5rem', flexWrap: 'wrap',
              }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>
                  {question.title}
                </h1>
                <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
                  {question.difficulty}
                </span>
                {/* Badge de tipo */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.2rem 0.6rem', borderRadius: 8,
                  fontSize: '0.7rem', fontWeight: 600,
                  background: isCoding
                    ? 'rgba(6,182,212,0.12)' : 'rgba(148,163,184,0.12)',
                  color: isCoding
                    ? 'var(--color-accent)' : 'var(--text-muted)',
                }}>
                  {isCoding ? <Code size={12} /> : <FileText size={12} />}
                  {isCoding ? 'CODING' : 'THEORY'}
                </span>
              </div>
              <div style={{
                display: 'flex', gap: '0.5rem', alignItems: 'center',
                fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap',
              }}>
                <span className="category-badge">{question.categoryName}</span>
                {question.createdByName && (
                  <span>by {question.createdByName}</span>
                )}
                {/* Límites para coding */}
                {isCoding && question.timeLimitMs && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  }}>
                    <Clock size={12} /> {question.timeLimitMs}ms
                  </span>
                )}
                {isCoding && question.memoryLimitMb && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  }}>
                    <HardDrive size={12} /> {question.memoryLimitMb}MB
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn ${question.completed ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleComplete}
              >
                <CheckCircle size={16} />
                {question.completed ? 'Completed' : 'Mark Complete'}
              </button>
              <button
                className="btn btn-ghost btn-icon"
                onClick={handleBookmark}
                style={{
                  color: question.bookmarked
                    ? 'var(--color-medium)' : 'var(--text-muted)'
                }}
              >
                {question.bookmarked
                  ? <BookmarkCheck size={20} />
                  : <Bookmark size={20} />
                }
              </button>
            </div>
          </div>

          {/* Descripción / Problem Statement */}
          {question.description && (
            <div style={{
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 10,
              fontSize: '0.9rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}>
              {question.description}
            </div>
          )}
        </div>

        {/* === Sección de Coding: I/O, Constraints, Sample === */}
        {isCoding && (
          <div className="card animate-fade-in" style={{ marginBottom: '1rem' }}>
            <h2 style={{
              fontSize: '1rem', fontWeight: 600, marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: 'var(--color-accent)',
            }}>
              <Terminal size={18} />
              Problem Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Input Format */}
              {question.inputFormat && (
                <div>
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.375rem',
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>Input Format</div>
                  <div style={{
                    padding: '0.75rem', background: 'var(--bg-secondary)',
                    borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {question.inputFormat}
                  </div>
                </div>
              )}

              {/* Output Format */}
              {question.outputFormat && (
                <div>
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.375rem',
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>Output Format</div>
                  <div style={{
                    padding: '0.75rem', background: 'var(--bg-secondary)',
                    borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {question.outputFormat}
                  </div>
                </div>
              )}
            </div>

            {/* Constraints */}
            {question.constraints && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{
                  fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.375rem',
                  color: 'var(--text-muted)', textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>
                  <AlertTriangle size={12} />
                  Constraints
                </div>
                <div style={{
                  padding: '0.75rem', background: 'var(--bg-secondary)',
                  borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', fontFamily: 'monospace',
                }}>
                  {question.constraints}
                </div>
              </div>
            )}

            {/* Sample I/O */}
            {(question.sampleInput || question.sampleOutput) && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '1rem', marginTop: '1rem',
              }}>
                {question.sampleInput && (
                  <div>
                    <div style={{
                      fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.375rem',
                      color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>Sample Input</div>
                    <pre style={{
                      padding: '0.75rem', background: 'var(--bg-tertiary)',
                      borderRadius: 8, fontSize: '0.8rem', lineHeight: 1.5,
                      margin: 0, overflow: 'auto', fontFamily: 'monospace',
                      border: '1px solid var(--border-color)',
                      color: 'var(--color-easy)',
                    }}>
                      {question.sampleInput}
                    </pre>
                  </div>
                )}
                {question.sampleOutput && (
                  <div>
                    <div style={{
                      fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.375rem',
                      color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>Sample Output</div>
                    <pre style={{
                      padding: '0.75rem', background: 'var(--bg-tertiary)',
                      borderRadius: 8, fontSize: '0.8rem', lineHeight: 1.5,
                      margin: 0, overflow: 'auto', fontFamily: 'monospace',
                      border: '1px solid var(--border-color)',
                      color: 'var(--color-primary-light, var(--color-primary))',
                    }}>
                      {question.sampleOutput}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Editor Monaco — mostrar siempre para coding, opcionalmente para theory */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '0.75rem',
          }}>
            <Code size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Code Editor</h2>
            {isCoding && question.programmingLanguage && (
              <span style={{
                fontSize: '0.7rem', padding: '0.15rem 0.5rem',
                borderRadius: 6, background: 'var(--bg-tertiary)',
                color: 'var(--text-muted)', fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {question.programmingLanguage}
              </span>
            )}
          </div>
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <Editor
              height="400px"
              defaultLanguage={editorLanguage}
              theme="vs-dark"
              value={editorValue}
              onChange={(value) => setEditorValue(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Solución */}
        {question.answer && (
          <div className="card">
            <button
              className="btn btn-secondary"
              onClick={() => setShowAnswer(!showAnswer)}
              style={{ marginBottom: showAnswer ? '1rem' : 0 }}
            >
              {showAnswer ? 'Hide Solution' : 'Show Solution'}
            </button>
            {showAnswer && (
              <div style={{
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 10,
                fontSize: '0.9rem',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                animation: 'fadeIn 0.3s ease',
                fontFamily: isCoding ? 'monospace' : 'inherit',
              }}>
                {question.answer}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
