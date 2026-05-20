import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockBookings } from '../data/mockData'
import { useAuth } from '../context/AuthContext'

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

  const { venue_name, venue_image, ...cleanData } = bookingData

  // Only insert one booking record (first slot call)
  // Check if booking already exists for this date/start_time/venue
  const existing = bookings.find(b =>
    b.venue_id === bookingData.venue_id &&
    b.date === bookingData.date &&
    b.start_time === bookingData.start_time &&
    b.status === 'confirmed'
  )

  let bookingRecord = existing

  if (!existing) {
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
        slot_id: cleanData.slot_id,
        status: 'confirmed',
      })
      .select()
      .single()

    if (error) throw error
    bookingRecord = data
  }

  // Mark slot as unavailable
  if (bookingData.slot_id) {
    await supabase
      .from('time_slots')
      .update({ is_available: false })
      .eq('id', bookingData.slot_id)
  }

  if (!existing) {
    setBookings(prev => [{
      ...bookingRecord,
      venue_name: venue_name || 'Venue',
      venue_image: venue_image || null,
    }, ...prev])
  }

  return bookingRecord
}

  const cancelBooking = async (bookingId) => {
  if (!isSupabaseConfigured) {
    await new Promise(r => setTimeout(r, 500))
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
    )
    return
  }

  // Get booking details first
  const booking = bookings.find(b => b.id === bookingId)

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', user.id)

  if (error) throw error

  // Free up the slot
  if (booking?.slot_id) {
    await supabase
      .from('time_slots')
      .update({ is_available: true })
      .eq('id', booking.slot_id)
  }

  setBookings(prev =>
    prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
  )
}

  return { bookings, loading, error, createBooking, cancelBooking, refetch: fetchBookings }
}