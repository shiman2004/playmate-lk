import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import VenuesPage from './pages/VenuesPage'
import VenueDetailsPage from './pages/VenueDetailsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminVenueFormPage from './pages/AdminVenueFormPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VenueOwnerEditPage from './pages/VenueOwnerEditPage'
import VenueOwnerDashboard from './pages/VenueOwnerDashboard'
import AuthCallbackPage from './pages/AuthCallbackPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Auth pages (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Main layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="venues" element={<VenuesPage />} />
            <Route path="venues/:id" element={<VenueDetailsPage />} />
            <Route path="about" element={<AboutPage />} />

            {/* Protected routes */}
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute superAdminOnly>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="admin/venues/new" element={
              <ProtectedRoute superAdminOnly>
                <AdminVenueFormPage />
              </ProtectedRoute>
            } />
            <Route path="admin/venues/edit/:id" element={
              <ProtectedRoute superAdminOnly>
                <AdminVenueFormPage />
              </ProtectedRoute>
            } />
            <Route path="venue-dashboard" element={
              <ProtectedRoute venueOwnerOnly>
                <VenueOwnerDashboard />
              </ProtectedRoute>
            } />
            <Route path="venue-owner/edit/:id" element={
              <ProtectedRoute venueOwnerOnly>
                <VenueOwnerEditPage />
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
