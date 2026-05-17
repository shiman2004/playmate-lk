import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

export default function ProtectedRoute({
  children,
  adminOnly = false,
  superAdminOnly = false,
  venueOwnerOnly = false,
}) {
  const { user, loading, isAdmin, isSuperAdmin, isVenueOwner } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (venueOwnerOnly && !isVenueOwner) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}