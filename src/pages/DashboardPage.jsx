import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Clock, CheckCircle, XCircle,
  TrendingUp, MapPin, ChevronRight, Plus
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBookings } from '../hooks/useBookings'
import BookingCard from '../components/booking/BookingCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { getBookingStatus } from '../lib/bookingStatus'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { bookings, loading, cancelBooking } = useBookings()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const bookingsWithStatus = bookings.map(booking => ({
    ...booking,
    displayStatus: getBookingStatus(booking, now),
  }))

  const upcoming = bookingsWithStatus.filter(b => b.displayStatus === 'confirmed' || b.displayStatus === 'ongoing')
  const past = bookingsWithStatus.filter(b => b.displayStatus === 'completed')
  const cancelled = bookingsWithStatus.filter(b => b.displayStatus === 'cancelled')

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      await cancelBooking(id)
      toast.success('Booking cancelled successfully')
    } catch {
      toast.error('Failed to cancel booking')
    }
  }

  const totalSpent = bookingsWithStatus
    .filter(b => b.displayStatus !== 'cancelled')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0)

  const TABS = [
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length, icon: Clock },
    { id: 'past', label: 'History', count: past.length, icon: CheckCircle },
    { id: 'cancelled', label: 'Cancelled', count: cancelled.length, icon: XCircle },
  ]

  const currentList = { upcoming, past, cancelled }[activeTab]

  return (
    <div className="bg-dark-950 min-h-screen pt-16">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-white">
              MY <span className="text-gradient">DASHBOARD</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back, <span className="text-white font-semibold">{profile?.full_name || user?.email?.split('@')[0]}</span>
            </p>
          </div>
          <Link to="/venues" className="btn-primary flex items-center gap-2 text-sm self-start sm:self-auto">
            <Plus size={15} /> Book a Venue
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-primary-400', bg: 'bg-primary-500/10' },
            { label: 'Upcoming', value: upcoming.length, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Completed', value: past.length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Total Spent', value: `Rs ${totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card hover:border-white/10 transition-all">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <div className="font-display text-3xl text-white mb-0.5">{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 bg-dark-900 border border-white/5 rounded-xl p-1 mb-5">
              {TABS.map(({ id, label, count, icon: Icon }) => (
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
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === id ? 'bg-primary-500/30 text-primary-300' : 'bg-dark-700 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner text="Loading bookings..." />
              </div>
            ) : currentList.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-5xl mb-3">
                  {activeTab === 'upcoming' ? '📅' : activeTab === 'past' ? '📋' : '❌'}
                </div>
                <h3 className="text-white font-heading font-semibold text-lg mb-2">
                  No {activeTab} bookings
                </h3>
                <p className="text-slate-500 text-sm mb-5">
                  {activeTab === 'upcoming'
                    ? "You don't have any upcoming bookings."
                    : activeTab === 'past'
                    ? "You haven't completed any bookings yet."
                    : "No cancelled bookings."}
                </p>
                {activeTab === 'upcoming' && (
                  <Link to="/venues" className="btn-primary text-sm inline-block">
                    Browse Venues
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {currentList.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={activeTab === 'upcoming' ? handleCancel : null}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile card */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                  <span className="font-display text-2xl text-primary-400">
                    {(profile?.full_name || user?.email)?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold">{profile?.full_name || 'Player'}</p>
                  <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                </div>
              </div>
              {profile?.phone && (
                <p className="text-slate-500 text-sm mb-4">📱 {profile.phone}</p>
              )}
              <Link to="/profile" className="btn-outline w-full text-center text-sm py-2.5 block">
                Edit Profile
              </Link>
            </div>

            {/* Next booking */}
            {upcoming[0] && (
              <div className="card border border-primary-500/10">
                <p className="text-primary-400 text-xs font-semibold tracking-wide uppercase mb-3">Next Booking</p>
                <div className="flex items-start gap-3">
                  {upcoming[0].venue_image && (
                    <img src={upcoming[0].venue_image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  )}
                  <div>
                    <p className="text-white font-semibold text-sm">{upcoming[0].venue_name}</p>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                      <Calendar size={11} />
                      {format(parseISO(upcoming[0].date), 'EEE, d MMM')}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                      <Clock size={11} />
                      {upcoming[0].start_time} – {upcoming[0].end_time}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick links */}
            <div className="card">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">Quick Links</p>
              <div className="space-y-1">
                {[
                  { to: '/venues', label: 'Browse All Venues', icon: MapPin },
                  { to: '/venues?sport=Futsal', label: 'Book Futsal Court', icon: ChevronRight },
                  { to: '/venues?sport=Badminton', label: 'Book Badminton Court', icon: ChevronRight },
                  { to: '/venues?sport=Cricket', label: 'Book Cricket Net', icon: ChevronRight },
                ].map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
                    <Icon size={14} className="text-primary-500" />
                    {label}
                    <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
