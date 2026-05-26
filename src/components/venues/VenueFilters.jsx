import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'

const SPORTS = ['Futsal', 'Badminton', 'Cricket']
const CITIES = ['Colombo', 'Nugegoda', 'Kandy', 'Galle', 'Kelaniya', 'Negombo', 'Matara', 'Jaffna']
const PRICE_RANGES = [
  { label: 'Under Rs 2,000', max: 2000 },
  { label: 'Rs 2,000 – 3,500', max: 3500, min: 2000 },
  { label: 'Rs 3,500 – 5,000', max: 5000, min: 3500 },
  { label: 'Rs 5,000+', min: 5000 },
]

export default function VenueFilters({ filters, onChange, onClear }) {
  const [expanded, setExpanded] = useState({ sport: true, city: true, price: true, rating: true })

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const Section = ({ id, title, children }) => (
    <div className="border-b border-white/5 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => toggle(id)}
        className="flex items-center justify-between w-full text-white font-semibold text-sm mb-3 hover:text-primary-400 transition-colors"
      >
        {title}
        {expanded[id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {expanded[id] && children}
    </div>
  )

  const hasFilters = filters.sport || filters.city || filters.maxPrice || filters.minRating

  return (
    <div className="card sticky top-20">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-primary-400" />
          <h3 className="text-white font-heading font-semibold text-lg">Filters</h3>
        </div>
        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={12} /> Clear All
          </button>
        )}
      </div>

      {/* Sport */}
      <Section id="sport" title="Sport Type">
        <div className="space-y-2">
          {SPORTS.map(sport => (
            <label key={sport} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="sport"
                value={sport}
                checked={filters.sport === sport}
                onChange={() => onChange({ sport: filters.sport === sport ? '' : sport })}
                className="accent-primary-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-400 group-hover:text-slate-300 text-sm transition-colors">
                {sport}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* City */}
      <Section id="city" title="City">
        <div className="space-y-2">
          {CITIES.map(city => (
            <label key={city} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="city"
                value={city}
                checked={filters.city === city}
                onChange={() => onChange({ city: filters.city === city ? '' : city })}
                className="accent-primary-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-400 group-hover:text-slate-300 text-sm transition-colors">
                {city}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Price */}
      <Section id="price" title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map(range => (
            <label key={range.label} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="price"
                checked={filters.maxPrice === range.max}
                onChange={() => onChange({ maxPrice: filters.maxPrice === range.max ? '' : range.max })}
                className="accent-primary-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-400 group-hover:text-slate-300 text-sm transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Rating */}
      <Section id="rating" title="Minimum Rating">
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map(rating => (
            <label key={rating} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => onChange({ minRating: filters.minRating === rating ? '' : rating })}
                className="accent-primary-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-400 group-hover:text-slate-300 text-sm transition-colors flex items-center gap-1">
                ★ {rating}+
              </span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  )
}
