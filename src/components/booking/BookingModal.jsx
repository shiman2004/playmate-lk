import { useState } from 'react'
import { X, Calendar, Clock, CheckCircle, AlertCircle, Loader, Sun, Moon } from 'lucide-react'
import { format, addDays, isBefore } from 'date-fns'
import { useTimeSlots } from '../../hooks/useVenues'
import { useBookings } from '../../hooks/useBookings'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// ── These functions stay OUTSIDE the component ──
function isNightSlot(startTime, cutoffTime) {
  const slotHour = parseInt(startTime.split(':')[0], 10)
  const cutoffHour = parseInt((cutoffTime || '17:00').split(':')[0], 10)
  return slotHour >= cutoffHour
}

function getSlotPrice(startTime, basePrice, nightSurcharge, cutoffTime) {
  return isNightSlot(startTime, cutoffTime) ? basePrice + nightSurcharge : basePrice
}

function isSlotPast(date, startTime) {
  return isBefore(new Date(`${date}T${startTime}`), new Date())
}

export default function BookingModal({ venue, onClose }) {
  // ── venue prop is available here ──
  const NIGHT_SURCHARGE = venue.night_surcharge || 0
  const CUTOFF_TIME = venue.price_cutoff_time || '17:00'
  const basePricePerHour = venue.price_per_hour || 3000

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const { slots, loading: slotsLoading, refetch } = useTimeSlots(venue.id, selectedDate)
  const { createBooking } = useBookings()
  const { user } = useAuth()
  const navigate = useNavigate()

  const visibleSlots = slots.filter(slot =>
    !slot.is_available ? true : !isSlotPast(selectedDate, slot.start_time)
  )

  const slotPrice = selectedSlot
    ? getSlotPrice(selectedSlot.start_time, basePricePerHour, NIGHT_SURCHARGE, CUTOFF_TIME)
    : basePricePerHour

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Today' : format(date, 'EEE d MMM'),
    }
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
        total_amount: slotPrice,
        slot_id: selectedSlot.id,
      })
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

          {/* ── SUCCESS SCREEN ── */}
          {step === 3 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-5 animate-scale-in">
                <CheckCircle size={40} className="text-primary-400" />
              </div>
              <h3 className="text-white font-heading font-bold text-2xl mb-2">All Set!</h3>
              <p className="text-slate-400 text-sm mb-6">
                Your court at <strong className="text-white">{venue.name}</strong> is booked for{' '}
                <strong className="text-primary-400">
                  {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d')}
                </strong>{' '}
                at <strong className="text-primary-400">{selectedSlot?.start_time}</strong>
              </p>
              <div className="glass-green rounded-xl p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Date</span>
                    <p className="text-white font-semibold mt-0.5">
                      {format(new Date(selectedDate + 'T00:00:00'), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Time</span>
                    <p className="text-white font-semibold mt-0.5">
                      {selectedSlot?.start_time} – {selectedSlot?.end_time}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Sport</span>
                    <p className="text-white font-semibold mt-0.5">{venue.sports?.[0]}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Amount</span>
                    <p className="text-primary-400 font-bold mt-0.5">
                      Rs {slotPrice?.toLocaleString()}
                      {isNightSlot(selectedSlot?.start_time || '06:00', CUTOFF_TIME) && NIGHT_SURCHARGE > 0 && (
                        <span className="text-xs text-slate-500 ml-1">(incl. lights)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary flex-1 text-sm py-2.5">Close</button>
                <button
                  onClick={() => { onClose(); navigate('/dashboard') }}
                  className="btn-primary flex-1 text-sm py-2.5"
                >
                  View Bookings
                </button>
              </div>
            </div>
          )}

          {/* ── BOOKING FORM ── */}
          {step !== 3 && (
            <div className="p-5 space-y-5">

              {/* Pricing banner */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <Sun size={15} className="text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-yellow-400 text-xs font-semibold">Day Rate</p>
                    <p className="text-white text-sm font-bold">Rs {basePricePerHour.toLocaleString()}/hr</p>
                    <p className="text-slate-500 text-[10px]">Before {CUTOFF_TIME}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Moon size={15} className="text-blue-400 shrink-0" />
                  <div>
                    <p className="text-blue-400 text-xs font-semibold">Night Rate</p>
                    <p className="text-white text-sm font-bold">
                      Rs {(basePricePerHour + NIGHT_SURCHARGE).toLocaleString()}/hr
                    </p>
                    <p className="text-slate-500 text-[10px]">From {CUTOFF_TIME} (lights)</p>
                  </div>
                </div>
              </div>

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
                      <div key={i} className="skeleton h-14 rounded-xl" />
                    ))}
                  </div>
                ) : visibleSlots.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No available slots for this date
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {visibleSlots.map(slot => {
                      const isPast = isSlotPast(selectedDate, slot.start_time)
                      const isBooked = !slot.is_available
                      const isNight = isNightSlot(slot.start_time, CUTOFF_TIME)
                      const price = getSlotPrice(slot.start_time, basePricePerHour, NIGHT_SURCHARGE, CUTOFF_TIME)
                      const isSelected = selectedSlot?.id === slot.id

                      return (
                        <button
                          key={slot.id}
                          disabled={isBooked || isPast}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center gap-0.5 ${
                            isBooked
                              ? 'bg-dark-800/50 border-white/5 text-slate-700 cursor-not-allowed line-through'
                              : isPast
                              ? 'bg-dark-800/30 border-white/5 text-slate-800 cursor-not-allowed'
                              : isSelected
                              ? isNight
                                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-primary-500 border-primary-500 text-black shadow-lg shadow-primary-500/30'
                              : isNight
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-300 hover:border-blue-500/50 hover:bg-blue-500/20'
                              : 'bg-dark-800 border-white/5 text-slate-400 hover:border-primary-500/40 hover:text-white'
                          }`}
                        >
                          <span>{slot.start_time}</span>
                          <span className={`text-[9px] font-normal ${isSelected ? 'opacity-80' : 'text-slate-600'}`}>
                            Rs {price.toLocaleString()}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 bg-primary-500 rounded-sm inline-block" /> Day slot
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 bg-blue-500/40 border border-blue-500/40 rounded-sm inline-block" /> Night slot
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 bg-dark-700 rounded-sm inline-block" /> Booked
                  </span>
                </div>
              </div>

              {/* Summary */}
              {selectedSlot && (
                <div className={`rounded-xl p-4 animate-slide-up ${
                  isNightSlot(selectedSlot.start_time, CUTOFF_TIME)
                    ? 'bg-blue-500/10 border border-blue-500/20'
                    : 'bg-primary-500/10 border border-primary-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isNightSlot(selectedSlot.start_time, CUTOFF_TIME)
                      ? <Moon size={13} className="text-blue-400" />
                      : <Sun size={13} className="text-primary-400" />
                    }
                    <p className={`text-xs font-semibold ${
                      isNightSlot(selectedSlot.start_time, CUTOFF_TIME) ? 'text-blue-400' : 'text-primary-400'
                    }`}>
                      BOOKING SUMMARY • {isNightSlot(selectedSlot.start_time, CUTOFF_TIME) ? 'NIGHT RATE' : 'DAY RATE'}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      {format(new Date(selectedDate + 'T00:00:00'), 'EEE, dd MMM')}
                    </span>
                    <span className="text-white font-semibold">
                      {selectedSlot.start_time} – {selectedSlot.end_time}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-400">
                      Total (1 hour)
                      {isNightSlot(selectedSlot.start_time, CUTOFF_TIME) && NIGHT_SURCHARGE > 0 && (
                        <span className="text-blue-400 ml-1 text-xs">+Rs {NIGHT_SURCHARGE} lights</span>
                      )}
                    </span>
                    <span className={`font-bold ${
                      isNightSlot(selectedSlot.start_time, CUTOFF_TIME) ? 'text-blue-400' : 'text-primary-400'
                    }`}>
                      Rs {slotPrice.toLocaleString()}
                    </span>
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

        {/* Footer */}
        {step !== 3 && (
          <div className="p-5 border-t border-white/5">
            <button
              onClick={handleBooking}
              disabled={!selectedSlot || submitting}
              className={`w-full py-3.5 flex items-center justify-center gap-2 font-semibold rounded-xl transition-all ${
                !selectedSlot || submitting
                  ? 'bg-dark-700 text-slate-600 cursor-not-allowed'
                  : selectedSlot && isNightSlot(selectedSlot.start_time, CUTOFF_TIME)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                  : 'btn-primary'
              }`}
            >
              {submitting ? (
                <><Loader size={16} className="animate-spin" /> Processing...</>
              ) : selectedSlot ? (
                <>
                  {isNightSlot(selectedSlot.start_time, CUTOFF_TIME) ? <Moon size={15} /> : <Sun size={15} />}
                  Confirm Booking • Rs {slotPrice.toLocaleString()}
                </>
              ) : (
                'Select a time slot'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}