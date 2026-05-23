import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!formData.fullName.trim()) return 'Full name is required'
    if (!formData.email) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Enter a valid email'
    if (!formData.phone) return 'Phone number is required'
    if (!/^(\+94|0)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) return 'Enter a valid Sri Lankan phone number'
    if (formData.password.length < 8) return 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')

    try {
      const cleanPhone = formData.phone.replace(/\s/g, '')

      // ✅ Step 1 — Check if phone already exists
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle()

      if (existingPhone) {
        setError(`Phone number ${formData.phone} is already registered. Please use a different number.`)
        setLoading(false)
        return
      }

      // ✅ Step 2 — Attempt signup
      // Supabase returns identities = [] when email already exists
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: cleanPhone,
          }
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // ✅ Step 3 — Check if email already existed
      // Supabase returns user with empty identities array for duplicate emails
      if (
        data?.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        setError(`Email ${formData.email} is already registered. Please log in instead.`)
        return
      }

      // ✅ Step 4 — Save phone to profile
      if (data?.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: formData.fullName,
            phone: cleanPhone,
          })
      }

      setSuccess(true)
      toast.success('Account created! Check your email to verify.')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const p = formData.password
    if (!p) return null
    if (p.length < 6) return { level: 1, label: 'Weak', color: 'bg-red-500' }
    if (p.length < 8) return { level: 2, label: 'Fair', color: 'bg-yellow-500' }
    if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)) return { level: 4, label: 'Strong', color: 'bg-primary-500' }
    return { level: 3, label: 'Good', color: 'bg-blue-500' }
  }

  const strength = passwordStrength()

  // ── Success screen ──
  if (success) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="card">
            <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-primary-400" />
            </div>
            <h2 className="text-white font-heading font-bold text-2xl mb-2">Account Created!</h2>
            <p className="text-slate-400 text-sm mb-6">
              We've sent a verification email to{' '}
              <strong className="text-white">{formData.email}</strong>.
              Please verify your email before logging in.
            </p>
            <Link to="/login" className="btn-primary w-full block text-center py-3">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 py-8">
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
          <h1 className="font-heading font-bold text-3xl text-white">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join thousands of players across Sri Lanka</p>
        </div>

        <div className="card border border-white/5">
          {!isSupabaseConfigured && (
            <div className="mb-5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
              <AlertCircle size={15} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-yellow-400 text-xs">
                <strong>Demo Mode:</strong> Supabase is not configured. Configure your .env to enable real auth.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Kasun Perera"
                className="input"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                className="input"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= strength.level ? strength.color : 'bg-dark-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{strength.label} password</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="input pr-10"
                />
                {formData.confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {formData.password === formData.confirmPassword
                      ? <CheckCircle size={16} className="text-primary-500" />
                      : <AlertCircle size={16} className="text-red-500" />
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-slate-600 text-xs">
              By creating an account you agree to our{' '}
              <Link to="/terms" className="text-primary-500 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader size={16} className="animate-spin" /> Checking &amp; Creating...</>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}