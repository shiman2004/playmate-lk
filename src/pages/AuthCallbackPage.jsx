import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        if (!session) {
          navigate('/login')
          return
        }

        // ✅ Check if this is an EXISTING user (has a profile with phone)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, phone, full_name')
          .eq('id', session.user.id)
          .single()

        // If no profile or no phone — this is a new Google signup
        // We don't allow that — sign them out and redirect to register
        if (!profile || !profile.phone) {
          await supabase.auth.signOut()
          navigate('/register?error=google_new_user')
          return
        }

        // ✅ Existing user — redirect based on role
        if (profile.role === 'venue_owner') {
          navigate('/venue-dashboard', { replace: true })
        } else if (profile.role === 'super_admin' || profile.role === 'admin') {
          navigate('/admin', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        navigate('/login')
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 text-sm mt-4">Signing you in...</p>
      </div>
    </div>
  )
}