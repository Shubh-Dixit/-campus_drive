import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './components/DashboardLayout'
import StudentDashboard from './pages/StudentDashboard'
import QuestionsPage from './pages/QuestionsPage'
import QuestionDetail from './pages/QuestionDetail'
import Leaderboard from './pages/Leaderboard'
import AdminDashboard from './pages/AdminDashboard'
import ManageQuestions from './pages/ManageQuestions'
import ManageCategories from './pages/ManageCategories'
import ManageUsers from './pages/ManageUsers'

/**
 * Componente raíz de la aplicación.
 * Define las rutas y protege las que requieren autenticación.
 */
function App() {
  const { isAuthenticated, loading, isAdmin, isAdminOrSubAdmin } = useAuth()

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Register />
      } />

      {/* Rutas protegidas con layout */}
      <Route element={
        isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />
      }>
        {/* Dashboard principal - según rol */}
        <Route path="/" element={
          isAdmin() ? <AdminDashboard /> : <StudentDashboard />
        } />
        
        {/* Rutas de estudiante */}
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Rutas de admin/subadmin */}
        <Route path="/admin" element={
          isAdminOrSubAdmin() ? <AdminDashboard /> : <Navigate to="/" replace />
        } />
        <Route path="/admin/questions" element={
          isAdminOrSubAdmin() ? <ManageQuestions /> : <Navigate to="/" replace />
        } />
        <Route path="/admin/categories" element={
          isAdminOrSubAdmin() ? <ManageCategories /> : <Navigate to="/" replace />
        } />
        <Route path="/admin/users" element={
          isAdmin() ? <ManageUsers /> : <Navigate to="/" replace />
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
