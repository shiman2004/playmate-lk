import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Loader, Upload, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const AMENITIES_OPTIONS = [
  'Air Conditioning', 'Changing Rooms', 'Parking', 'Cafe', 'WiFi',
  'Locker', 'First Aid', 'Pro Shop', 'Coaching Available',
  'Equipment Rental', 'Cafeteria', 'Video Analysis',
  'Bowling Machine', 'Spectator Area', 'Coaching'
]

export default function VenueOwnerEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { ownedVenueId } = useAuth()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
    amenities: [],
    images: [''],
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Security check — venue owner can only edit their own venue
    if (ownedVenueId && id !== ownedVenueId) {
      toast.error('You can only edit your own venue')
      navigate('/venue-dashboard')
      return
    }
    fetchVenue()
  }, [id, ownedVenueId])

  const fetchVenue = async () => {
    setFetching(true)
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        description: data.description || '',
        amenities: data.amenities || [],
        images: data.images?.length ? data.images : [''],
      })
    } catch (err) {
      toast.error('Failed to load venue')
      navigate('/venue-dashboard')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const toggleAmenity = (item) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(item)
        ? prev.amenities.filter(a => a !== item)
        : [...prev.amenities, item],
    }))
  }

  const handleImageChange = (index, value) => {
    const updated = [...form.images]
    updated[index] = value
    setForm(prev => ({ ...prev, images: updated }))
  }

  const addImageField = () => {
    if (form.images.length < 5) {
      setForm(prev => ({ ...prev, images: [...prev.images, ''] }))
    }
  }

  const removeImageField = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('venue-images')
        .upload(fileName, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage
        .from('venue-images')
        .getPublicUrl(fileName)
      setForm(prev => ({
        ...prev,
        images: [...prev.images.filter(img => img.trim() !== ''), data.publicUrl]
      }))
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Venue name is required')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase
        .from('venues')
        .update({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          description: form.description.trim(),
          amenities: form.amenities,
          images: form.images.filter(img => img.trim() !== ''),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
      toast.success('Venue updated successfully!')
      navigate('/venue-dashboard')
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-dark-950 pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-dark-700 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-dark-950 min-h-screen pt-16">
      <div className="container-custom py-8 max-w-2xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/venue-dashboard"
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-4xl text-white">
              EDIT <span className="text-gradient">VENUE</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Update your venue information
            </p>
          </div>
        </div>

        {/* Info notice */}
        <div className="mb-5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-blue-400 text-xs">
            ℹ️ You can edit your venue name, contact info, description, amenities and images.
            Pricing and location changes must be requested from the Super Admin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Info */}
          <div className="card space-y-4">
            <h2 className="text-white font-heading font-semibold text-xl pb-2 border-b border-white/5">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Venue Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Venue name"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your venue..."
                rows={4}
                className="input resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+94 77 123 4567"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="info@venue.lk"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="card space-y-4">
            <h2 className="text-white font-heading font-semibold text-xl pb-2 border-b border-white/5">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_OPTIONS.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    form.amenities.includes(amenity)
                      ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                      : 'bg-dark-800 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="card space-y-4">
            <h2 className="text-white font-heading font-semibold text-xl pb-2 border-b border-white/5">
              Images
            </h2>

            {/* Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Upload from device
              </label>
              <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                uploading
                  ? 'border-primary-500/50 bg-primary-500/5'
                  : 'border-white/10 hover:border-primary-500/40 hover:bg-primary-500/5'
              }`}>
                <Upload size={18} className="text-primary-400 shrink-0" />
                <div>
                  <p className="text-slate-300 text-sm font-medium">
                    {uploading ? 'Uploading...' : 'Click to upload image'}
                  </p>
                  <p className="text-slate-600 text-xs">JPG, PNG, WEBP — max 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Previews */}
            {form.images.filter(img => img.trim()).length > 0 && (
              <div>
                <p className="text-slate-500 text-xs mb-2">Current images:</p>
                <div className="flex flex-wrap gap-3">
                  {form.images.filter(img => img.trim()).map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt=""
                        className="w-24 h-24 rounded-xl object-cover border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageField(form.images.indexOf(img))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URL input */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Or paste image URL
              </label>
              <div className="space-y-2">
                {form.images.map((img, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={img}
                      onChange={e => handleImageChange(index, e.target.value)}
                      placeholder="https://..."
                      className="input text-sm"
                    />
                    {form.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {form.images.length < 5 && (
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    + Add another URL
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-8">
            <Link
              to="/venue-dashboard"
              className="btn-secondary flex-1 text-center text-sm py-3.5"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-3.5"
            >
              {loading ? (
                <><Loader size={16} className="animate-spin" /> Saving...</>
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}