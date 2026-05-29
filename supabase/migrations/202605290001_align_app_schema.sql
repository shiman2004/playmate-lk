-- Align Supabase schema with the current Sportiva.lk app fields and roles.

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('user', 'admin', 'super_admin', 'venue_owner'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS owned_venue_id UUID;

ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS sports TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS half_hour_price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS night_surcharge INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_cutoff_time TIME DEFAULT '17:00',
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS google_maps_link TEXT;

DROP POLICY IF EXISTS "Super admins can manage profiles" ON public.profiles;
CREATE POLICY "Super admins can manage profiles" ON public.profiles FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin')
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;
CREATE POLICY "Admins can manage venues" ON public.venues FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Admins can manage time slots" ON public.time_slots;
CREATE POLICY "Admins can manage time slots" ON public.time_slots FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'venue_owner'));

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
CREATE POLICY "Admins can update all bookings" ON public.bookings FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin'));

CREATE OR REPLACE VIEW public.bookings_with_details
WITH (security_invoker = true) AS
SELECT
  b.*,
  v.name AS venue_name,
  v.name AS venue_name_detail,
  v.images AS venue_images,
  v.address AS venue_address,
  p.full_name AS customer_name,
  p.phone AS customer_phone
FROM public.bookings b
LEFT JOIN public.venues v ON v.id = b.venue_id
LEFT JOIN public.profiles p ON p.id = b.user_id;
