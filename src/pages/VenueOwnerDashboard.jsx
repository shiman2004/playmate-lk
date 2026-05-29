import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Calendar, TrendingUp, Clock,
  XCircle, Users, Edit
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getBookingStatus, getBookingStatusLabel } from '../lib/bookingStatus'

export default function VenueOwnerDashboard() {
  const { ownedVenueId } = useAuth()
  const [venue, setVenue] = useState(null)
  const [bookings, setBookings] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    if (ownedVenueId) fetchAll()
  }, [ownedVenueId])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('*')
        .eq('id', ownedVenueId)
        .single()

      if (venueError) throw venueError
      setVenue(venueData)

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings_with_details')
        .select('*')
        .eq('venue_id', ownedVenueId)
        .order('created_at', { ascending: false })

      if (bookingError) throw bookingError
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

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error

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

  const bookingsWithStatus = bookings.map(booking => ({
    ...booking,
    displayStatus: getBookingStatus(booking, now),
  }))

  const totalRevenue = bookingsWithStatus
    .filter(b => b.displayStatus !== 'cancelled')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0)

  const confirmedBookings = bookingsWithStatus.filter(b => b.displayStatus === 'confirmed')
  const todayBookings = bookingsWithStatus.filter(b => b.date === format(new Date(), 'yyyy-MM-dd'))

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'slots', label: 'Time Slots', icon: Clock },
  ]

  const STATUS_COLORS = {
    confirmed: 'badge-green',
    ongoing: 'badge-yellow',
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

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
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

            <div className="card">
              <div className="flex items-start gap-4">
                {venue.images?.[0] && (
                  <img src={venue.images[0]} alt={venue.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
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

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-heading font-semibold text-lg">Recent Bookings</h3>
                <button onClick={() => setActiveTab('bookings')} className="text-primary-400 text-xs hover:text-primary-300">
                  View all →
                </button>
              </div>

              {bookingsWithStatus.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {b.customer_name || 'Customer'}
                    </p>
                    {b.customer_phone && (
                      <p className="text-slate-500 text-xs">📱 {b.customer_phone}</p>
                    )}
                    <p className="text-slate-500 text-xs">
                      {b.date} • {b.start_time} – {b.end_time}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-primary-400 font-semibold text-sm">
                      Rs {b.total_amount?.toLocaleString()}
                    </p>
                    <span className={STATUS_COLORS[b.displayStatus]}>{getBookingStatusLabel(b.displayStatus)}</span>
                  </div>
                </div>
              ))}

              {bookings.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No bookings yet</p>
              )}
            </div>
          </div>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h1 className="font-display text-4xl text-white">BOOKINGS</h1>
              <p className="text-slate-500 text-sm mt-0.5">{bookings.length} bookings total</p>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-dark-800/50 border-b border-white/5">
                    <tr>
                      {['Booking ID', 'Customer', 'Venue', 'Date & Time', 'Amount', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left text-slate-500 text-xs font-semibold px-5 py-3.5">{h}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {bookingsWithStatus.map(b => {
                      const canCancel = b.displayStatus === 'confirmed'

                      return (
                        <tr key={b.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                            #{b.id?.slice(0, 8)}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-white font-medium">
                              {b.customer_name || 'Customer'}
                            </p>
                            {b.customer_phone && (
                              <p className="text-slate-500 text-xs">
                                📱 {b.customer_phone}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4 text-slate-400">
                            {b.venue_name_detail || b.venue_name || venue?.name || 'Venue'}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-slate-300 text-sm">{b.date}</p>
                            <p className="text-slate-500 text-xs">
                              {b.start_time} – {b.end_time}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-primary-400 font-semibold">
                            Rs {b.total_amount?.toLocaleString()}
                          </td>

                          <td className="px-5 py-4">
                            <span className={STATUS_COLORS[b.displayStatus]}>
                              {getBookingStatusLabel(b.displayStatus)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {canCancel && (
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs transition-all opacity-0 group-hover:opacity-100"
                              >
                                <XCircle size={12} /> Cancel
                              </button>
                            )}

                            {b.displayStatus === 'cancelled' && (
                              <span className="text-slate-600 text-xs">Cancelled</span>
                            )}

                            {b.displayStatus === 'ongoing' && (
                              <span className="text-yellow-400 text-xs">In progress</span>
                            )}

                            {b.displayStatus === 'completed' && (
                              <span className="text-slate-600 text-xs">Completed</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}

                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                          No bookings yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Time Slots */}
        {activeTab === 'slots' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-heading font-semibold text-xl">Manage Time Slots</h2>
            </div>

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
