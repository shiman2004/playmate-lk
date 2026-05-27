import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LocateFixed, Search, SlidersHorizontal, X, Grid, List } from 'lucide-react'
import toast from 'react-hot-toast'
import { useVenues } from '../hooks/useVenues'
import VenueCard from '../components/venues/VenueCard'
import VenueFilters from '../components/venues/VenueFilters'

export default function VenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [locationLoading, setLocationLoading] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    sport: searchParams.get('sport') || '',
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    userLocation: null,
  })

  const { venues, loading, error } = useVenues(filters)

  useEffect(() => {
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.sport) params.sport = filters.sport
    if (filters.city) params.city = filters.city
    setSearchParams(params)
  }, [filters])

  const updateFilter = (updates) => setFilters(prev => ({ ...prev, ...updates }))
  const clearFilters = () => {
    setUserLocation(null)
    setFilters({ search: '', sport: '', city: '', minPrice: '', maxPrice: '', minRating: '', userLocation: null })
  }

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast.error('Location is not supported on this browser.')
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setUserLocation(location)
        setFilters(prev => ({ ...prev, userLocation: location }))
        setLocationLoading(false)
        toast.success('Showing courts nearest to you.')
      },
      error => {
        setLocationLoading(false)
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. You can still search manually.')
          return
        }
        toast.error('Unable to get your location right now.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const hasFilters = filters.sport || filters.city || filters.minPrice || filters.maxPrice || filters.minRating || filters.search || filters.userLocation
  const activeFilterCount = [filters.sport, filters.city, filters.minPrice || filters.maxPrice, filters.minRating, filters.userLocation].filter(Boolean).length
  const priceLabel = filters.minPrice && filters.maxPrice
    ? `Rs ${Number(filters.minPrice).toLocaleString()} - ${Number(filters.maxPrice).toLocaleString()}`
    : filters.minPrice
      ? `Rs ${Number(filters.minPrice).toLocaleString()}+`
      : filters.maxPrice
        ? `Under Rs ${Number(filters.maxPrice).toLocaleString()}`
        : ''

  return (
    <div className="bg-dark-950 min-h-screen pt-16">
      {/* Header */}
      <div className="bg-dark-900/80 backdrop-blur-xl border-b border-white/5 py-8">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-white">
                {userLocation ? 'COURTS' : 'ALL'} <span className="text-gradient">{userLocation ? 'NEAR YOU' : 'VENUES'}</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {loading ? 'Searching...' : `${venues.length} venue${venues.length !== 1 ? 's' : ''} found`}
                {hasFilters && ' (filtered)'}
              </p>
            </div>

            {/* Search bar */}
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <div className="relative min-w-0 flex-1 sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search venues..."
                  value={filters.search}
                  onChange={e => updateFilter({ search: e.target.value })}
                  className="input pl-9 py-2.5 text-sm"
                />
                {filters.search && (
                  <button onClick={() => updateFilter({ search: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleNearMe}
                disabled={locationLoading}
                className={`btn-secondary flex items-center gap-2 text-sm py-2.5 px-3 sm:px-4 whitespace-nowrap ${
                  userLocation ? 'border-primary-500/40 text-primary-400' : ''
                }`}
              >
                <LocateFixed size={15} className={locationLoading ? 'animate-pulse' : ''} />
                {locationLoading ? 'Locating...' : 'Near Me'}
              </button>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="md:hidden relative flex items-center gap-2 btn-secondary text-sm py-2.5 px-4"
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 rounded-full text-black text-xs font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* View toggle */}
              <div className="hidden sm:flex bg-dark-800 border border-white/10 rounded-xl p-1 gap-1">
                {[{ mode: 'grid', Icon: Grid }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-500/20 text-primary-400' : 'text-slate-500 hover:text-white'}`}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active filters pills */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.sport && (
                <span className="badge-green flex items-center gap-1 py-1.5">
                  ⚽ {filters.sport}
                  <button onClick={() => updateFilter({ sport: '' })} className="ml-1 hover:text-white"><X size={11} /></button>
                </span>
              )}
              {filters.city && (
                <span className="badge-blue flex items-center gap-1 py-1.5">
                  📍 {filters.city}
                  <button onClick={() => updateFilter({ city: '' })} className="ml-1 hover:text-white"><X size={11} /></button>
                </span>
              )}
              {priceLabel && (
                <span className="badge-yellow flex items-center gap-1 py-1.5">
                  {priceLabel}
                  <button onClick={() => updateFilter({ minPrice: '', maxPrice: '' })} className="ml-1 hover:text-white"><X size={11} /></button>
                </span>
              )}
              {filters.minRating && (
                <span className="badge-yellow flex items-center gap-1 py-1.5">
                  {Number(filters.minRating).toFixed(1)}+ rating
                  <button onClick={() => updateFilter({ minRating: '' })} className="ml-1 hover:text-white"><X size={11} /></button>
                </span>
              )}
              {filters.userLocation && (
                <span className="badge-green flex items-center gap-1 py-1.5">
                  Near Me
                  <button
                    onClick={() => {
                      setUserLocation(null)
                      updateFilter({ userLocation: null })
                    }}
                    className="ml-1 hover:text-white"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-full hover:bg-red-500/10 transition-all">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-6">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden md:block w-64 shrink-0">
            <VenueFilters filters={filters} onChange={updateFilter} onClear={clearFilters} />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {error && (
              <div className="text-center py-12 text-red-400 text-sm">
                Error loading venues: {error}
              </div>
            )}

            {loading ? (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <div className="skeleton h-48" />
                    <div className="p-5 bg-dark-900 space-y-3">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                      <div className="skeleton h-10 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏟️</div>
                <h3 className="text-white font-heading font-semibold text-2xl mb-2">No venues found</h3>
                <p className="text-slate-500 text-sm mb-6">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="btn-primary text-sm">Clear Filters</button>
              </div>
            ) : (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {venues.map(venue => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={() => setFiltersOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-900 border-t border-white/10 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto animate-slide-up md:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-heading font-semibold text-lg">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-500">
                <X size={18} />
              </button>
            </div>
            <VenueFilters filters={filters} onChange={updateFilter} onClear={clearFilters} />
            <button
              onClick={() => setFiltersOpen(false)}
              className="btn-primary w-full mt-4 text-sm"
            >
              Show {venues.length} Venues
            </button>
          </div>
        </>
      )}
    </div>
  )
}
