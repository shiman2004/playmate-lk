import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockBookings } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { sendBookingConfirmationEmail, sendBookingCancellationEmail } from '../lib/sendEmail'

export function useBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user && isSupabaseConfigured) {
      setLoading(false)
      return
    }
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!isSupabaseConfigured) {
        await new Promise(r => setTimeout(r, 500))
        setBookings(mockBookings)
        return
      }

      const { data, error: err } = await supabase
        .from('bookings')
        .select(`
          *,
          venues(name, images, address)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (err) throw err

      // Flatten venue data for easy use in components
      const formatted = (data || []).map(b => ({
        ...b,
        venue_name: b.venues?.name || 'Unknown Venue',
        venue_image: b.venues?.images?.[0] || null,
      }))

      setBookings(formatted)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createBooking = async (bookingData) => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 800))

      const newBooking = {
        id: `BK${Date.now()}`,
        ...bookingData,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      }

      setBookings(prev => [newBooking, ...prev])
      return newBooking
    }

    const { venue_name, venue_image, slot_ids, ...cleanData } = bookingData

    // ✅ Step 1 — Create ONE single booking record
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        venue_id: cleanData.venue_id,
        date: cleanData.date,
        start_time: cleanData.start_time,
        end_time: cleanData.end_time,
        sport: cleanData.sport,
        total_amount: cleanData.total_amount,
        slot_id: slot_ids?.[0] || null, // store first slot id as reference
        status: 'confirmed',
      })
      .select()
      .single()

    if (error) throw error

    // ✅ Step 2 — Mark ALL selected slots as unavailable
    if (slot_ids && slot_ids.length > 0) {
      const { error: slotError } = await supabase
        .from('time_slots')
        .update({ is_available: false })
        .in('id', slot_ids) // ← marks ALL slots at once

      if (slotError) {
        console.error('Failed to mark slots unavailable:', slotError.message)
      }
    }

    // ✅ Step 3 — Send confirmation email
    try {
      // Get venue owner email
      const { data: venueData } = await supabase
        .from('venues')
        .select('email, profiles(email)')
        .eq('id', cleanData.venue_id)
        .single()

      // Get user profile for phone
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single()

      await sendBookingConfirmationEmail({
        userEmail: user.email,
        venueOwnerEmail: venueData?.email || null,
        booking: {
          booking_id: `SPT${String(data.booking_number || 1000).padStart(4, '0')}`,
          venue_name: venue_name || 'Venue',
          date: new Date(cleanData.date).toLocaleDateString('en-LK', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          start_time: cleanData.start_time,
          end_time: cleanData.end_time,
          sport: cleanData.sport,
          remaining_amount: (cleanData.total_amount - 500).toLocaleString(),
          customer_name: userProfile?.full_name || 'Customer',
          customer_phone: userProfile?.phone || 'N/A',
        },
      })
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
      // Don't throw — booking is still confirmed even if email fails
    }

    // ✅ Step 4 — Add to local state
    setBookings(prev => [
      {
        ...data,
        venue_name: venue_name || 'Venue',
        venue_image: venue_image || null,
      },
      ...prev,
    ])

    return data
  }

  const cancelBooking = async (bookingId) => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 500))

      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      )

      return
    }

    const booking = bookings.find(b => b.id === bookingId)

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', user.id)

    if (error) throw error

    // Free up ALL slots in the time range for this booking
    if (booking) {
      await supabase
        .from('time_slots')
        .update({ is_available: true })
        .eq('venue_id', booking.venue_id)
        .eq('date', booking.date)
        .gte('start_time', booking.start_time)
        .lt('start_time', booking.end_time) // free all slots between start and end
    }

    // ✅ Send cancellation email
    try {
      const cancelledBooking = bookings.find(b => b.id === bookingId)

      if (cancelledBooking) {
        await sendBookingCancellationEmail({
          userEmail: user.email,
          booking: {
            booking_id: `SPT${String(cancelledBooking.booking_number || 1000).padStart(4, '0')}`,
            venue_name: cancelledBooking.venue_name || cancelledBooking.venues?.name || 'Venue',
            date: new Date(cancelledBooking.date).toLocaleDateString('en-LK', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            start_time: cancelledBooking.start_time,
            end_time: cancelledBooking.end_time,
          },
        })
      }
    } catch (emailErr) {
      console.error('Cancellation email failed:', emailErr)
    }

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    )
  }

  return {
    bookings,
    loading,
    error,
    createBooking,
    cancelBooking,
    refetch: fetchBookings,
  }
}