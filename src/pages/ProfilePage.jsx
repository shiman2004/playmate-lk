import { useState, useEffect } from 'react'
import { User, Phone, Mail, Save, Loader, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '', phone: '', bio: '', city: ''
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '', confirmPassword: ''
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        city: profile.city || '',
      })
    }
  }, [profile])

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  const handlePasswordChange = e => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setPasswordError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(formData)
      toast.success('Profile updated successfully!')
      setSaved(true)
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })
      if (error) throw error
      toast.success('Password changed successfully!')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const avatar = (profile?.full_name || user?.email)?.[0]?.toUpperCase()

  // Password strength
  const getPasswordStrength = (p) => {
    if (!p) return null
    if (p.length < 6) return { level: 1, label: 'Weak', color: 'bg-red-500' }
    if (p.length < 8) return { level: 2, label: 'Fair', color: 'bg-yellow-500' }
    if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)) return { level: 4, label: 'Strong', color: 'bg-primary-500' }
    return { level: 3, label: 'Good', color: 'bg-blue-500' }
  }
  const strength = getPasswordStrength(passwordForm.newPassword)

  return (
    <div className="bg-dark-950 min-h-screen pt-16">
      <div className="container-custom py-8 max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl text-white mb-8">
          MY <span className="text-gradient">PROFILE</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar section */}
          <div className="md:col-span-1">
            <div className="card text-center">
              <div className="w-24 h-24 rounded-2xl bg-primary-500/20 border-2 border-primary-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="font-display text-5xl text-primary-400">{avatar}</span>
              </div>
              <p className="text-white font-semibold">{profile?.full_name || 'Player'}</p>
              <p className="text-slate-500 text-xs mt-0.5 truncate">{user?.email}</p>

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-center gap-1.5 text-xs text-primary-400">
                  <CheckCircle size={13} />
                  <span>Email Verified</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-dark-800 text-left">
                <p className="text-slate-500 text-xs mb-1">Member Since</p>
                <p className="text-white text-sm font-semibold">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-LK', { month: 'long', year: 'numeric' })
                    : 'May 2025'}
                </p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="md:col-span-2 space-y-5">
            {/* Personal Info Form */}
            <div className="card">
              <h2 className="text-white font-heading font-semibold text-xl mb-5">
                Personal Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="input pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input pl-9 opacity-50 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-slate-600 text-xs mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+94 77 123 4567"
                      className="input pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">City</label>
                  <select name="city" value={formData.city} onChange={handleChange} className="input">
                    <option value="" className="bg-dark-900">Select your city</option>
                    {['Colombo', 'Nugegoda', 'Kandy', 'Galle', 'Kelaniya', 'Negombo', 'Matara', 'Jaffna', 'Kurunegala', 'Ratnapura'].map(c => (
                      <option key={c} value={c} className="bg-dark-900">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about your favourite sports..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader size={16} className="animate-spin" /> Saving...</>
                  ) : saved ? (
                    <><CheckCircle size={16} /> Saved!</>
                  ) : (
                    <><Save size={16} /> Save Changes</>
                  )}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="card">
              <h2 className="text-white font-heading font-semibold text-xl mb-5">
                Change Password
              </h2>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Min. 8 characters"
                      className="input pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {strength && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.level ? strength.color : 'bg-dark-700'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">{strength.label} password</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Repeat new password"
                      className="input pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {passwordForm.confirmPassword && (
                    <p className={`text-xs mt-1 ${passwordForm.newPassword === passwordForm.confirmPassword ? 'text-primary-400' : 'text-red-400'}`}>
                      {passwordForm.newPassword === passwordForm.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                {/* Error */}
                {passwordError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {passwordError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className={`w-full py-3.5 flex items-center justify-center gap-2 font-semibold rounded-xl transition-all ${
                    passwordLoading || !passwordForm.newPassword || !passwordForm.confirmPassword
                      ? 'bg-dark-700 text-slate-600 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {passwordLoading ? (
                    <><Loader size={16} className="animate-spin" /> Updating Password...</>
                  ) : (
                    <><Lock size={16} /> Change Password</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}