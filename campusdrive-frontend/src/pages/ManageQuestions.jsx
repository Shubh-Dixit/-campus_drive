import { useState, useEffect } from 'react'
import { questionsApi, categoriesApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Plus, Edit2, Trash2, X, BookOpen, Code, FileText } from 'lucide-react'

/**
 * Página de gestión de preguntas para ADMIN/SUBADMIN.
 * CRUD completo con selector de tipo (Theory/Coding) y campos condicionales.
 */
export default function ManageQuestions() {
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { showToast } = useToast()

  // Estado inicial del formulario con todos los campos
  const emptyForm = {
    title: '', description: '', answer: '',
    difficulty: 'EASY', categoryId: '',
    questionType: 'THEORY',
    inputFormat: '', outputFormat: '', constraints: '',
    sampleInput: '', sampleOutput: '',
    timeLimitMs: 1000, memoryLimitMb: 256,
    boilerplateCode: '', programmingLanguage: 'java',
  }

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    loadData()
  }, [page])

  const loadData = async () => {
    setLoading(true)
    try {
      const [qRes, cRes] = await Promise.all([
        questionsApi.getAll({ page, size: 20 }),
        categoriesApi.getAll(),
      ])
      setQuestions(qRes.data.content)
      setTotalPages(qRes.data.totalPages)
      setCategories(cRes.data)
    } catch (err) {
      showToast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingQuestion(null)
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id || '',
    })
    setShowModal(true)
  }

  const openEditModal = (question) => {
    setEditingQuestion(question)
    setForm({
      title: question.title,
      description: question.description || '',
      answer: question.answer || '',
      difficulty: question.difficulty,
      categoryId: question.categoryId,
      questionType: question.questionType || 'THEORY',
      inputFormat: question.inputFormat || '',
      outputFormat: question.outputFormat || '',
      constraints: question.constraints || '',
      sampleInput: question.sampleInput || '',
      sampleOutput: question.sampleOutput || '',
      timeLimitMs: question.timeLimitMs || 1000,
      memoryLimitMb: question.memoryLimitMb || 256,
      boilerplateCode: question.boilerplateCode || '',
      programmingLanguage: question.programmingLanguage || 'java',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingQuestion) {
        await questionsApi.update(editingQuestion.id, form)
        showToast('Question updated!', 'success')
      } else {
        await questionsApi.create(form)
        showToast('Question created!', 'success')
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      const message = err.response?.data?.message || 'Operation failed'
      showToast(message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return
    try {
      await questionsApi.delete(id)
      showToast('Question deleted', 'success')
      loadData()
    } catch (err) {
      showToast('Failed to delete question', 'error')
    }
  }

  const isCoding = form.questionType === 'CODING'

  if (loading) {
    return <div className="loading-page"><div className="spinner" /></div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Questions</h1>
          <p className="page-subtitle">{questions.length} questions</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Add Question
        </button>
      </div>

      {/* Tabla de preguntas */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Created</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td style={{ fontWeight: 500 }}>{q.title}</td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.2rem 0.6rem', borderRadius: 8,
                    fontSize: '0.7rem', fontWeight: 600,
                    background: q.questionType === 'CODING'
                      ? 'rgba(6,182,212,0.12)' : 'rgba(148,163,184,0.12)',
                    color: q.questionType === 'CODING'
                      ? 'var(--color-accent)' : 'var(--text-muted)',
                  }}>
                    {q.questionType === 'CODING' ? <Code size={12} /> : <FileText size={12} />}
                    {q.questionType || 'THEORY'}
                  </span>
                </td>
                <td>
                  <span className="category-badge">{q.categoryName}</span>
                </td>
                <td>
                  <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>
                    {q.difficulty}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '-'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => openEditModal(q)}
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => handleDelete(q.id)}
                      title="Delete"
                      style={{ color: 'var(--color-hard)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación simple */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ‹
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0 0.5rem' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            ›
          </button>
        </div>
      )}

      {/* ============================
          Modal crear/editar pregunta
          ============================ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: isCoding ? 680 : 560 }}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {editingQuestion ? 'Edit Question' : 'New Question'}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Selector de tipo: Theory / Coding */}
              <div className="form-group">
                <label className="form-label">Question Type</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn ${form.questionType === 'THEORY' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setForm({ ...form, questionType: 'THEORY' })}
                  >
                    <FileText size={16} />
                    Theory
                  </button>
                  <button
                    type="button"
                    className={`btn ${form.questionType === 'CODING' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setForm({ ...form, questionType: 'CODING' })}
                  >
                    <Code size={16} />
                    Coding
                  </button>
                </div>
              </div>

              {/* Campos comunes */}
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Question title"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {isCoding ? 'Problem Statement' : 'Description'}
                </label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={isCoding
                    ? 'Describe the coding problem in detail...'
                    : 'Question description...'
                  }
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Answer / Solution</label>
                <textarea
                  className="form-textarea"
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder={isCoding ? 'Reference solution code...' : 'Solution or answer...'}
                  rows={4}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              {/* ============================
                  Campos extra para CODING
                  ============================ */}
              {isCoding && (
                <div
                  className="animate-fade-in"
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '1rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    marginBottom: '1rem', color: 'var(--color-accent)',
                    fontSize: '0.8rem', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    <Code size={14} />
                    Coding-Specific Fields
                  </div>

                  {/* Lenguaje y límites */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Language</label>
                      <select
                        className="form-select"
                        value={form.programmingLanguage}
                        onChange={(e) => setForm({ ...form, programmingLanguage: e.target.value })}
                      >
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="javascript">JavaScript</option>
                        <option value="c">C</option>
                        <option value="go">Go</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time Limit (ms)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={form.timeLimitMs}
                        onChange={(e) => setForm({ ...form, timeLimitMs: parseInt(e.target.value) || 1000 })}
                        min={100}
                        max={10000}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Memory (MB)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={form.memoryLimitMb}
                        onChange={(e) => setForm({ ...form, memoryLimitMb: parseInt(e.target.value) || 256 })}
                        min={16}
                        max={1024}
                      />
                    </div>
                  </div>

                  {/* Input/Output Format */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Input Format</label>
                      <textarea
                        className="form-textarea"
                        value={form.inputFormat}
                        onChange={(e) => setForm({ ...form, inputFormat: e.target.value })}
                        placeholder="Describe the input format..."
                        rows={3}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Output Format</label>
                      <textarea
                        className="form-textarea"
                        value={form.outputFormat}
                        onChange={(e) => setForm({ ...form, outputFormat: e.target.value })}
                        placeholder="Describe the expected output..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Constraints */}
                  <div className="form-group">
                    <label className="form-label">Constraints</label>
                    <textarea
                      className="form-textarea"
                      value={form.constraints}
                      onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                      placeholder="e.g. 1 ≤ N ≤ 10^5, 1 ≤ A[i] ≤ 10^9"
                      rows={2}
                    />
                  </div>

                  {/* Sample I/O */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Sample Input</label>
                      <textarea
                        className="form-textarea"
                        value={form.sampleInput}
                        onChange={(e) => setForm({ ...form, sampleInput: e.target.value })}
                        placeholder="5&#10;1 2 3 4 5"
                        rows={3}
                        style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sample Output</label>
                      <textarea
                        className="form-textarea"
                        value={form.sampleOutput}
                        onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })}
                        placeholder="15"
                        rows={3}
                        style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>

                  {/* Boilerplate Code */}
                  <div className="form-group">
                    <label className="form-label">Boilerplate / Starter Code</label>
                    <textarea
                      className="form-textarea"
                      value={form.boilerplateCode}
                      onChange={(e) => setForm({ ...form, boilerplateCode: e.target.value })}
                      placeholder="import java.util.*;&#10;&#10;public class Solution {&#10;    public static void main(String[] args) {&#10;        // write code here&#10;    }&#10;}"
                      rows={6}
                      style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingQuestion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
