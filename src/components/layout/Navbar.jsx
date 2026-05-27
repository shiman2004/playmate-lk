import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, User, LogOut, LayoutDashboard, Shield, ChevronDown, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, profile, isAdmin, isSuperAdmin, isVenueOwner, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate('/')
    } catch {
      toast.error('Error signing out')
    }
  }

  const navLinks = [
    { to: '/venues', label: 'Venues' },
    { to: '/about', label: 'About' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-dark-950/90 backdrop-blur-xl border-b border-white/5 shadow-xl'
        : 'bg-transparent'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-18">

          {/* Logo */}
          <Link
            to="/"
            className="inline-flex items-center rounded-xl bg-white px-3 py-1.5 shadow-lg shadow-black/20 transition-transform duration-200 hover:scale-[1.02]"
          >
            <img
              src="/sportiva_logo.png"
              alt="Sportiva.lk"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold font-body transition-all duration-200 ${
                    isActive
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative">
                {/* Avatar Button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/10 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                    <span className="text-primary-400 text-xs font-bold">
                      {(profile?.full_name || user.email)?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-slate-300 max-w-[120px] truncate">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-dark-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-scale-in">
                    {/* User info */}
                    <div className="p-3 border-b border-white/5">
                      <p className="text-white text-sm font-semibold truncate">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-slate-500 text-xs truncate">{user.email}</p>
                      {isSuperAdmin && (
                        <span className="badge-green text-[10px] mt-1">Super Admin</span>
                      )}
                      {isVenueOwner && (
                        <span className="badge-yellow text-[10px] mt-1">Venue Owner</span>
                      )}
                    </div>

                    <div className="p-1">
                      {/* Dashboard / Venue Dashboard */}
                      <Link
                        to={isVenueOwner ? '/venue-dashboard' : '/dashboard'}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-all"
                      >
                        <LayoutDashboard size={15} />
                        {isVenueOwner ? 'Venue Dashboard' : 'Dashboard'}
                      </Link>

                      {/* Profile — ALL users */}
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-all"
                      >
                        <User size={15} /> Profile
                      </Link>

                      {/* Super Admin — super_admin only */}
                      {isSuperAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 text-sm transition-all"
                        >
                          <Shield size={15} /> Super Admin
                        </Link>
                      )}

                      {/* My Venue — venue_owner only */}
                      {isVenueOwner && (
                        <Link
                          to="/venue-dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-sm transition-all"
                        >
                          <Building2 size={15} /> My Venue
                        </Link>
                      )}

                      {/* Sign Out */}
                      <button
                        onClick={() => { setDropdownOpen(false); handleSignOut() }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-all"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2 px-4">Log In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── MOBILE MENU ── */}
        {isOpen && (
          <div className="md:hidden bg-dark-900/95 backdrop-blur-xl border-t border-white/5 py-4 animate-slide-down">
            {/* Nav links */}
            <div className="space-y-1 px-2 pb-3">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-primary-400 bg-primary-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Theme toggle */}
              <button
                onClick={() => { toggleTheme(); setIsOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            {/* Auth links */}
            <div className="border-t border-white/5 px-2 pt-3 space-y-1">
              {user ? (
                <>
                  {/* User info */}
                  <div className="px-4 py-2 mb-1">
                    <p className="text-white text-sm font-semibold">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-slate-500 text-xs truncate">{user.email}</p>
                  </div>

                  {/* Dashboard */}
                  <Link
                    to={isVenueOwner ? '/venue-dashboard' : '/dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    <LayoutDashboard size={15} />
                    {isVenueOwner ? 'Venue Dashboard' : 'Dashboard'}
                  </Link>

                  {/* Profile — ALL users */}
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    <User size={15} /> Profile
                  </Link>

                  {/* Super Admin — super_admin only */}
                  {isSuperAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-500/10"
                    >
                      <Shield size={15} /> Super Admin
                    </Link>
                  )}

                  {/* My Venue — venue_owner only */}
                  {isVenueOwner && (
                    <Link
                      to="/venue-dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <Building2 size={15} /> My Venue
                    </Link>
                  )}

                  {/* Sign Out */}
                  <button
                    onClick={() => { setIsOpen(false); handleSignOut() }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="btn-secondary flex-1 text-center text-sm py-2.5"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary flex-1 text-center text-sm py-2.5"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setDropdownOpen(false)} />
      )}
    </nav>
  )
}
