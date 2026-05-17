import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CITIES = [
  'Colombo',
  'Nugegoda',
  'Kandy',
  'Galle',
  'Kelaniya',
  'Negombo',
  'Matara',
  'Jaffna',
  'Kurunegala',
  'Ratnapura',
]

const SPORTS_OPTIONS = [
  'Futsal',
  'Badminton',
  'Cricket',
  'Basketball',
  'Table Tennis',
  'Squash',
]

const AMENITIES_OPTIONS = [
  'Air Conditioning',
  'Changing Rooms',
  'Parking',
  'Cafe',
  'WiFi',
  'Locker',
  'First Aid',
  'Pro Shop',
  'Coaching Available',
  'Equipment Rental',
  'Cafeteria',
  'Video Analysis',
  'Bowling Machine',
  'Spectator Area',
  'Coaching',
]

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
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function AdminVenueFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit) {
      fetchVenue()
    }
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
        price_cutoff_time:
          data.price_cutoff_time?.slice(0, 5) || '17:00',
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

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const toggleArrayItem = (field, item) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }))
  }

  const handleImageChange = (index, value) => {
    const updated = [...form.images]
    updated[index] = value

    setForm((prev) => ({
      ...prev,
      images: updated,
    }))
  }

  const addImageField = () => {
    if (form.images.length < 5) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ''],
      }))
    }
  }

  const removeImageField = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
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

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('venue-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('venue-images')
        .getPublicUrl(fileName)

      setForm((prev) => ({
        ...prev,
        images: [
          ...prev.images.filter((img) => img),
          data.publicUrl,
        ],
      }))

      toast.success('Image uploaded!')
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const validate = () => {
    const e = {}

    if (!form.name.trim()) {
      e.name = 'Venue name is required'
    }

    if (!form.address.trim()) {
      e.address = 'Address is required'
    }

    if (!form.city) {
      e.city = 'City is required'
    }

    if (!form.phone.trim()) {
      e.phone = 'Phone is required'
    }

    if (!form.price_per_hour) {
      e.price_per_hour = 'Price per hour is required'
    }

    if (form.sports.length === 0) {
      e.sports = 'Select at least one sport'
    }

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
        slug: `${slugify(form.name)}-${Date.now()}`,
        address: form.address.trim(),
        city: form.city,
        district: form.district || form.city,
        phone: form.phone.trim(),
        email: form.email.trim(),
        description: form.description.trim(),

        price_per_hour: Number(form.price_per_hour) || 0,

        night_surcharge:
          Number(form.night_surcharge) || 0,

        price_cutoff_time: form.price_cutoff_time,
        open_time: form.open_time,
        close_time: form.close_time,

        is_featured: form.is_featured,
        is_active: form.is_active,

        sports: form.sports,
        amenities: form.amenities,

        images: form.images.filter(
          (img) => img.trim() !== ''
        ),

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
          .insert({
            ...payload,
            rating: 0,
            review_count: 0,
          })

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
          <Link
            to="/admin"
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="font-display text-4xl text-white">
              {isEdit ? 'EDIT' : 'ADD'}{' '}
              <span className="text-gradient">
                VENUE
              </span>
            </h1>

            <p className="text-slate-500 text-sm mt-0.5">
              {isEdit
                ? 'Update venue details'
                : 'Add a new venue to PlayMate.lk'}
            </p>
          </div>
        </div>

        {/* YOUR REMAINING JSX CAN STAY THE SAME */}

      </div>
    </div>
  )
}