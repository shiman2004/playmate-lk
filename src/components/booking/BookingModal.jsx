import { useState } from 'react'
import { X, Calendar, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { useTimeSlots } from '../../hooks/useVenues'
import { useBookings } from '../../hooks/useBookings'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function BookingModal({ venue, onClose }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [step, setStep] = useState(1) // 1: select, 2: confirm, 3: success
  const [submitting, setSubmitting] = useState(false)
  const { slots, loading: slotsLoading, refetch } = useTimeSlots(venue.id, selectedDate)
  const { createBooking } = useBookings()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i)
    return { value: format(date, 'yyyy-MM-dd'), label: format(date, 'EEE d MMM') }
  })

const handleBooking = async () => {
  if (!user) {
    toast.error('Please log in to book')
    navigate('/login')
    return
  }
  if (!selectedSlot) return

  setSubmitting(true)
  try {
    await createBooking({
      venue_id: venue.id,
      venue_name: venue.name,
      venue_image: venue.images?.[0],
      date: selectedDate,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      sport: venue.sports?.[0] || 'Sports',
      total_amount: venue.price_per_hour,
      slot_id: selectedSlot.id,
    })

    // ✅ Refresh slots so booked slot disappears immediately
    await refetch()

    setStep(3)
  } catch (err) {
    toast.error(err.message || 'Booking failed. Please try again.')
  } finally {
    setSubmitting(false)
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-dark-900 border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-white font-heading font-semibold text-xl">
              {step === 3 ? 'Booking Confirmed! 🎉' : 'Book a Slot'}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">{venue.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 scrollbar-thin">
          {/* Step 3: Success */}
          {step === 3 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-5 animate-scale-in">
                <CheckCircle size={40} className="text-primary-400" />
              </div>
              <h3 className="text-white font-heading font-bold text-2xl mb-2">All Set!</h3>
              <p className="text-slate-400 text-sm mb-6">
                Your court at <strong className="text-white">{venue.name}</strong> is booked for{' '}
                <strong className="text-primary-400">
                  {format(new Date(selectedDate), 'EEEE, MMMM d')}
                </strong>{' '}
                at <strong className="text-primary-400">{selectedSlot?.start_time}</strong>
              </p>
              <div className="glass-green rounded-xl p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-500">Date</span><p className="text-white font-semibold mt-0.5">{format(new Date(selectedDate), 'dd MMM yyyy')}</p></div>
                  <div><span className="text-slate-500">Time</span><p className="text-white font-semibold mt-0.5">{selectedSlot?.start_time} – {selectedSlot?.end_time}</p></div>
                  <div><span className="text-slate-500">Sport</span><p className="text-white font-semibold mt-0.5">{venue.sports?.[0]}</p></div>
                  <div><span className="text-slate-500">Amount</span><p className="text-primary-400 font-bold mt-0.5">Rs {venue.price_per_hour?.toLocaleString()}</p></div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Close</button>
                <button onClick={() => { onClose(); navigate('/dashboard') }} className="btn-primary flex-1 text-sm py-2.5">
                  View Bookings
                </button>
              </div>
            </div>
          )}

          {/* Step 1 & 2 */}
          {step !== 3 && (
            <div className="p-5 space-y-5">
              {/* Date Selector */}
              <div>
                <label className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-3">
                  <Calendar size={15} className="text-primary-400" /> Select Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {dates.map(d => (
                    <button
                      key={d.value}
                      onClick={() => { setSelectedDate(d.value); setSelectedSlot(null) }}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        selectedDate === d.value
                          ? 'bg-primary-500 border-primary-500 text-black'
                          : 'bg-dark-800 border-white/5 text-slate-400 hover:border-primary-500/30 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-3">
                  <Clock size={15} className="text-primary-400" /> Available Time Slots
                </label>

                {slotsLoading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="skeleton h-10 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map(slot => (
                      <button
                        key={slot.id}
                        disabled={!slot.is_available}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all border ${
                          !slot.is_available
                            ? 'bg-dark-800/50 border-white/5 text-slate-700 cursor-not-allowed line-through'
                            : selectedSlot?.id === slot.id
                            ? 'bg-primary-500 border-primary-500 text-black shadow-lg shadow-primary-500/30'
                            : 'bg-dark-800 border-white/5 text-slate-400 hover:border-primary-500/40 hover:text-white'
                        }`}
                      >
                        {slot.start_time}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 bg-primary-500 rounded-sm inline-block" /> Available
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 bg-dark-700 rounded-sm inline-block" /> Booked
                  </span>
                </div>
              </div>

              {/* Summary */}
              {selectedSlot && (
                <div className="glass-green rounded-xl p-4 animate-slide-up">
                  <p className="text-primary-400 text-xs font-semibold mb-2">BOOKING SUMMARY</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{format(new Date(selectedDate), 'EEE, dd MMM')}</span>
                    <span className="text-white font-semibold">{selectedSlot.start_time} – {selectedSlot.end_time}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-400">Total (1 hour)</span>
                    <span className="text-primary-400 font-bold">Rs {venue.price_per_hour?.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {!user && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-yellow-400 text-xs">You need to be logged in to complete a booking.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer action */}
        {step !== 3 && (
          <div className="p-5 border-t border-white/5">
            <button
              onClick={handleBooking}
              disabled={!selectedSlot || submitting}
              className={`w-full btn-primary py-3.5 flex items-center justify-center gap-2 ${
                (!selectedSlot || submitting) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <><Loader size={16} className="animate-spin" /> Processing...</>
              ) : (
                `Confirm Booking${selectedSlot ? ` • Rs ${venue.price_per_hour?.toLocaleString()}` : ''}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
