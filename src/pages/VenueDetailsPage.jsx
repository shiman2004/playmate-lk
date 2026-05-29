import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Clock, Phone, Mail, Heart, Share2, CheckCircle } from 'lucide-react'
import { useVenue } from '../hooks/useVenues'
import { mockReviews } from '../data/mockData'
import LoadingSpinner from '../components/common/LoadingSpinner'
import BookingModal from '../components/booking/BookingModal'
import StarRating from '../components/common/StarRating'

const AMENITY_ICONS = {
  'Air Conditioning': '❄️', 'Changing Rooms': '🚿', 'Parking': '🅿️',
  'Cafe': '☕', 'WiFi': '📶', 'Locker': '🔐', 'First Aid': '🏥',
  'Pro Shop': '🛒', 'Coaching Available': '🎓', 'Equipment Rental': '🏸',
  'Cafeteria': '🍽️', 'Video Analysis': '📹', 'Bowling Machine': '⚙️',
  'Spectator Area': '👥', 'Events Hall': '🎪', 'Coaching': '📋',
}

export default function VenueDetailsPage() {
  const { id } = useParams()
  const { venue, loading, error } = useVenue(id)
  const [activeImage, setActiveImage] = useState(0)
  const [showBooking, setShowBooking] = useState(false)
  const [liked, setLiked] = useState(false)

  if (loading) return (
    <div className="min-h-screen bg-dark-950 pt-16 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading venue details..." />
    </div>
  )

  if (error || !venue) return (
    <div className="min-h-screen bg-dark-950 pt-16 flex flex-col items-center justify-center gap-4">
      <div className="text-5xl">🏟️</div>
      <h2 className="text-white font-heading text-2xl">Venue Not Found</h2>
      <Link to="/venues" className="btn-primary text-sm">Back to Venues</Link>
    </div>
  )

  return (
    <div className="bg-dark-950 min-h-screen pt-16">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/venues" className="hover:text-white transition-colors">Venues</Link>
          <span>/</span>
          <span className="text-white truncate">{venue.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-dark-800">
                <img
                  src={venue.images?.[activeImage] || venue.images?.[0]}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/50 to-transparent" />
                {venue.is_featured && (
                  <div className="absolute top-4 left-4">
                    <span className="badge-green">⚡ Featured Venue</span>
                  </div>
                )}
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`p-2.5 rounded-xl glass transition-all ${liked ? 'text-red-400 bg-red-500/20' : 'text-white'}`}
                  >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-2.5 rounded-xl glass text-white">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {venue.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {venue.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === i ? 'border-primary-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Venue Info */}
            <div className="card">
              {/* Sports tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {venue.sports?.map(sport => (
                  <span key={sport} className={
                    sport === 'Futsal' ? 'sport-tag-futsal' :
                    sport === 'Badminton' ? 'sport-tag-badminton' :
                    sport === 'Cricket' ? 'sport-tag-cricket' : 'sport-tag bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }>{sport}</span>
                ))}
              </div>

              <h1 className="font-heading font-bold text-3xl text-white mb-3">{venue.name}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-primary-500" />
                  <span className="text-slate-400 text-sm">{venue.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={15} className="text-primary-500" />
                  <span className="text-slate-400 text-sm">{venue.open_time} – {venue.close_time}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <StarRating rating={venue.rating} showNumber count={venue.review_count} size={16} />
              </div>

              <p className="text-slate-400 text-sm leading-relaxed">{venue.description}</p>
            </div>

            {/* Amenities */}
            <div className="card">
              <h2 className="text-white font-heading font-semibold text-xl mb-5">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {venue.amenities?.map(amenity => (
                  <div key={amenity} className="flex items-center gap-2.5 p-3 rounded-xl bg-dark-800 border border-white/5">
                    <span className="text-lg">{AMENITY_ICONS[amenity] || '✓'}</span>
                    <span className="text-slate-300 text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-heading font-semibold text-xl">
                  Reviews ({venue.review_count})
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-display text-white">{venue.rating?.toFixed(1)}</span>
                  <div>
                    <StarRating rating={venue.rating} size={14} />
                    <span className="text-slate-500 text-xs">{venue.review_count} reviews</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {mockReviews.filter(r => r.venue_id === venue.id).map(review => (
                  <div key={review.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <img src={review.avatar} alt={review.user_name} className="w-10 h-10 rounded-full bg-dark-700" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold text-sm">{review.user_name}</span>
                          <span className="text-slate-600 text-xs">
                            {new Date(review.created_at).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <StarRating rating={review.rating} size={12} />
                        <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {mockReviews.filter(r => r.venue_id === venue.id).length === 0 && (
                  <p className="text-slate-600 text-sm text-center py-4">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Price card */}
              <div className="card border border-primary-500/10 shadow-glow">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-slate-500 text-sm">Starting from</span>
                    <div className="flex items-end gap-1 mt-0.5">
                      <span className="font-display text-4xl text-primary-400">
                        Rs {venue.price_per_hour?.toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-sm mb-1">/hour</span>
                    </div>
                  </div>
                  <div className="badge-green">Available</div>
                </div>

                <button
                  onClick={() => setShowBooking(true)}
                  className="btn-primary w-full py-4 text-base mt-4 animate-pulse-glow"
                >
                  Book This Venue
                </button>

                <div className="mt-4 space-y-2">
                  {[
                    { icon: CheckCircle, text: 'Instant confirmation' },
                    { icon: CheckCircle, text: 'Free cancellation 24h before' },
                    { icon: CheckCircle, text: 'Secure online payment' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-sm text-slate-500">
                      <Icon size={13} className="text-primary-500" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="card">
                <h3 className="text-white font-heading font-semibold text-lg mb-4">Contact Venue</h3>
                <div className="space-y-3">
                  <a href={`tel:${venue.phone}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center group-hover:bg-primary-500/10 transition-all">
                      <Phone size={15} className="text-primary-500" />
                    </div>
                    <span className="text-sm">{venue.phone}</span>
                  </a>
                  <a href={`mailto:${venue.email}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center group-hover:bg-primary-500/10 transition-all">
                      <Mail size={15} className="text-primary-500" />
                    </div>
                    <span className="text-sm truncate">{venue.email}</span>
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="card">
                <h3 className="text-white font-heading font-semibold text-lg mb-3">Location</h3>
                <div className="rounded-xl bg-dark-800 h-40 flex items-center justify-center border border-white/5 mb-3">
                  <div className="text-center">
                    <MapPin size={28} className="text-primary-500 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">{venue.city}, {venue.district}</p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm">{venue.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal venue={venue} onClose={() => setShowBooking(false)} />
      )}
    </div>
  )
}
