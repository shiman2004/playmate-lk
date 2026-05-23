import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Loader, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setSent(true)
      toast.success('Reset link sent to your email!')
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
            <span className="text-black font-display text-xl leading-none">S</span>
        </div>
            <span className="font-display text-3xl tracking-wide">
            <span className="text-white">SPOR</span>
            <span className="text-primary-400">TIVE</span>
            <span className="text-white">.LK</span>
            </span>
          </Link>
          <h1 className="font-heading font-bold text-3xl text-white">
            {sent ? 'Email Sent!' : 'Forgot Password'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {sent
              ? 'Check your inbox for the reset link'
              : 'Enter your email to reset your password'
            }
          </p>
        </div>

        <div className="card border border-white/5">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-primary-400" />
              </div>
              <p className="text-slate-400 text-sm mb-6">
                We sent a password reset link to{' '}
                <strong className="text-white">{email}</strong>.
                Check your inbox and spam folder.
              </p>
              <Link to="/login" className="btn-primary w-full block text-center py-3">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-9"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader size={16} className="animate-spin" /> Sending...</>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-5">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-slate-500 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}