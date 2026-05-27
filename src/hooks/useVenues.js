import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockVenues, mockTimeSlots } from '../data/mockData'

function getVenueSports(venue) {
  if (Array.isArray(venue.sports)) return venue.sports

  if (Array.isArray(venue.venue_sports)) {
    return venue.venue_sports
      .map(item => item.sports?.name)
      .filter(Boolean)
  }

  return []
}

function applyVenueFilters(venues, filters = {}) {
  return venues.filter(venue => {
    const sports = getVenueSports(venue)
    const price = Number(venue.price_per_hour || 0)
    const rating = Number(venue.rating || 0)
    const query = filters.search?.trim().toLowerCase()

    if (filters.sport && !sports.includes(filters.sport)) return false
    if (filters.city && !venue.city?.toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.minPrice && price < Number(filters.minPrice)) return false
    if (filters.maxPrice && price > Number(filters.maxPrice)) return false
    if (filters.minRating && rating < Number(filters.minRating)) return false
    if (filters.featured && !venue.is_featured) return false

    if (query) {
      const searchable = [
        venue.name,
        venue.address,
        venue.city,
        venue.district,
        ...sports,
      ].filter(Boolean).join(' ').toLowerCase()

      if (!searchable.includes(query)) return false
    }

    return true
  })
}

export function useVenues(filters = {}) {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVenues()
  }, [JSON.stringify(filters)])

  const fetchVenues = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!isSupabaseConfigured) {
        // Use mock data
        await new Promise(r => setTimeout(r, 600))
        setVenues(applyVenueFilters(mockVenues, filters))
        return
      }

      let query = supabase
        .from('venues')
        .select('*, venue_sports(sports(name))')
        .eq('is_active', true)

      const { data, error: err } = await query.order('rating', { ascending: false })
      if (err) throw err

      const formatted = (data || []).map(venue => ({
        ...venue,
        sports: getVenueSports(venue),
      }))

      setVenues(applyVenueFilters(formatted, filters))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { venues, loading, error, refetch: fetchVenues }
}

export function useVenue(id) {
  const [venue, setVenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    fetchVenue()
  }, [id])

  const fetchVenue = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!isSupabaseConfigured) {
        await new Promise(r => setTimeout(r, 400))
        const found = mockVenues.find(v => v.id === id || v.slug === id)
        if (!found) throw new Error('Venue not found')
        setVenue(found)
        return
      }

      const { data, error: err } = await supabase
        .from('venues')
        .select('*, venue_sports(sports(*))')
        .or(`id.eq.${id},slug.eq.${id}`)
        .single()
      if (err) throw err
      setVenue(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { venue, loading, error }
}

export function useTimeSlots(venueId, date) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!venueId || !date) return
    fetchSlots()
  }, [venueId, date])

  const fetchSlots = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!isSupabaseConfigured) {
        await new Promise(r => setTimeout(r, 300))
        setSlots(mockTimeSlots(venueId, date))
        return
      }

      const { data, error: err } = await supabase
        .from('time_slots')
        .select('*')
        .eq('venue_id', venueId)
        .eq('date', date)
        .order('start_time')
      if (err) throw err
      setSlots(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { slots, loading, error, refetch: fetchSlots }
}
