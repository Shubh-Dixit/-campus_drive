import { useState, useEffect } from 'react'
import { categoriesApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Plus, Edit2, Trash2, X, FolderOpen } from 'lucide-react'

export default function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const { showToast } = useToast()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await categoriesApi.getAll()
      setCategories(res.data)
    } catch (err) {
      showToast('Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setForm({ name: '', description: '' })
    setShowModal(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setForm({ name: category.name, description: category.description || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, form)
        showToast('Category updated!', 'success')
      } else {
        await categoriesApi.create(form)
        showToast('Category created!', 'success')
      }
      setShowModal(false)
      loadCategories()
    } catch (err) {
      const message = err.response?.data?.message || 'Operation failed'
      showToast(message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Questions in this category may be affected.')) return
    try {
      await categoriesApi.delete(id)
      showToast('Category deleted', 'success')
      loadCategories()
    } catch (err) {
      showToast('Failed to delete category', 'error')
    }
  }

  if (loading) {
    return <div className="loading-page"><div className="spinner" /></div>
  }

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Categories</h1>
          <p className="page-subtitle">{categories.length} categories</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={64} />
          <h3 style={{ marginTop: '0.5rem', fontWeight: 600 }}>No categories</h3>
          <p style={{ fontSize: '0.85rem' }}>Create your first category to organize questions</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className="card animate-fade-in"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                animationDelay: `${i * 0.03}s`,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cat.name}</div>
                {cat.description && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {cat.description}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEditModal(cat)}>
                  <Edit2 size={15} />
                </button>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => handleDelete(cat.id)}
                  style={{ color: 'var(--color-hard)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Category name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={3}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
