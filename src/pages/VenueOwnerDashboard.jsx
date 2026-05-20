import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Calendar, TrendingUp, Clock, CheckCircle,
  XCircle, Users, Edit, ToggleLeft, ToggleRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { format, isBefore, subHours, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function VenueOwnerDashboard() {
  const { user, profile, ownedVenueId } = useAuth()
  const [venue, setVenue] = useState(null)
  const [bookings, setBookings] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    if (ownedVenueId) {
      fetchAll()
    }
  }, [ownedVenueId])

  const fetchAll = async () => {
    setLoading(true)
    try {
      // Fetch venue
      const { data: venueData } = await supabase
        .from('venues')
        .select('*')
        .eq('id', ownedVenueId)
        .single()
      setVenue(venueData)

      // Fetch bookings with user profiles
      // Fetch bookings
const { data: bookingData, error: bookingError } = await supabase
  .from('bookings')
  .select('*')
  .eq('venue_id', ownedVenueId)
  .order('created_at', { ascending: false })

if (bookingError) throw bookingError
setBookings(bookingData || [])

      setBookings(bookingData || [])
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = async (date) => {
    const { data } = await supabase
      .from('time_slots')
      .select('*')
      .eq('venue_id', ownedVenueId)
      .eq('date', date)
      .order('start_time')
    setSlots(data || [])
  }

  useEffect(() => {
    if (ownedVenueId && activeTab === 'slots') {
      fetchSlots(selectedDate)
    }
  }, [selectedDate, activeTab, ownedVenueId])

  const handleCancelBooking = async (bookingId) => {
  if (!confirm('Cancel this booking? The slot will become available again.')) return
  try {
    const booking = bookings.find(b => b.id === bookingId)

    // ✅ Cancel the booking
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
    if (error) throw error

    // ✅ Free ALL slots in the booking time range
    if (booking) {
      await supabase
        .from('time_slots')
        .update({ is_available: true })
        .eq('venue_id', booking.venue_id)
        .eq('date', booking.date)
        .gte('start_time', booking.start_time)
        .lt('start_time', booking.end_time)
    }

    toast.success('Booking cancelled — slot is now available')
    fetchAll()
  } catch (err) {
    toast.error('Failed to cancel: ' + err.message)
  }
}

  const handleToggleSlot = async (slot) => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .update({ is_available: !slot.is_available })
        .eq('id', slot.id)
      if (error) throw error
      toast.success(slot.is_available ? 'Slot blocked' : 'Slot unblocked')
      fetchSlots(selectedDate)
    } catch (err) {
      toast.error('Failed to update slot')
    }
  }

  const canCancelBooking = (booking) => {
    const bookingTime = parseISO(`${booking.date}T${booking.start_time}`)
    return isBefore(new Date(), subHours(bookingTime, 24))
  }

  if (loading) return (
    <div className="min-h-screen bg-dark-950 pt-16 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading your venue..." />
    </div>
  )

  if (!ownedVenueId || !venue) return (
    <div className="min-h-screen bg-dark-950 pt-16 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🏟️</div>
        <h2 className="text-white font-heading text-2xl mb-2">No venue assigned</h2>
        <p className="text-slate-500 text-sm">Contact the admin to assign your venue.</p>
      </div>
    </div>
  )

  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0)

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const todayBookings = bookings.filter(b => b.date === format(new Date(), 'yyyy-MM-dd'))

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'slots', label: 'Time Slots', icon: Clock },
  ]

  const STATUS_COLORS = {
    confirmed: 'badge-green',
    completed: 'badge-blue',
    cancelled: 'badge-red',
    pending: 'badge-yellow',
  }

  return (
    <div className="bg-dark-950 min-h-screen pt-16">
      <div className="container-custom py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-white">
              VENUE <span className="text-gradient">DASHBOARD</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Managing — <span className="text-white font-semibold">{venue.name}</span>
            </p>
          </div>
          <Link
            to={`/venue-owner/edit/${venue.id}`}
            className="btn-outline flex items-center gap-2 text-sm self-start"
          >
            <Edit size={15} /> Edit Venue Info
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-900 border border-white/5 rounded-xl p-1 mb-6 max-w-sm">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === id
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-primary-400', bg: 'bg-primary-500/10' },
                { label: 'Upcoming', value: confirmedBookings.length, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: "Today's Bookings", value: todayBookings.length, icon: Users, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { label: 'Total Revenue', value: `Rs ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="card">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div className="font-display text-3xl text-white mb-0.5">{value}</div>
                  <div className="text-slate-500 text-xs">{label}</div>
                </div>
              ))}
            </div>

            {/* Venue Info Card */}
            <div className="card">
              <div className="flex items-start gap-4">
                {venue.images?.[0] && (
                  <img src={venue.images[0]} alt={venue.name}
                    className="w-24 h-24 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-heading font-bold text-2xl">{venue.name}</h2>
                  <p className="text-slate-500 text-sm mt-1">{venue.address}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {venue.sports?.map(s => (
                      <span key={s} className="badge-green text-xs">{s}</span>
                    ))}
                    <span className={venue.is_active ? 'badge-green' : 'badge-red'}>
                      {venue.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-slate-500 text-xs">Day Rate</p>
                      <p className="text-white font-semibold">Rs {venue.price_per_hour?.toLocaleString()}/hr</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Night Rate</p>
                      <p className="text-white font-semibold">
                        Rs {((venue.price_per_hour || 0) + (venue.night_surcharge || 0)).toLocaleString()}/hr
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Opens</p>
                      <p className="text-white font-semibold">{venue.open_time}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Closes</p>
                      <p className="text-white font-semibold">{venue.close_time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent bookings preview */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-heading font-semibold text-lg">Recent Bookings</h3>
                <button onClick={() => setActiveTab('bookings')}
                  className="text-primary-400 text-xs hover:text-primary-300">
                  View all →
                </button>
              </div>
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {b.profiles?.full_name || 'Customer'}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {b.date} • {b.start_time} – {b.end_time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-400 font-semibold text-sm">
                      Rs {b.total_amount?.toLocaleString()}
                    </p>
                    <span className={STATUS_COLORS[b.status]}>{b.status}</span>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No bookings yet</p>
              )}
            </div>
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-white font-heading font-semibold text-xl">
              All Bookings ({bookings.length})
            </h2>
            <div className="space-y-3">
              {bookings.map(b => {
  // ✅ Venue owner can cancel ANY confirmed booking — no time restriction
  const canCancel = b.status === 'confirmed'

  return (
    <div key={b.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-white font-semibold">
            {b.profiles?.full_name || 'Customer'}
          </p>
          <span className={STATUS_COLORS[b.status]}>{b.status}</span>
        </div>
        {b.profiles?.phone && (
          <p className="text-slate-500 text-xs mb-1">📱 {b.profiles.phone}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span>📅 {b.date}</span>
          <span>🕐 {b.start_time} – {b.end_time}</span>
          <span>🏃 {b.sport}</span>
          <span className="text-primary-400 font-semibold">
            Rs {b.total_amount?.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        {canCancel && (
          <button
            onClick={() => handleCancelBooking(b.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all"
          >
            <XCircle size={13} /> Cancel Booking
          </button>
        )}
        {b.status === 'cancelled' && (
          <div className="flex items-center gap-1 text-slate-600 text-xs">
            <XCircle size={12} /> Cancelled
          </div>
        )}
        {b.status === 'completed' && (
          <div className="flex items-center gap-1 text-slate-600 text-xs">
            <CheckCircle size={12} /> Completed
          </div>
        )}
      </div>
    </div>
  )
})}
              {bookings.length === 0 && (
                <div className="card text-center py-12">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-white font-semibold">No bookings yet</p>
                  <p className="text-slate-500 text-sm mt-1">Bookings will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TIME SLOTS TAB ── */}
        {activeTab === 'slots' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-heading font-semibold text-xl">Manage Time Slots</h2>
            </div>

            {/* Date picker */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={e => setSelectedDate(e.target.value)}
                className="input w-48 text-sm"
              />
            </div>

            <div className="card">
              <p className="text-slate-500 text-xs mb-4">
                Click a slot to block or unblock it. Blocked slots won't be available for booking.
              </p>

              {slots.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">
                  No slots found for this date
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => handleToggleSlot(slot)}
                      className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center gap-1 ${
                        !slot.is_available
                          ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                          : 'bg-primary-500/10 border-primary-500/20 text-primary-400 hover:bg-primary-500/20'
                      }`}
                    >
                      <span>{slot.start_time?.slice(0, 5)}</span>
                      <span className="text-[9px] opacity-70">
                        {slot.is_available ? '✓ Open' : '✗ Blocked'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 bg-primary-500/30 border border-primary-500/40 rounded-sm" /> Open
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 bg-red-500/30 border border-red-500/40 rounded-sm" /> Blocked
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}