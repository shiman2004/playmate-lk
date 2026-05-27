-- ============================================================
-- PlayMate.lk — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  phone       TEXT,
  bio         TEXT,
  city        TEXT,
  role        TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'venue_owner')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. SPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sports (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. VENUES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.venues (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  address         TEXT NOT NULL,
  city            TEXT NOT NULL,
  district        TEXT,
  phone           TEXT,
  email           TEXT,
  rating          DECIMAL(2,1) DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  price_per_hour  INTEGER NOT NULL,
  is_featured     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  amenities       TEXT[] DEFAULT '{}',
  images          TEXT[] DEFAULT '{}',
  open_time       TIME DEFAULT '06:00',
  close_time      TIME DEFAULT '22:00',
  lat             DECIMAL(10,8),
  lng             DECIMAL(11,8),
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  google_maps_link TEXT,
  owner_id        UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. VENUE_SPORTS (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.venue_sports (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  venue_id    UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  sport_id    UUID REFERENCES public.sports(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(venue_id, sport_id)
);

-- ============================================================
-- 5. TIME_SLOTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.time_slots (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  venue_id      UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  date          DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  is_available  BOOLEAN DEFAULT TRUE,
  price         INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, date, start_time)
);

-- ============================================================
-- 6. BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) NOT NULL,
  venue_id      UUID REFERENCES public.venues(id) NOT NULL,
  slot_id       UUID REFERENCES public.time_slots(id),
  date          DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  sport         TEXT,
  total_amount  INTEGER NOT NULL,
  status        TEXT DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  venue_id    UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES public.profiles(id) NOT NULL,
  booking_id  UUID REFERENCES public.bookings(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, user_id, booking_id)
);

-- Auto-update venue rating when a review is added
CREATE OR REPLACE FUNCTION public.update_venue_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.venues
  SET
    rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM public.reviews WHERE venue_id = NEW.venue_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE venue_id = NEW.venue_id)
  WHERE id = NEW.venue_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_venue_rating();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Venues
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Venues are viewable by everyone" ON public.venues FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage venues" ON public.venues FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Sports
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sports are viewable by everyone" ON public.sports FOR SELECT USING (TRUE);

-- Venue Sports
ALTER TABLE public.venue_sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Venue sports are viewable by everyone" ON public.venue_sports FOR SELECT USING (TRUE);

-- Time Slots
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Time slots are viewable by everyone" ON public.time_slots FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage time slots" ON public.time_slots FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'venue_owner'));

-- Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- SEED DATA — Sports
-- ============================================================
INSERT INTO public.sports (name, icon) VALUES
  ('Futsal', '⚽'),
  ('Badminton', '🏸'),
  ('Cricket', '🏏')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED DATA — Sample Venues
-- ============================================================
INSERT INTO public.venues (name, slug, description, address, city, district, phone, email, rating, review_count, price_per_hour, is_featured, amenities, images, open_time, close_time) VALUES
(
  'Arena Pro Futsal Complex',
  'arena-pro-futsal',
  'State-of-the-art futsal facility with 3 professional-grade courts. Air-conditioned with high-quality artificial turf and modern changing rooms.',
  '42 Galle Road, Colombo 03',
  'Colombo', 'Colombo',
  '+94 11 234 5678', 'info@arenapro.lk',
  4.8, 124, 3500, TRUE,
  ARRAY['Air Conditioning', 'Changing Rooms', 'Parking', 'Cafe', 'Locker', 'WiFi'],
  ARRAY['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'],
  '06:00', '23:00'
),
(
  'Smash Badminton Academy',
  'smash-badminton-academy',
  'Premium badminton facility with 6 international-standard courts and professional-grade flooring.',
  '15 High Level Road, Nugegoda',
  'Nugegoda', 'Colombo',
  '+94 11 876 5432', 'play@smashbadminton.lk',
  4.6, 89, 1800, TRUE,
  ARRAY['Air Conditioning', 'Changing Rooms', 'Parking', 'Pro Shop', 'Coaching Available'],
  ARRAY['https://images.unsplash.com/photo-1613918431703-aa50889e3be3?w=800&q=80'],
  '05:30', '22:00'
),
(
  'Cricket Hub Indoor Nets',
  'cricket-hub-indoor',
  'Professional indoor cricket facility with 4 bowling lanes. Includes bowling machines and video analysis.',
  '88 Kandy Road, Kelaniya',
  'Kelaniya', 'Gampaha',
  '+94 11 456 7890', 'nets@crickethub.lk',
  4.7, 67, 2200, TRUE,
  ARRAY['Changing Rooms', 'Parking', 'Video Analysis', 'Bowling Machine', 'Coaching'],
  ARRAY['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80'],
  '07:00', '21:00'
);
