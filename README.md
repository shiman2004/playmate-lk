# 🏟️ Sportiva.lk — Setup Guide

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
cd sportiva-lk

# Install all dependencies
npm install
```

### Step 2 — Environment Setup

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=Sportiva.lk
```

### Step 3 — Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** → **New Query**
3. Copy contents of `supabase/schema.sql` → Paste → **Run**

### Step 4 — Run the Development Server

```bash
npm run dev
```

Visit **http://localhost:5173** 🎉

---

## 🔐 Authentication & Roles

| Role | Access |
|------|--------|
| `user` | Book venues, view own bookings |
| `venue_owner` | Manage own venue, view own bookings |
| `super_admin` | Full platform access |

### Set Super Admin

```sql
UPDATE public.profiles
SET role = 'super_admin'
WHERE id = 'paste-user-uuid-here';
```

---

## 🌐 Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 📞 Support

- **Email**: hello@sportiva.lk
- **Built with** React + Vite + Supabase + Tailwind CSS
- **Made in Sri Lanka** 🇱🇰

---

*Sportiva.lk — Book. Play. Repeat.*