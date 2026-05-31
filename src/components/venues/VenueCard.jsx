import { Link } from 'react-router-dom'
import { MapPin, Clock, Star } from 'lucide-react'

const SPORT_COLORS = {
  Futsal: 'sport-tag-futsal',
  Badminton: 'sport-tag-badminton',
  Cricket: 'sport-tag-cricket',
  default: 'bg-slate-500/10 text-slate-400 border-slate-500/20 sport-tag',
}

export default function VenueCard({ venue }) {
  const image = venue.images?.[0] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80'

  return (
    <div className="card-hover group overflow-hidden p-0 rounded-xl sm:rounded-2xl">
      <div className="relative h-32 overflow-hidden sm:h-48">
        <img
          src={image}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />

        {venue.is_featured && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <span className="badge-green px-1.5 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-xs">
              Featured
            </span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
          <div className="glass rounded-lg px-2 py-1 sm:rounded-xl sm:px-3 sm:py-1.5">
            <span className="text-white font-bold text-xs font-heading sm:text-sm">
              Rs {venue.price_per_hour?.toLocaleString()}
            </span>
            <span className="text-slate-400 text-[10px] sm:text-xs">/hr</span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <div className="flex flex-wrap gap-1 mb-2 sm:gap-1.5 sm:mb-3">
          {venue.sports?.slice(0, 2).map(sport => (
            <span
              key={sport}
              className={`${SPORT_COLORS[sport] || SPORT_COLORS.default} px-2 py-0.5 text-[10px] sm:px-3 sm:py-1 sm:text-xs`}
            >
              {sport}
            </span>
          ))}
        </div>

        <h3 className="text-white font-heading font-semibold text-sm leading-tight mb-1 min-h-[2.25rem] line-clamp-2 group-hover:text-primary-400 transition-colors sm:text-lg sm:min-h-0">
          {venue.name}
        </h3>

        <div className="flex items-start gap-1 text-slate-500 text-xs mb-2 sm:items-center sm:text-sm sm:mb-3">
          <MapPin size={12} className="shrink-0 mt-0.5 sm:mt-0" />
          <span className="line-clamp-2 sm:truncate">{venue.address}</span>
        </div>

        {venue.distance != null && (
          <div className="flex items-center gap-1 text-primary-400 text-[11px] font-semibold mb-2 sm:gap-1.5 sm:text-xs sm:mb-3">
            <MapPin size={12} className="shrink-0" />
            <span>{venue.distance.toFixed(1)} km away</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  fill={i < Math.floor(venue.rating) ? '#facc15' : 'none'}
                  className={i < Math.floor(venue.rating) ? 'text-yellow-400' : 'text-dark-600'}
                />
              ))}
            </div>
            <span className="text-yellow-400 text-xs font-semibold sm:text-sm">
              {venue.rating?.toFixed(1)}
            </span>
            <span className="text-slate-600 text-[10px] sm:text-xs">({venue.review_count})</span>
          </div>

          <div className="hidden items-center gap-1 text-slate-500 text-xs sm:flex">
            <Clock size={11} />
            <span>{venue.open_time} - {venue.close_time}</span>
          </div>
        </div>

        <Link
          to={`/venues/${venue.id}`}
          className="btn-primary w-full text-center text-xs px-2 py-2 block rounded-lg sm:text-sm sm:py-2.5 sm:rounded-xl"
        >
          View & Book
        </Link>
      </div>
    </div>
  )
}
