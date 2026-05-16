# 🏟️ PlayMate.lk — Setup Guide

> Sri Lanka's #1 Indoor Sports Venue Booking Platform

---

## 📋 Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org)
- **npm** v9+ (comes with Node)
- **Supabase account** — [Free at supabase.com](https://supabase.com)
- A code editor (VS Code recommended)

---

## 🚀 Quick Start

### Step 1 — Clone & Install

```bash
# Navigate to the project folder
cd playmate-lk

# Install all dependencies
npm install
```

### Step 2 — Environment Setup

```bash
# Copy the example env file
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Where to find these:**  
> Supabase Dashboard → Your Project → Settings → API → Project URL & anon public key

### Step 3 — Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (~2 minutes)
3. Go to **SQL Editor** → **New Query**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste and click **Run**
6. You should see: `Success. No rows returned`

### Step 4 — Run the Development Server

```bash
npm run dev
```

Visit **http://localhost:5173** in your browser 🎉

---

## 📁 Project Structure

```
playmate-lk/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── auth/             # Auth-related components
│   │   ├── booking/          # BookingModal, BookingCard
│   │   ├── common/           # LoadingSpinner, StarRating
│   │   ├── home/             # Home page sections
│   │   ├── layout/           # Navbar, Footer, Layout, ProtectedRoute
│   │   └── venues/           # VenueCard, VenueFilters
│   ├── context/
│   │   ├── AuthContext.jsx   # Supabase auth state
│   │   └── ThemeContext.jsx  # Dark/light mode
│   ├── data/
│   │   └── mockData.js       # Demo/fallback data
│   ├── hooks/
│   │   ├── useVenues.js      # Venue fetch hooks
│   │   └── useBookings.js    # Booking CRUD hooks
│   ├── lib/
│   │   └── supabase.js       # Supabase client init
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── VenuesPage.jsx
│   │   ├── VenueDetailsPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── AdminPage.jsx
│   │   ├── AboutPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── styles/
│   │   └── globals.css       # Tailwind + custom classes
│   ├── App.jsx               # Routes definition
│   └── main.jsx              # Entry point
├── supabase/
│   └── schema.sql            # Full DB schema + seed data
├── .env.example
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🗄️ Database Tables

| Table | Description |
|-------|-------------|
| `profiles` | Extended user data (linked to Supabase auth) |
| `sports` | Sport types (Futsal, Badminton, Cricket...) |
| `venues` | Venue listings with details |
| `venue_sports` | Many-to-many: venues ↔ sports |
| `time_slots` | Available hourly slots per venue per date |
| `bookings` | User bookings |
| `reviews` | Venue reviews & ratings |

---

## 🔐 Authentication

PlayMate.lk uses **Supabase Auth** with email/password.

| Feature | Status |
|---------|--------|
| Sign Up | ✅ With email verification |
| Log In | ✅ Email + Password |
| Log Out | ✅ |
| Protected routes | ✅ Dashboard, Profile, Admin |
| Admin role | ✅ Set `role = 'admin'` in `profiles` table |
| Profile sync | ✅ Auto-created on signup via trigger |

### Making a User Admin

In Supabase SQL Editor, run:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'paste-user-uuid-here';
```

Find the UUID in: **Authentication → Users** in Supabase dashboard.

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary color | `#22c55e` (Green 500) |
| Dark bg | `#0f172a` (Slate 950) |
| Surface | `#1e293b` (Slate 800) |
| Display font | Bebas Neue |
| Heading font | Barlow Condensed |
| Body font | DM Sans |

### Utility Classes

```css
.btn-primary     /* Green CTA button */
.btn-secondary   /* Dark outlined button */
.btn-outline     /* Transparent with green border */
.card            /* Dark surface card */
.card-hover      /* Card with hover lift effect */
.glass           /* Glassmorphism overlay */
.glass-green     /* Green-tinted glass */
.input           /* Dark styled input */
.badge-green     /* Green status badge */
.badge-red       /* Red status badge */
.text-gradient   /* Green gradient text */
.skeleton        /* Shimmer loading placeholder */
```

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Netlify

```bash
npm run build
# Deploy the dist/ folder to Netlify
```

Add the same env variables in Netlify → Site Settings → Environment.

### Build Command
```bash
npm run build
```
Output: `dist/` folder

---

## 🔧 Supabase Storage (For Venue Images)

To enable real image uploads in the admin panel:

1. Go to **Storage** in Supabase dashboard
2. Create a bucket named `venue-images`
3. Set it to **Public**
4. Add this policy:

```sql
CREATE POLICY "Public can read venue images"
ON storage.objects FOR SELECT USING (bucket_id = 'venue-images');

CREATE POLICY "Admins can upload venue images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'venue-images'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
```

---

## ⚠️ Demo Mode

If Supabase is **not configured** (no `.env` file), the app runs in **Demo Mode**:

- ✅ All pages render normally
- ✅ Venues show from mock data
- ✅ Booking modal works (UI only)
- ❌ Auth (login/register) won't work
- ❌ Bookings won't persist

This is useful for UI previewing without a backend.

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Supabase client |
| `react-router-dom` | Client-side routing |
| `react-hot-toast` | Toast notifications |
| `lucide-react` | Icon library |
| `date-fns` | Date formatting & manipulation |
| `tailwindcss` | Utility-first CSS framework |

---

## 🛠️ Extending the App

### Adding a New Sport

```sql
INSERT INTO public.sports (name, icon) VALUES ('Volleyball', '🏐');
```

### Generating Time Slots for a Venue

```sql
-- Generate hourly slots for a venue for the next 30 days
DO $$
DECLARE
  v_venue_id UUID := 'your-venue-uuid-here';
  v_date DATE;
  v_hour INT;
BEGIN
  FOR v_date IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + 30, '1 day')::DATE LOOP
    FOR v_hour IN 6..22 LOOP
      INSERT INTO public.time_slots (venue_id, date, start_time, end_time, is_available, price)
      VALUES (v_venue_id, v_date, (v_hour || ':00')::TIME, ((v_hour+1) || ':00')::TIME, TRUE, 3500)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
```

---

## 📞 Support

- **Email**: hello@playmate.lk
- **Built with** React + Vite + Supabase + Tailwind CSS
- **Made in Sri Lanka** 🇱🇰

---

*PlayMate.lk — Book. Play. Repeat.*
