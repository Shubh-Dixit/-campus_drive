import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Plus, Trash2, X, Users, Shield, ShieldCheck, User, Eye, EyeOff } from 'lucide-react'

/**
 * Gestión de usuarios - Solo ADMIN.
 * Permite crear usuarios con roles específicos (SUBADMIN, ADMIN).
 */
export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'SUBADMIN',
  })
  const { showToast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getUsers()
      setUsers(res.data)
    } catch (err) {
      showToast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await adminApi.createUser(form)
      showToast('User created!', 'success')
      setShowModal(false)
      setForm({ name: '', email: '', password: '', role: 'SUBADMIN' })
      loadUsers()
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create user'
      showToast(message, 'error')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await adminApi.deleteUser(id)
      showToast('User deleted', 'success')
      loadUsers()
    } catch (err) {
      showToast('Failed to delete user', 'error')
    }
  }

  const handleRoleChange = async (id, newRole) => {
    try {
      await adminApi.updateUserRole(id, newRole)
      showToast('Role updated!', 'success')
      loadUsers()
    } catch (err) {
      showToast('Failed to update role', 'error')
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck size={15} style={{ color: '#ef4444' }} />
      case 'SUBADMIN': return <Shield size={15} style={{ color: '#f59e0b' }} />
      default: return <User size={15} style={{ color: 'var(--text-muted)' }} />
    }
  }

  const getRoleStyle = (role) => {
    switch (role) {
      case 'ADMIN': return { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
      case 'SUBADMIN': return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }
      default: return { background: 'rgba(148,163,184,0.1)', color: 'var(--text-muted)' }
    }
  }

  if (loading) {
    return <div className="loading-page"><div className="spinner" /></div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.2rem 0.6rem', borderRadius: 8,
                    fontSize: '0.75rem', fontWeight: 600,
                    ...getRoleStyle(u.role),
                  }}>
                    {getRoleIcon(u.role)}
                    {u.role}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <select
                      className="form-select"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{ padding: '0.25rem 0.375rem', fontSize: '0.75rem', borderRadius: 6, width: 90 }}
                    >
                      <option value="USER">USER</option>
                      <option value="SUBADMIN">SUBADMIN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => handleDeleteUser(u.id)}
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

      {/* Modal crear usuario */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create User</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    style={{ paddingRight: 36, width: '100%' }}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Password (min 6 chars)"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="USER">USER</option>
                  <option value="SUBADMIN">SUBADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
