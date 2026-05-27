import { format } from 'date-fns'
import { Calendar, Clock, MapPin, X } from 'lucide-react'
import { getBookingStatus, getBookingStatusLabel } from '../../lib/bookingStatus'

const STATUS_CONFIG = {
  confirmed: { class: 'badge-green' },
  ongoing: { class: 'badge-yellow' },
  completed: { class: 'badge-blue' },
  cancelled: { class: 'badge-red' },
  pending: { class: 'badge-yellow' },
}

export default function BookingCard({ booking, onCancel }) {
  const status = getBookingStatus(booking)
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const isUpcoming = status === 'confirmed'

  return (
    <div className="card flex flex-col sm:flex-row gap-4 group hover:border-white/10 transition-all">
      {/* Venue image */}
      {booking.venue_image && (
        <div className="sm:w-24 sm:h-24 w-full h-40 rounded-xl overflow-hidden shrink-0">
          <img
            src={booking.venue_image}
            alt={booking.venue_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-heading font-semibold text-base leading-tight truncate">
            {booking.venue_name}
          </h3>
          <span className={config.class}>{getBookingStatusLabel(status)}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Calendar size={13} className="text-primary-500 shrink-0" />
            {format(new Date(booking.date), 'dd MMM yyyy')}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Clock size={13} className="text-primary-500 shrink-0" />
            {booking.start_time} – {booking.end_time}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <span className="text-xs bg-dark-700 px-1.5 py-0.5 rounded font-semibold text-slate-400">
              {booking.sport}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-primary-400 font-semibold text-sm">
            Rs {booking.total_amount?.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600 text-xs font-mono">#{booking.id}</span>
          {isUpcoming && onCancel && (() => {
            const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`)
            const hoursUntil = (bookingDateTime - new Date()) / (1000 * 60 * 60)
            const canCancel = hoursUntil > 24

            return canCancel ? (
              <button
                onClick={() => onCancel(booking.id)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-all"
              >
                <X size={12} /> Cancel
              </button>
            ) : (
              <div className="text-xs text-slate-600 px-2.5 py-1 rounded-lg border border-white/5 bg-dark-800">
                Cannot cancel within 24hrs
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
