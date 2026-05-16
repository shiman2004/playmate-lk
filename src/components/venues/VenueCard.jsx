import { Link } from 'react-router-dom'
import { MapPin, Clock, Star, Tag } from 'lucide-react'

const SPORT_COLORS = {
  Futsal: 'sport-tag-futsal',
  Badminton: 'sport-tag-badminton',
  Cricket: 'sport-tag-cricket',
  Basketball: 'bg-red-500/10 text-red-400 border-red-500/20 sport-tag',
  default: 'bg-slate-500/10 text-slate-400 border-slate-500/20 sport-tag',
}

export default function VenueCard({ venue }) {
  const image = venue.images?.[0] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80'

  return (
    <div className="card-hover group overflow-hidden p-0">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />

        {/* Featured badge */}
        {venue.is_featured && (
          <div className="absolute top-3 left-3">
            <span className="badge-green text-xs">⚡ Featured</span>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <div className="glass px-3 py-1.5 rounded-xl">
            <span className="text-white font-bold text-sm font-heading">
              Rs {venue.price_per_hour?.toLocaleString()}
            </span>
            <span className="text-slate-400 text-xs">/hr</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Sports tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {venue.sports?.slice(0, 3).map(sport => (
            <span key={sport} className={SPORT_COLORS[sport] || SPORT_COLORS.default}>
              {sport}
            </span>
          ))}
        </div>

        <h3 className="text-white font-heading font-semibold text-lg leading-tight mb-1 group-hover:text-primary-400 transition-colors">
          {venue.name}
        </h3>

        <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">{venue.address}</span>
        </div>

        {/* Rating & Hours */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12}
                  fill={i < Math.floor(venue.rating) ? '#facc15' : 'none'}
                  className={i < Math.floor(venue.rating) ? 'text-yellow-400' : 'text-dark-600'} />
              ))}
            </div>
            <span className="text-yellow-400 text-sm font-semibold">{venue.rating?.toFixed(1)}</span>
            <span className="text-slate-600 text-xs">({venue.review_count})</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock size={11} />
            <span>{venue.open_time} – {venue.close_time}</span>
          </div>
        </div>

        <Link
          to={`/venues/${venue.id}`}
          className="btn-primary w-full text-center text-sm py-2.5 block"
        >
          View & Book
        </Link>
      </div>
    </div>
  )
}
