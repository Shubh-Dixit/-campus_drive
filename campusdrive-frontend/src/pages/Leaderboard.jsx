import { useState, useEffect } from 'react'
import { leaderboardApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Trophy, Medal, TrendingUp } from 'lucide-react'

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const res = await leaderboardApi.get()
        setEntries(res.data)
      } catch (err) {
        console.error('Error loading leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLeaderboard()
  }, [])

  const getRankClass = (rank) => {
    if (rank === 1) return 'gold'
    if (rank === 2) return 'silver'
    if (rank === 3) return 'bronze'
    return 'default'
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={24} style={{ color: 'var(--color-medium)' }} />
            Leaderboard
          </h1>
          <p className="page-subtitle">Top performers on the platform</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <TrendingUp size={64} />
          <h3 style={{ marginTop: '0.5rem', fontWeight: 600 }}>No data yet</h3>
          <p style={{ fontSize: '0.85rem' }}>Complete questions to appear on the leaderboard</p>
        </div>
      ) : (
        <div className="card">
          {entries.map((entry, i) => (
            <div
              key={entry.userId}
              className={`leaderboard-item animate-fade-in ${
                entry.userId === user?.userId ? '' : ''
              }`}
              style={{
                animationDelay: `${i * 0.05}s`,
                ...(entry.userId === user?.userId && {
                  background: 'rgba(99, 102, 241, 0.08)',
                  borderRadius: 12,
                }),
              }}
            >
              <div className={`leaderboard-rank ${getRankClass(entry.rank)}`}>
                {entry.rank <= 3 ? (
                  <Medal size={16} />
                ) : (
                  entry.rank
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 600, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  {entry.userName}
                  {entry.userId === user?.userId && (
                    <span style={{
                      fontSize: '0.65rem', padding: '0.1rem 0.4rem',
                      borderRadius: 6, background: 'var(--color-primary)',
                      color: 'white', fontWeight: 600,
                    }}>
                      YOU
                    </span>
                  )}
                </div>
              </div>

              <div style={{
                fontWeight: 700, fontSize: '1rem',
                color: 'var(--color-primary)',
              }}>
                {entry.completedCount}
                <span style={{
                  fontSize: '0.7rem', fontWeight: 500,
                  color: 'var(--text-muted)', marginLeft: 4,
                }}>
                  solved
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
