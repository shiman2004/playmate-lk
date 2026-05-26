import { supabase } from './supabase'

export async function sendBookingConfirmationEmail({
  userEmail,
  venueOwnerEmail,
  booking,
}) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'booking_confirmed',
        userEmail,
        venueOwnerEmail,
        booking,
      }
    })

    if (error) throw error
    return data
  } catch (err) {
    console.error('Failed to send confirmation email:', err)
  }
}

export async function sendBookingCancellationEmail({
  userEmail,
  booking,
}) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'booking_cancelled',
        userEmail,
        booking,
      }
    })

    if (error) throw error
    return data
  } catch (err) {
    console.error('Failed to send cancellation email:', err)
  }
}