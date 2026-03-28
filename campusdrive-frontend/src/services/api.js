import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor para agregar token JWT a cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar errores 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/* ============================================
   Auth API
   ============================================ */
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

/* ============================================
   Questions API
   ============================================ */
export const questionsApi = {
  getAll: (params) => api.get('/questions', { params }),
  getById: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
}

/* ============================================
   Categories API
   ============================================ */
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

/* ============================================
   Admin API
   ============================================ */
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role?role=${role}`),
  getStats: () => api.get('/admin/stats'),
}

/* ============================================
   Activity / Bookmarks API
   ============================================ */
export const activityApi = {
  markCompleted: (questionId) => api.post(`/activity/${questionId}/complete`),
  toggleBookmark: (questionId) => api.post(`/bookmarks/${questionId}/toggle`),
  getCompleted: () => api.get('/activity/completed'),
  getBookmarks: () => api.get('/bookmarks'),
  getStats: () => api.get('/dashboard/stats'),
}

/* ============================================
   Leaderboard API
   ============================================ */
export const leaderboardApi = {
  get: () => api.get('/leaderboard'),
}

export default api
