# PropertyBD — বাংলাদেশের সেরা প্রপার্টি মার্কেটপ্লেস

বাংলাদেশে ফ্ল্যাট, বাড়ি, জমি, দোকান কেনাবেচা ও ভাড়া, গাড়ি ও বাইক বিক্রি এবং নির্মাণ সেবার জন্য একটি পূর্ণাঙ্গ প্ল্যাটফর্ম।

## Features

- 🏠 **Property** — Flat, House, Shop, Office, Land (Sale & Rent)
- 🚗 **Vehicle** — Car & Bike (Sale & Rent)
- 🏗️ **Construction** — Builder & Contractor profiles
- 🔐 **OTP Login** — Phone-based authentication
- 📍 **Location** — All 8 divisions, 64 districts
- 💰 **Lead Unlock** — Pay to see seller contact
- ⭐ **Featured Listings** — Paid promotions
- 👑 **Admin Panel** — Full control dashboard

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Database:** MySQL + Prisma ORM
- **Auth:** JWT + OTP (BulkSMSBD)
- **Images:** Cloudinary
- **Payment:** SSLCommerz / bKash

## Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Fill in your values in .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed location data
npx prisma db seed

# Start development
npm run dev
```

## Environment Variables

See `.env.example` for all required variables.

## Project Structure

```
src/
├── app/
│   ├── api/          # All API routes
│   ├── (auth)/       # Login, Register pages
│   ├── (main)/       # Main app pages
│   └── admin/        # Admin panel
├── components/       # Reusable UI components
├── lib/              # Utilities (db, auth, sms, etc.)
└── middleware.ts     # Route protection
```
