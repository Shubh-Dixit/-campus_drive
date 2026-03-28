import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(name, email, password)
      showToast('Account created successfully!', 'success')
      navigate('/')
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="sidebar-logo-icon" style={{
            width: 56, height: 56, fontSize: '1.25rem',
            margin: '0 auto 1rem',
          }}>CD</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Campus Drive and start preparing</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)'
              }} />
              <input
                id="register-name"
                type="text"
                className="form-input"
                style={{ paddingLeft: 36, width: '100%' }}
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)'
              }} />
              <input
                id="register-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: 36, width: '100%' }}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)'
              }} />
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ paddingLeft: 36, paddingRight: 36, width: '100%' }}
                placeholder="Create a password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '1.5rem',
          fontSize: '0.85rem', color: 'var(--text-muted)'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
