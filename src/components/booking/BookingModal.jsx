import { useState, useMemo } from 'react'
import { X, Calendar, Clock, CheckCircle, AlertCircle, Loader, Sun, Moon, Plus, Minus } from 'lucide-react'
import { format, addDays, isBefore } from 'date-fns'
import { useTimeSlots } from '../../hooks/useVenues'
import { useBookings } from '../../hooks/useBookings'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// ── Helpers ──────────────────────────────────────────────────
function isNightSlot(startTime, cutoffTime) {
  const slotHour = parseInt(startTime.split(':')[0], 10)
  const cutoffHour = parseInt((cutoffTime || '17:00').split(':')[0], 10)
  return slotHour >= cutoffHour
}

function isSlotPast(date, startTime) {
  return isBefore(new Date(`${date}T${startTime}`), new Date())
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours} hr`
  return `${hours}.5 hr`
}

export default function BookingModal({ venue, onClose }) {
  const NIGHT_SURCHARGE = venue.night_surcharge || 0
  const CUTOFF_TIME = venue.price_cutoff_time || '17:00'
  const basePricePerHour = venue.price_per_hour || 3000
  const halfHourPrice = venue.half_hour_price || Math.round(basePricePerHour / 2)

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [startSlot, setStartSlot] = useState(null)
  const [endSlot, setEndSlot] = useState(null)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [selecting, setSelecting] = useState('start') // 'start' or 'end'

  const { slots, loading: slotsLoading, refetch } = useTimeSlots(venue.id, selectedDate)
  const { createBooking } = useBookings()
  const { user } = useAuth()
  const navigate = useNavigate()

  // ── Filter past slots ──────────────────────────────────────
  const visibleSlots = slots.filter(slot =>
    !slot.is_available ? true : !isSlotPast(selectedDate, slot.start_time)
  )

  // ── Get all slots between start and end ────────────────────
  const selectedSlots = useMemo(() => {
    if (!startSlot) return []
    if (!endSlot) return [startSlot]

    const startMin = timeToMinutes(startSlot.start_time)
    const endMin = timeToMinutes(endSlot.start_time)

    if (endMin <= startMin) return [startSlot]

    return visibleSlots.filter(slot => {
      const slotMin = timeToMinutes(slot.start_time)
      return slotMin >= startMin && slotMin <= endMin
    })
  }, [startSlot, endSlot, visibleSlots])

  // ── Check if all selected slots are available ──────────────
  const allSlotsAvailable = selectedSlots.every(s => s.is_available)

  // ── Calculate total duration and price ────────────────────
  const totalMinutes = selectedSlots.length * 30
  const totalDurationLabel = formatDuration(totalMinutes)

  const totalPrice = useMemo(() => {
    return selectedSlots.reduce((sum, slot) => {
      const base = halfHourPrice
      const night = isNightSlot(slot.start_time, CUTOFF_TIME) ? Math.round(NIGHT_SURCHARGE / 2) : 0
      return sum + base + night
    }, 0)
  }, [selectedSlots, halfHourPrice, NIGHT_SURCHARGE, CUTOFF_TIME])

  // ── End time of booking ────────────────────────────────────
  const bookingEndTime = endSlot
    ? endSlot.end_time
    : startSlot?.end_time

  // ── Check minimum 1 hour ──────────────────────────────────
  const meetsMinimum = totalMinutes >= 60

  // ── Dates ─────────────────────────────────────────────────
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Today' : format(date, 'EEE d MMM'),
    }
  })

  // ── Slot click handler ─────────────────────────────────────
  const handleSlotClick = (slot) => {
    if (!slot.is_available) return

    if (!startSlot || selecting === 'start') {
      // Set start slot
      setStartSlot(slot)
      setEndSlot(null)
      setSelecting('end')
      return
    }

    // Set end slot
    const startMin = timeToMinutes(startSlot.start_time)
    const clickedMin = timeToMinutes(slot.start_time)

    if (clickedMin < startMin) {
      // Clicked before start — reset and set as new start
      setStartSlot(slot)
      setEndSlot(null)
      setSelecting('end')
      return
    }

    if (clickedMin === startMin) {
      // Clicked same slot — deselect
      setStartSlot(null)
      setEndSlot(null)
      setSelecting('start')
      return
    }

    // Check if all slots between start and end are available
    const slotsInRange = visibleSlots.filter(s => {
      const m = timeToMinutes(s.start_time)
      return m >= startMin && m <= clickedMin
    })

    const hasBlockedSlot = slotsInRange.some(s => !s.is_available)
    if (hasBlockedSlot) {
      toast.error('Some slots in this range are already booked. Please select a different range.')
      return
    }

    setEndSlot(slot)
    setSelecting('start')
  }

  const resetSelection = () => {
    setStartSlot(null)
    setEndSlot(null)
    setSelecting('start')
  }

  // ── Get slot style ─────────────────────────────────────────
  const getSlotStyle = (slot) => {
    const isPast = isSlotPast(selectedDate, slot.start_time)
    const isBooked = !slot.is_available
    const isNight = isNightSlot(slot.start_time, CUTOFF_TIME)
    const isStart = startSlot?.id === slot.id
    const isEnd = endSlot?.id === slot.id
    const slotMin = timeToMinutes(slot.start_time)
    const startMin = startSlot ? timeToMinutes(startSlot.start_time) : -1
    const endMin = endSlot ? timeToMinutes(endSlot.start_time) : startMin
    const isInRange = startSlot && slotMin > startMin && slotMin < endMin

    if (isBooked) return 'bg-dark-800/50 border-white/5 text-slate-700 cursor-not-allowed line-through'
    if (isPast) return 'bg-dark-800/30 border-white/5 text-slate-800 cursor-not-allowed'
    if (isStart || isEnd) return isNight
      ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30'
      : 'bg-primary-500 border-primary-400 text-black shadow-lg shadow-primary-500/30'
    if (isInRange) return isNight
      ? 'bg-blue-500/40 border-blue-500/50 text-blue-200'
      : 'bg-primary-500/40 border-primary-500/50 text-primary-900'
    if (isNight) return 'bg-blue-500/10 border-blue-500/20 text-blue-300 hover:border-blue-500/50 hover:bg-blue-500/20'
    return 'bg-dark-800 border-white/5 text-slate-400 hover:border-primary-500/40 hover:text-white'
  }

  // ── Handle booking submission ──────────────────────────────
  const handleBooking = async () => {
    if (!user) {
      toast.error('Please log in to book')
      navigate('/login')
      return
    }
    if (!startSlot || !meetsMinimum) return

    setSubmitting(true)
    try {
      // Book all selected slots
      for (const slot of selectedSlots) {
        await createBooking({
          venue_id: venue.id,
          venue_name: venue.name,
          venue_image: venue.images?.[0],
          date: selectedDate,
          start_time: startSlot.start_time,
          end_time: bookingEndTime,
          sport: venue.sports?.[0] || 'Sports',
          total_amount: totalPrice,
          slot_id: slot.id,
        })
      }
      await refetch()
      setStep(3)
    } catch (err) {
      toast.error(err.message || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const hasNightInSelection = selectedSlots.some(s => isNightSlot(s.start_time, CUTOFF_TIME))

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

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

          {/* ── SUCCESS ── */}
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
                </strong>
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
                      {startSlot?.start_time} – {bookingEndTime}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Duration</span>
                    <p className="text-white font-semibold mt-0.5">{totalDurationLabel}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Total</span>
                    <p className="text-primary-400 font-bold mt-0.5">
                      Rs {totalPrice.toLocaleString()}
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
                    <p className="text-slate-500 text-[10px]">Rs {halfHourPrice.toLocaleString()} per 30 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Moon size={15} className="text-blue-400 shrink-0" />
                  <div>
                    <p className="text-blue-400 text-xs font-semibold">Night Rate</p>
                    <p className="text-white text-sm font-bold">
                      Rs {(basePricePerHour + NIGHT_SURCHARGE).toLocaleString()}/hr
                    </p>
                    <p className="text-slate-500 text-[10px]">From {CUTOFF_TIME}</p>
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
                      onClick={() => {
                        setSelectedDate(d.value)
                        resetSelection()
                      }}
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

              {/* Selection instruction */}
              <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold ${
                selecting === 'start'
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                <Clock size={13} />
                {!startSlot
                  ? '👆 Click a slot to set your START time'
                  : selecting === 'end'
                  ? `✅ Start: ${startSlot.start_time} — Now click your END slot`
                  : `✅ Selected: ${startSlot.start_time} – ${bookingEndTime} (${totalDurationLabel})`
                }
                {startSlot && (
                  <button
                    onClick={resetSelection}
                    className="ml-auto text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Time Slots */}
              <div>
                <label className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-3">
                  <Clock size={15} className="text-primary-400" /> Available Slots
                </label>

                {slotsLoading ? (
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="skeleton h-14 rounded-xl" />
                    ))}
                  </div>
                ) : visibleSlots.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No available slots for this date
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {visibleSlots.map(slot => (
                      <button
                        key={slot.id}
                        disabled={!slot.is_available || isSlotPast(selectedDate, slot.start_time)}
                        onClick={() => handleSlotClick(slot)}
                        className={`py-2 px-1 rounded-xl text-[10px] font-semibold transition-all border flex flex-col items-center gap-0.5 ${getSlotStyle(slot)}`}
                      >
                        <span>{slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}</span>
                        <span className="text-[8px] opacity-60">
                          {isNightSlot(slot.start_time, CUTOFF_TIME) ? '🌙' : '☀️'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 bg-primary-500 rounded-sm inline-block" /> Start/End
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 bg-primary-500/40 rounded-sm inline-block" /> Selected range
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-3 h-3 bg-dark-700 rounded-sm inline-block" /> Booked
                  </span>
                </div>
              </div>

              {/* Summary */}
              {startSlot && (
                <div className={`rounded-xl p-4 animate-slide-up border ${
                  hasNightInSelection
                    ? 'bg-blue-500/10 border-blue-500/20'
                    : 'bg-primary-500/10 border-primary-500/20'
                }`}>
                  <p className={`text-xs font-semibold mb-3 ${hasNightInSelection ? 'text-blue-400' : 'text-primary-400'}`}>
                    BOOKING SUMMARY
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date</span>
                      <span className="text-white font-semibold">
                        {format(new Date(selectedDate + 'T00:00:00'), 'EEE, dd MMM')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time</span>
                      <span className="text-white font-semibold">
                        {startSlot.start_time} – {bookingEndTime || '...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration</span>
                      <span className="text-white font-semibold">{totalDurationLabel}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                      <span className="text-slate-400">Total Amount</span>
                      <span className={`font-bold text-base ${hasNightInSelection ? 'text-blue-400' : 'text-primary-400'}`}>
                        Rs {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Minimum warning */}
                  {!meetsMinimum && startSlot && (
                    <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertCircle size={13} className="text-red-400 shrink-0" />
                      <p className="text-red-400 text-xs">Minimum booking is 1 hour. Please select more slots.</p>
                    </div>
                  )}
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
              disabled={!startSlot || !meetsMinimum || !allSlotsAvailable || submitting}
              className={`w-full py-3.5 flex items-center justify-center gap-2 font-semibold rounded-xl transition-all ${
                !startSlot || !meetsMinimum || !allSlotsAvailable || submitting
                  ? 'bg-dark-700 text-slate-600 cursor-not-allowed'
                  : hasNightInSelection
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                  : 'btn-primary'
              }`}
            >
              {submitting ? (
                <><Loader size={16} className="animate-spin" /> Processing...</>
              ) : !startSlot ? (
                'Select a start time'
              ) : !meetsMinimum ? (
                'Minimum 1 hour required'
              ) : selecting === 'end' && !endSlot ? (
                'Select an end time'  
              ) : (
                <>
                  {hasNightInSelection ? <Moon size={15} /> : <Sun size={15} />}
                  Confirm {totalDurationLabel} • Rs {totalPrice.toLocaleString()}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}