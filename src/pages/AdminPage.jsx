import { useState } from 'react'
import {
  LayoutDashboard, Building2, Calendar, Users, TrendingUp, Plus,
  Edit, Trash2, Eye, Search, ChevronDown, MoreHorizontal, Star
} from 'lucide-react'
import { mockVenues, mockBookings, mockStats } from '../data/mockData'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'venues', label: 'Venues', icon: Building2 },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'users', label: 'Users', icon: Users },
]

const mockUsers = [
  { id: '1', name: 'Kasun Perera', email: 'kasun@example.com', bookings: 8, joined: '2025-01-15', status: 'active' },
  { id: '2', name: 'Dilrukshi Silva', email: 'dilrukshi@example.com', bookings: 3, joined: '2025-02-20', status: 'active' },
  { id: '3', name: 'Amal Fernando', email: 'amal@example.com', bookings: 12, joined: '2024-12-05', status: 'active' },
  { id: '4', name: 'Nadeeka Rajapaksa', email: 'nadeeka@example.com', bookings: 1, joined: '2025-04-30', status: 'inactive' },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [venueSearch, setVenueSearch] = useState('')

  const filteredVenues = mockVenues.filter(v =>
    v.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
    v.city.toLowerCase().includes(venueSearch.toLowerCase())
  )

  const STATUS_COLORS = {
    confirmed: 'badge-green',
    completed: 'badge-blue',
    cancelled: 'badge-red',
    pending: 'badge-yellow',
  }

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
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-display text-4xl text-white">
                  ADMIN <span className="text-gradient">OVERVIEW</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1">Platform performance at a glance</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Venues', value: mockStats.total_venues, icon: Building2, change: '+3 this month', color: 'text-primary-400', bg: 'bg-primary-500/10' },
                  { label: 'Total Bookings', value: mockStats.total_bookings.toLocaleString(), icon: Calendar, change: '+127 this week', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Active Users', value: mockStats.active_users.toLocaleString(), icon: Users, change: '+340 this month', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                  { label: 'Revenue (Est.)', value: 'Rs 2.4M', icon: TrendingUp, change: '+18% vs last month', color: 'text-green-400', bg: 'bg-green-500/10' },
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
                      {mockBookings.slice(0, 5).map(b => (
                        <tr key={b.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-3 pr-4 text-slate-600 font-mono text-xs">#{b.id}</td>
                          <td className="py-3 pr-4 text-white font-medium truncate max-w-[140px]">{b.venue_name}</td>
                          <td className="py-3 pr-4 text-slate-400">{b.date}</td>
                          <td className="py-3 pr-4 text-slate-400">{b.start_time}</td>
                          <td className="py-3 pr-4 text-slate-400">{b.sport}</td>
                          <td className="py-3 pr-4 text-primary-400 font-semibold">Rs {b.total_amount?.toLocaleString()}</td>
                          <td className="py-3"><span className={STATUS_COLORS[b.status]}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Venues */}
          {activeTab === 'venues' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-4xl text-white">VENUES</h1>
                  <p className="text-slate-500 text-sm mt-0.5">{filteredVenues.length} venues total</p>
                </div>
                <button
                  onClick={() => toast.success('Add venue form — connect to Supabase to enable')}
                  className="btn-primary flex items-center gap-2 text-sm self-start"
                >
                  <Plus size={15} /> Add Venue
                </button>
              </div>

              {/* Search */}
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

              {/* Venues table */}
              <div className="card p-0 overflow-hidden">
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
                              <img src={venue.images?.[0]} alt="" className="w-10 h-10 rounded-xl object-cover" />
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
                              <span className="text-white text-sm">{venue.rating}</span>
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
                                onClick={() => toast.success('View venue details')}
                                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => toast.success('Edit venue — connect Supabase to enable')}
                                className="p-1.5 rounded-lg hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 transition-all"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => toast.error('Delete disabled in demo mode')}
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
              </div>
            </div>
          )}

          {/* Bookings */}
          {activeTab === 'bookings' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="font-display text-4xl text-white">BOOKINGS</h1>
                <p className="text-slate-500 text-sm mt-0.5">{mockBookings.length} bookings total</p>
              </div>

              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-dark-800/50 border-b border-white/5">
                      <tr>
                        {['Booking ID', 'Venue', 'Date & Time', 'Sport', 'Amount', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left text-slate-500 text-xs font-semibold px-5 py-3.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {mockBookings.map(b => (
                        <tr key={b.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-5 py-4 text-slate-500 font-mono text-xs">#{b.id}</td>
                          <td className="px-5 py-4 text-white font-medium">{b.venue_name}</td>
                          <td className="px-5 py-4">
                            <p className="text-slate-300 text-sm">{b.date}</p>
                            <p className="text-slate-500 text-xs">{b.start_time} – {b.end_time}</p>
                          </td>
                          <td className="px-5 py-4 text-slate-400">{b.sport}</td>
                          <td className="px-5 py-4 text-primary-400 font-semibold">Rs {b.total_amount?.toLocaleString()}</td>
                          <td className="px-5 py-4"><span className={STATUS_COLORS[b.status]}>{b.status}</span></td>
                          <td className="px-5 py-4">
                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                              <MoreHorizontal size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h1 className="font-display text-4xl text-white">USERS</h1>
                <p className="text-slate-500 text-sm mt-0.5">{mockUsers.length} registered users (demo)</p>
              </div>

              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-dark-800/50 border-b border-white/5">
                      <tr>
                        {['User', 'Email', 'Bookings', 'Joined', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left text-slate-500 text-xs font-semibold px-5 py-3.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {mockUsers.map(u => (
                        <tr key={u.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/20 flex items-center justify-center">
                                <span className="text-primary-400 text-xs font-bold">{u.name[0]}</span>
                              </div>
                              <span className="text-white font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-400">{u.email}</td>
                          <td className="px-5 py-4 text-white font-semibold">{u.bookings}</td>
                          <td className="px-5 py-4 text-slate-400">{u.joined}</td>
                          <td className="px-5 py-4">
                            <span className={u.status === 'active' ? 'badge-green' : 'badge-red'}>{u.status}</span>
                          </td>
                          <td className="px-5 py-4">
                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                              <MoreHorizontal size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
