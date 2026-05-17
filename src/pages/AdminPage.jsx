import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Building2, Calendar, Users, TrendingUp, Plus,
  Edit, Trash2, Eye, Search, MoreHorizontal, Star
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'venues', label: 'Venues', icon: Building2 },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'users', label: 'Users', icon: Users },
]

const STATUS_COLORS = {
  confirmed: 'badge-green',
  completed: 'badge-blue',
  cancelled: 'badge-red',
  pending: 'badge-yellow',
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [venueSearch, setVenueSearch] = useState('')
  const [venues, setVenues] = useState([])
  const [loadingVenues, setLoadingVenues] = useState(true)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchVenues()
    fetchUsers()
    fetchBookings()
  }, [])

  const fetchVenues = async () => {
    setLoadingVenues(true)
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setVenues(data || [])
    } catch (err) {
      toast.error('Failed to load venues')
    } finally {
      setLoadingVenues(false)
    }
  }

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchBookings = async () => {
    setLoadingBookings(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, venues(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleDeleteVenue = async (id) => {
    if (!confirm('Are you sure you want to delete this venue?')) return
    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Venue deleted')
      fetchVenues()
    } catch (err) {
      toast.error('Failed to delete venue')
    }
  }

  const filteredVenues = venues.filter(v =>
    v.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
    v.city.toLowerCase().includes(venueSearch.toLowerCase())
  )

  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0)

  return (
    <div className="bg-dark-950 min-h-screen pt-16">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 min-h-[calc(100vh-4rem)] bg-dark-900 border-r border-white/5 pt-6 pb-8 sticky top-16">
          <div className="px-4 mb-6">
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Admin Panel</p>
          </div>
          <nav className="flex-1 px-2 space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-900 border-t border-white/5 flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all ${
                activeTab === id ? 'text-primary-400' : 'text-slate-600'
              }`}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 pb-24 md:pb-6 min-w-0">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-display text-4xl text-white">
                  ADMIN <span className="text-gradient">OVERVIEW</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1">Platform performance at a glance</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Venues', value: venues.length, icon: Building2, change: 'Live from database', color: 'text-primary-400', bg: 'bg-primary-500/10' },
                  { label: 'Total Bookings', value: bookings.length, icon: Calendar, change: 'Live from database', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Registered Users', value: users.length, icon: Users, change: 'Live from database', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                  { label: 'Total Revenue', value: `Rs ${totalRevenue.toLocaleString()}`, icon: TrendingUp, change: 'Excl. cancelled', color: 'text-green-400', bg: 'bg-green-500/10' },
                ].map(({ label, value, icon: Icon, change, color, bg }) => (
                  <div key={label} className="card">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                      <Icon size={18} className={color} />
                    </div>
                    <div className="font-display text-3xl text-white mb-0.5">{value}</div>
                    <div className="text-slate-500 text-xs mb-1">{label}</div>
                    <div className="text-primary-400 text-xs font-semibold">{change}</div>
                  </div>
                ))}
              </div>

              {/* Recent bookings */}
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-heading font-semibold text-xl">Recent Bookings</h2>
                  <button onClick={() => setActiveTab('bookings')} className="text-primary-400 text-xs hover:text-primary-300 transition-colors">
                    View all →
                  </button>
                </div>
                {loadingBookings ? (
                  <div className="text-center py-6 text-slate-500 text-sm">Loading bookings...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['ID', 'Venue', 'Date', 'Time', 'Sport', 'Amount', 'Status'].map(h => (
                            <th key={h} className="text-left text-slate-500 text-xs font-semibold pb-3 pr-4">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {bookings.slice(0, 5).map(b => (
                          <tr key={b.id} className="hover:bg-white/2 transition-colors">
                            <td className="py-3 pr-4 text-slate-600 font-mono text-xs">#{b.id?.slice(0, 8)}</td>
                            <td className="py-3 pr-4 text-white font-medium truncate max-w-[140px]">{b.venues?.name || b.venue_name}</td>
                            <td className="py-3 pr-4 text-slate-400">{b.date}</td>
                            <td className="py-3 pr-4 text-slate-400">{b.start_time}</td>
                            <td className="py-3 pr-4 text-slate-400">{b.sport}</td>
                            <td className="py-3 pr-4 text-primary-400 font-semibold">Rs {b.total_amount?.toLocaleString()}</td>
                            <td className="py-3"><span className={STATUS_COLORS[b.status]}>{b.status}</span></td>
                          </tr>
                        ))}
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">No bookings yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── VENUES ── */}
          {activeTab === 'venues' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-4xl text-white">VENUES</h1>
                  <p className="text-slate-500 text-sm mt-0.5">{filteredVenues.length} venues total</p>
                </div>
                <button
                  onClick={() => navigate('/admin/venues/new')}
                  className="btn-primary flex items-center gap-2 text-sm self-start"
                >
                  <Plus size={15} /> Add Venue
                </button>
              </div>

              <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={venueSearch}
                  onChange={e => setVenueSearch(e.target.value)}
                  placeholder="Search venues..."
                  className="input pl-9 text-sm py-2.5"
                />
              </div>

              <div className="card p-0 overflow-hidden">
                {loadingVenues && (
                  <div className="p-8 text-center text-slate-500 text-sm">Loading venues...</div>
                )}
                {!loadingVenues && filteredVenues.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm">No venues found</div>
                )}
                {!loadingVenues && filteredVenues.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-dark-800/50 border-b border-white/5">
                        <tr>
                          {['Venue', 'City', 'Sports', 'Price/hr', 'Rating', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left text-slate-500 text-xs font-semibold px-5 py-3.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredVenues.map(venue => (
                          <tr key={venue.id} className="hover:bg-white/2 transition-colors group">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <img src={venue.images?.[0]} alt="" className="w-10 h-10 rounded-xl object-cover bg-dark-700" />
                                <div>
                                  <p className="text-white font-medium text-sm">{venue.name}</p>
                                  {venue.is_featured && <span className="badge-green text-[10px] py-0.5">Featured</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-400">{venue.city}</td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-1">
                                {venue.sports?.map(s => (
                                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-700 text-slate-400 border border-white/5">{s}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-300 font-semibold">Rs {venue.price_per_hour?.toLocaleString()}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1">
                                <Star size={12} fill="#facc15" className="text-yellow-400" />
                                <span className="text-white text-sm">{venue.rating || '0.0'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={venue.is_active ? 'badge-green' : 'badge-red'}>
                                {venue.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => navigate(`/venues/${venue.id}`)}
                                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => navigate(`/admin/venues/edit/${venue.id}`)}
                                  className="p-1.5 rounded-lg hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 transition-all"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteVenue(venue.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {activeTab === 'bookings' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="font-display text-4xl text-white">BOOKINGS</h1>
                <p className="text-slate-500 text-sm mt-0.5">{bookings.length} bookings total</p>
              </div>

              <div className="card p-0 overflow-hidden">
                {loadingBookings ? (
                  <div className="p-8 text-center text-slate-500 text-sm">Loading bookings...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-dark-800/50 border-b border-white/5">
                        <tr>
                          {['Booking ID', 'Venue', 'Date & Time', 'Sport', 'Amount', 'Status'].map(h => (
                            <th key={h} className="text-left text-slate-500 text-xs font-semibold px-5 py-3.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {bookings.map(b => (
                          <tr key={b.id} className="hover:bg-white/2 transition-colors">
                            <td className="px-5 py-4 text-slate-500 font-mono text-xs">#{b.id?.slice(0, 8)}</td>
                            <td className="px-5 py-4 text-white font-medium">{b.venues?.name || b.venue_name}</td>
                            <td className="px-5 py-4">
                              <p className="text-slate-300 text-sm">{b.date}</p>
                              <p className="text-slate-500 text-xs">{b.start_time} – {b.end_time}</p>
                            </td>
                            <td className="px-5 py-4 text-slate-400">{b.sport}</td>
                            <td className="px-5 py-4 text-primary-400 font-semibold">Rs {b.total_amount?.toLocaleString()}</td>
                            <td className="px-5 py-4"><span className={STATUS_COLORS[b.status]}>{b.status}</span></td>
                          </tr>
                        ))}
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">No bookings yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="font-display text-4xl text-white">USERS</h1>
                <p className="text-slate-500 text-sm mt-0.5">{users.length} registered users</p>
              </div>

              <div className="card p-0 overflow-hidden">
                {loadingUsers ? (
                  <div className="p-8 text-center text-slate-500 text-sm">Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-dark-800/50 border-b border-white/5">
                        <tr>
                          {['User', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left text-slate-500 text-xs font-semibold px-5 py-3.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-white/2 transition-colors group">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/20 flex items-center justify-center">
                                  <span className="text-primary-400 text-xs font-bold">
                                    {(u.full_name || 'U')[0].toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-white font-medium">{u.full_name || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-400">{u.role || 'user'}</td>
                            <td className="px-5 py-4 text-slate-400">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-5 py-4">
                              <span className={u.role === 'admin' ? 'badge-green' : 'badge-blue'}>
                                {u.role === 'admin' ? 'admin' : 'user'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                <MoreHorizontal size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">No users found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}