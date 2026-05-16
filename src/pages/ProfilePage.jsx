import { useState, useEffect } from 'react'
import { User, Phone, Mail, Save, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '', phone: '', bio: '', city: ''
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

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

  const avatar = (profile?.full_name || user?.email)?.[0]?.toUpperCase()

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

          {/* Form */}
          <div className="md:col-span-2">
            <div className="card">
              <h2 className="text-white font-heading font-semibold text-xl mb-5">Personal Information</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">
                    Full Name
                  </label>
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
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">
                    Email Address
                  </label>
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
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">
                    Phone Number
                  </label>
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
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="input"
                  >
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

            {/* Security section */}
            <div className="card mt-4">
              <h2 className="text-white font-heading font-semibold text-xl mb-4">Security</h2>
              <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-white/5">
                <div>
                  <p className="text-white text-sm font-semibold">Password</p>
                  <p className="text-slate-500 text-xs mt-0.5">Last changed: Recently</p>
                </div>
                <button className="btn-outline text-xs py-2 px-4">Change</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
