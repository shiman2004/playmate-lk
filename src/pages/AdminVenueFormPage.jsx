import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CITIES = ['Colombo', 'Nugegoda', 'Kandy', 'Galle', 'Kelaniya', 'Negombo', 'Matara', 'Jaffna', 'Kurunegala', 'Ratnapura']
const SPORTS_OPTIONS = ['Futsal', 'Badminton', 'Cricket', 'Basketball', 'Table Tennis', 'Squash']
const AMENITIES_OPTIONS = ['Air Conditioning', 'Changing Rooms', 'Parking', 'Cafe', 'WiFi', 'Locker', 'First Aid', 'Pro Shop', 'Coaching Available', 'Equipment Rental', 'Cafeteria', 'Video Analysis', 'Bowling Machine', 'Spectator Area', 'Coaching']
const [uploading, setUploading] = useState(false)

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  // Max 5MB
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

    // Get public URL
    const { data } = supabase.storage
      .from('venue-images')
      .getPublicUrl(fileName)

    // Add to images array
    setForm(prev => ({
      ...prev,
      images: [...prev.images.filter(img => img), data.publicUrl]
    }))

    toast.success('Image uploaded!')
  } catch (err) {
    toast.error('Upload failed: ' + err.message)
  } finally {
    setUploading(false)
  }
}

const EMPTY_FORM = {
  name: '',
  address: '',
  city: '',
  district: '',
  phone: '',
  email: '',
  description: '',
  price_per_hour: '',
  night_surcharge: 0,
  price_cutoff_time: '17:00',
  open_time: '06:00',
  close_time: '22:00',
  is_featured: false,
  is_active: true,
  sports: [],
  amenities: [],
  images: [''],
}

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function AdminVenueFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit) fetchVenue()
  }, [id])

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
        ...data,
        price_cutoff_time: data.price_cutoff_time?.slice(0, 5) || '17:00',
        open_time: data.open_time?.slice(0, 5) || '06:00',
        close_time: data.close_time?.slice(0, 5) || '22:00',
        sports: data.sports || [],
        amenities: data.amenities || [],
        images: data.images?.length ? data.images : [''],
        night_surcharge: data.night_surcharge || 0,
      })
    } catch (err) {
      toast.error('Failed to load venue')
      navigate('/admin')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const toggleArrayItem = (field, item) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item],
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

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Venue name is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.city) e.city = 'City is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.price_per_hour) e.price_per_hour = 'Price per hour is required'
    if (form.sports.length === 0) e.sports = 'Select at least one sport'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Please fix the errors below')
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.name),
        address: form.address.trim(),
        city: form.city,
        district: form.district || form.city,
        phone: form.phone.trim(),
        email: form.email.trim(),
        description: form.description.trim(),
        price_per_hour: parseInt(form.price_per_hour),
        night_surcharge: parseInt(form.night_surcharge) || 0,
        price_cutoff_time: form.price_cutoff_time,
        open_time: form.open_time,
        close_time: form.close_time,
        is_featured: form.is_featured,
        is_active: form.is_active,
        sports: form.sports,
        amenities: form.amenities,
        images: form.images.filter(img => img.trim() !== ''),
        updated_at: new Date().toISOString(),
      }

      if (isEdit) {
        const { error } = await supabase
          .from('venues')
          .update(payload)
          .eq('id', id)
        if (error) throw error
        toast.success('Venue updated successfully!')
      } else {
        const { error } = await supabase
          .from('venues')
          .insert({ ...payload, rating: 0, review_count: 0 })
        if (error) throw error
        toast.success('Venue added successfully!')
      }

      navigate('/admin')
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
      <div className="container-custom py-8 max-w-3xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-4xl text-white">
              {isEdit ? 'EDIT' : 'ADD'} <span className="text-gradient">VENUE</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {isEdit ? 'Update venue details' : 'Add a new venue to PlayMate.lk'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Info */}
          <div className="card space-y-4">
            <h2 className="text-white font-heading font-semibold text-xl pb-2 border-b border-white/5">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Venue Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Thunder Futsal Arena"
                className="input"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the venue..."
                rows={3}
                className="input resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Address *</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. 42 Galle Road, Colombo 03"
                className="input"
              />
              {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">City *</label>
                <select name="city" value={form.city} onChange={handleChange} className="input">
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c} className="bg-dark-900">{c}</option>)}
                </select>
                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">District</label>
                <input
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="e.g. Colombo"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Phone *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+94 77 123 4567"
                  className="input"
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
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

          {/* Pricing */}
          <div className="card space-y-4">
            <h2 className="text-white font-heading font-semibold text-xl pb-2 border-b border-white/5">
              Pricing
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Day Rate (Rs/hour) *
                </label>
                <input
                  name="price_per_hour"
                  type="number"
                  value={form.price_per_hour}
                  onChange={handleChange}
                  placeholder="e.g. 3000"
                  className="input"
                />
                {errors.price_per_hour && <p className="text-red-400 text-xs mt-1">{errors.price_per_hour}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Night Surcharge (Rs)
                </label>
                <input
                  name="night_surcharge"
                  type="number"
                  value={form.night_surcharge}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className="input"
                />
                <p className="text-slate-600 text-xs mt-1">
                  Night rate = Day rate + Surcharge
                  {form.price_per_hour && form.night_surcharge > 0 && (
                    <span className="text-primary-400 ml-1">
                      = Rs {(parseInt(form.price_per_hour || 0) + parseInt(form.night_surcharge || 0)).toLocaleString()}/hr
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Night Rate Starts At
              </label>
              <input
                name="price_cutoff_time"
                type="time"
                value={form.price_cutoff_time}
                onChange={handleChange}
                className="input w-40"
              />
              <p className="text-slate-600 text-xs mt-1">
                Slots from this time onwards will use the night rate
              </p>
            </div>

            {/* Pricing preview */}
            {form.price_per_hour && (
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-dark-800 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">☀️</span>
                  <div>
                    <p className="text-slate-400 text-xs">Before {form.price_cutoff_time}</p>
                    <p className="text-white font-bold">Rs {parseInt(form.price_per_hour || 0).toLocaleString()}/hr</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌙</span>
                  <div>
                    <p className="text-slate-400 text-xs">From {form.price_cutoff_time}</p>
                    <p className="text-white font-bold">
                      Rs {(parseInt(form.price_per_hour || 0) + parseInt(form.night_surcharge || 0)).toLocaleString()}/hr
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="card space-y-4">
            <h2 className="text-white font-heading font-semibold text-xl pb-2 border-b border-white/5">
              Settings
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Opening Time</label>
                <input
                  name="open_time"
                  type="time"
                  value={form.open_time}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Closing Time</label>
                <input
                  name="close_time"
                  type="time"
                  value={form.close_time}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-11 h-6 rounded-full transition-all relative ${form.is_active ? 'bg-primary-500' : 'bg-dark-700'}`}
                  onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_active ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-slate-300 text-sm group-hover:text-white transition-colors">
                  Active (visible to users)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-11 h-6 rounded-full transition-all relative ${form.is_featured ? 'bg-primary-500' : 'bg-dark-700'}`}
                  onClick={() => setForm(prev => ({ ...prev, is_featured: !prev.is_featured }))}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_featured ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-slate-300 text-sm group-hover:text-white transition-colors">
                  Featured on homepage
                </span>
              </label>
            </div>
          </div>

          {/* Sports */}
          <div className="card space-y-4">
            <h2 className="text-white font-heading font-semibold text-xl pb-2 border-b border-white/5">
              Sports *
            </h2>
            <div className="flex flex-wrap gap-2">
              {SPORTS_OPTIONS.map(sport => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleArrayItem('sports', sport)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    form.sports.includes(sport)
                      ? 'bg-primary-500 border-primary-500 text-black'
                      : 'bg-dark-800 border-white/10 text-slate-400 hover:border-primary-500/40 hover:text-white'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
            {errors.sports && <p className="text-red-400 text-xs">{errors.sports}</p>}
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
                  onClick={() => toggleArrayItem('amenities', amenity)}
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

  {/* Upload button */}
  <div>
    <label className="block text-sm font-medium text-slate-400 mb-1.5">
      Upload Image
    </label>
    <input
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
      disabled={uploading}
      className="block w-full text-sm text-slate-400
        file:mr-4 file:py-2 file:px-4 file:rounded-xl
        file:border-0 file:text-sm file:font-semibold
        file:bg-primary-500/20 file:text-primary-400
        hover:file:bg-primary-500/30 cursor-pointer"
    />
    {uploading && (
      <p className="text-primary-400 text-xs mt-2 animate-pulse">
        Uploading image...
      </p>
    )}
  </div>

  {/* Preview uploaded images */}
  {form.images.filter(img => img).length > 0 && (
    <div className="flex flex-wrap gap-3">
      {form.images.filter(img => img).map((img, index) => (
        <div key={index} className="relative group">
          <img
            src={img}
            alt=""
            className="w-24 h-24 rounded-xl object-cover border border-white/10"
          />
          <button
            type="button"
            onClick={() => removeImageField(index)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs
              flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}

  {/* Manual URL input */}
  <div>
    <label className="block text-sm font-medium text-slate-400 mb-1.5">
      Or paste image URL
    </label>
    {form.images.map((img, index) => (
      <div key={index} className="flex gap-2 mb-2">
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

          {/* Submit */}
          <div className="flex gap-3 pb-8">
            <Link to="/admin" className="btn-secondary flex-1 text-center text-sm py-3.5">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-3.5"
            >
              {loading ? (
                <><Loader size={16} className="animate-spin" /> Saving...</>
              ) : (
                <><Save size={16} /> {isEdit ? 'Update Venue' : 'Add Venue'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}