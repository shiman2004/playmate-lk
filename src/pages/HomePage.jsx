import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Star, Building2, Trophy, ChevronRight } from 'lucide-react'
import { useVenues } from '../hooks/useVenues'
import VenueCard from '../components/venues/VenueCard'
import { mockSports } from '../data/mockData'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const navigate = useNavigate()
  const { venues: featuredVenues, loading: featuredLoading } = useVenues({ featured: true })
  const { venues: allVenues, loading: venuesLoading } = useVenues()

  const getVenueSports = (venue) => {
    if (Array.isArray(venue.sports)) return venue.sports

    if (Array.isArray(venue.venue_sports)) {
      return venue.venue_sports
        .map(item => item.sports?.name)
        .filter(Boolean)
    }

    return []
  }

  const sportCategories = useMemo(() => {
    const counts = allVenues.reduce((acc, venue) => {
      getVenueSports(venue).forEach(sport => {
        acc[sport] = (acc[sport] || 0) + 1
      })
      return acc
    }, {})

    return mockSports.map(sport => ({
      ...sport,
      venue_count: counts[sport.name] || 0,
    }))
  }, [allVenues])

  const homepageStats = useMemo(() => {
    const cityCount = new Set(allVenues.map(venue => venue.city).filter(Boolean)).size
    const activeSportCount = sportCategories.filter(sport => sport.venue_count > 0).length

    return [
      { icon: Building2, value: venuesLoading ? '...' : allVenues.length, label: 'Venues' },
      { icon: MapPin, value: venuesLoading ? '...' : cityCount, label: 'Cities' },
      { icon: Trophy, value: venuesLoading ? '...' : activeSportCount, label: 'Sports' },
      { icon: Star, value: featuredLoading ? '...' : featuredVenues.length, label: 'Featured' },
    ]
  }, [allVenues, featuredLoading, featuredVenues.length, sportCategories, venuesLoading])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (searchCity) params.set('city', searchCity)
    navigate(`/venues?${params.toString()}`)
  }

  const SPORT_GRADIENTS = {
    Futsal: 'from-green-500/20 to-emerald-600/10 border-green-500/20',
    Badminton: 'from-blue-500/20 to-sky-600/10 border-blue-500/20',
    Cricket: 'from-orange-500/20 to-amber-600/10 border-orange-500/20',
  }

  return (
    <div className="bg-dark-950">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-950/95 to-dark-950/90 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80')" }}
          />
          {/* Green glow */}
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-primary-600/8 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] z-10"
            style={{
              backgroundImage: `linear-gradient(rgba(34,197,94,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34,197,94,0.5) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="container-custom relative z-20 pt-28 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline */}
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tracking-tight mb-6 animate-slide-up">
              <span className="text-white">BOOK YOUR</span>
              <br />
              <span className="text-gradient">COURT</span>
              <span className="text-white"> TODAY</span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
               No calls. No hassle. Just play.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch}
              className="glass border border-white/10 rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto mb-8 animate-slide-up"
              style={{ animationDelay: '0.2s' }}>
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search size={18} className="text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search venues, sports..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white placeholder-slate-500 text-sm flex-1 focus:outline-none py-2"
                />
              </div>
              <div className="hidden sm:block w-px bg-white/10 my-2" />
              <div className="flex items-center gap-2 px-3 sm:w-44">
                <MapPin size={18} className="text-slate-500 shrink-0" />
                <select
                  value={searchCity}
                  onChange={e => setSearchCity(e.target.value)}
                  className="bg-transparent text-slate-400 text-sm flex-1 focus:outline-none py-2 cursor-pointer"
                >
                  <option value="" className="bg-dark-900">All Cities</option>
                  {['Colombo', 'Nugegoda', 'Kandy', 'Galle', 'Kelaniya', 'Negombo'].map(c => (
                    <option key={c} value={c} className="bg-dark-900">{c}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary px-8 py-3 text-sm whitespace-nowrap">
                Search Venues
              </button>
            </form>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-20">
            {homepageStats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="glass rounded-2xl p-5 text-center group hover:border-primary-500/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-500/20 transition-all">
                  <Icon size={18} className="text-primary-400" />
                </div>
                <div className="font-display text-3xl text-white">{value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float z-20">
          <div className="w-6 h-10 rounded-full border-2 border-white/10 flex items-start justify-center p-1.5">
            <div className="w-1 h-2.5 bg-primary-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* SPORTS CATEGORIES */}
      <section className="section bg-dark-950/50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-primary-400 text-sm font-semibold tracking-widest uppercase mb-3">What We Offer</p>
            <h2 className="font-display text-5xl md:text-6xl text-white">
              PICK YOUR <span className="text-gradient">SPORT</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {sportCategories.map((sport) => (
              <Link
                key={sport.id}
                to={`/venues?sport=${sport.name}`}
                className={`group relative p-3 sm:p-5 rounded-xl sm:rounded-2xl border bg-gradient-to-br ${SPORT_GRADIENTS[sport.name] || 'from-slate-500/20 to-slate-600/10 border-slate-500/20'} 
                  hover:scale-105 transition-all duration-300 text-center overflow-hidden`}
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  {sport.icon}
                </div>
                <h3 className="text-white font-heading font-semibold text-xs sm:text-sm mb-1">{sport.name}</h3>
                <p className="text-slate-500 text-[11px] sm:text-xs">
                  {venuesLoading ? 'Loading...' : `${sport.venue_count} venue${sport.venue_count !== 1 ? 's' : ''}`}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VENUES */}
      <section className="section">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary-400 text-sm font-semibold tracking-widest uppercase mb-2">Top Picks</p>
              <h2 className="font-display text-5xl md:text-6xl text-white">
                FEATURED <span className="text-gradient">VENUES</span>
              </h2>
            </div>
            <Link to="/venues" className="btn-outline hidden sm:flex items-center gap-2 text-sm">
              All Venues <ChevronRight size={15} />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton h-32 sm:h-48" />
                  <div className="p-3 sm:p-5 bg-dark-900 space-y-3">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                    <div className="skeleton h-10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {featuredVenues.slice(0, 3).map(venue => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/venues" className="btn-outline inline-flex items-center gap-2">
              View All Venues <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section bg-dark-900/50">
        <div className="container-custom">
          <div className="text-center mb-14">
            <p className="text-primary-400 text-sm font-semibold tracking-widest uppercase mb-3">Simple Process</p>
            <h2 className="font-display text-5xl md:text-6xl text-white">
              BOOK IN <span className="text-gradient">3 STEPS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary-500/50 via-primary-400 to-primary-500/50 z-0" />

            {[
              { step: '01', title: 'Find Your Venue', desc: 'Browse and filter available indoor sports venues across Sri Lanka.' },
              { step: '02', title: 'Pick a Slot', desc: 'Choose your preferred date and available time slot instantly. No waiting.' },
              { step: '03', title: 'Play & Enjoy', desc: 'Show up and play. Your booking confirmation is your access pass.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative z-10 card text-center group hover:-translate-y-1 transition-all">
                <div className="w-16 h-16 bg-dark-800 border-2 border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:border-primary-500 transition-all">
                  <span className="font-display text-2xl text-primary-400">{step}</span>
                </div>
                <h3 className="text-white font-heading font-semibold text-xl mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section">
        <div className="container-custom">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-10 md:p-16 text-center">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-hero-pattern opacity-10" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="font-display text-5xl md:text-7xl text-white mb-4">
                READY TO PLAY?
              </h2>
              <p className="text-primary-100 text-lg max-w-xl mx-auto mb-8">
                Create your account and book your favourite court on Sportiva.lk
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className="bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-all shadow-xl hover:shadow-white/20 active:scale-95">
                  Get Started Free
                </Link>
                <Link to="/venues" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm">
                  Browse Venues
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
