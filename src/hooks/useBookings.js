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

  // Step 1: Create the booking
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      ...cleanData,
      status: 'confirmed',
    })
    .select()
    .single()

  if (error) throw error

  // Step 2: Mark the slot as unavailable immediately
  if (bookingData.slot_id) {
    const { error: slotError } = await supabase
      .from('time_slots')
      .update({ is_available: false })
      .eq('id', bookingData.slot_id)

    if (slotError) {
      console.error('Failed to mark slot unavailable:', slotError.message)
    }
  }

  // Step 3: Add to local state for instant UI update
  setBookings(prev => [{
    ...data,
    venue_name: venue_name || 'Venue',
    venue_image: venue_image || null,
  }, ...prev])

  return data
}

  const cancelBooking = async (bookingId) => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 500))
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      )
      return
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', user.id)

    if (error) throw error
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
    )
  }

  return { bookings, loading, error, createBooking, cancelBooking, refetch: fetchBookings }
}