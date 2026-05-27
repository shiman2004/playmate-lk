function parseBookingDateTime(date, time) {
  if (!date || !time) return null
  const normalizedTime = String(time).slice(0, 5)
  const parsed = new Date(`${date}T${normalizedTime}`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function getBookingStatus(booking, now = new Date()) {
  if (!booking) return 'pending'
  if (booking.status === 'cancelled') return 'cancelled'
  if (booking.status === 'pending') return 'pending'

  const start = parseBookingDateTime(booking.date, booking.start_time)
  const end = parseBookingDateTime(booking.date, booking.end_time)

  if (!start || !end) return booking.status || 'pending'
  if (now >= end) return 'completed'
  if (now >= start && now < end) return 'ongoing'

  return 'confirmed'
}

export function getBookingStatusLabel(status) {
  const labels = {
    confirmed: 'Confirmed',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
  }

  return labels[status] || labels.pending
}
