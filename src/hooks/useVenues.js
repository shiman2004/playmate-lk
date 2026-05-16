import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockVenues, mockTimeSlots } from '../data/mockData'

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
        let filtered = [...mockVenues]
        if (filters.sport) filtered = filtered.filter(v => v.sports.includes(filters.sport))
        if (filters.city) filtered = filtered.filter(v => v.city.toLowerCase().includes(filters.city.toLowerCase()))
        if (filters.maxPrice) filtered = filtered.filter(v => v.price_per_hour <= filters.maxPrice)
        if (filters.minRating) filtered = filtered.filter(v => v.rating >= filters.minRating)
        if (filters.search) {
          const q = filters.search.toLowerCase()
          filtered = filtered.filter(v =>
            v.name.toLowerCase().includes(q) ||
            v.address.toLowerCase().includes(q) ||
            v.sports.some(s => s.toLowerCase().includes(q))
          )
        }
        if (filters.featured) filtered = filtered.filter(v => v.is_featured)
        setVenues(filtered)
        return
      }

      let query = supabase
        .from('venues')
        .select('*, venue_sports(sports(name))')
        .eq('is_active', true)

      if (filters.city) query = query.ilike('city', `%${filters.city}%`)
      if (filters.maxPrice) query = query.lte('price_per_hour', filters.maxPrice)
      if (filters.minRating) query = query.gte('rating', filters.minRating)
      if (filters.featured) query = query.eq('is_featured', true)
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
      }

      const { data, error: err } = await query.order('rating', { ascending: false })
      if (err) throw err
      setVenues(data || [])
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
