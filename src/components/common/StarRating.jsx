import { Star } from 'lucide-react'

export default function StarRating({ rating, maxStars = 5, size = 14, showNumber = false, count = null }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < Math.floor(rating) ? 'star-filled' : 'star-empty'}
            fill={i < Math.floor(rating) ? '#facc15' : 'none'}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-slate-400 text-sm ml-1">
          {rating.toFixed(1)}
          {count !== null && <span className="text-slate-600"> ({count})</span>}
        </span>
      )}
    </div>
  )
}
