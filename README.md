# RNN Motors

Website and inventory system for **RNN Motors** (The Retro Hub, Ndoto Road, Lavington, Nairobi): luxury car sales, custom importation and chauffeured car hire.

## Stack

- **Next.js 15** (App Router, React 19, TypeScript, server actions)
- **Prisma 6 + SQLite** for the local database (switchable to Postgres/Supabase)
- **sharp** for resizing uploaded photos; **next/image** for responsive, optimised delivery
- Plain CSS (black & silver theme in `src/app/globals.css`), no animation libraries
- **jose** (signed session cookies) + **bcryptjs** for the admin login, **zod** for validation

## Getting started

```bash
npm install
cp .env.example .env      # then set AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run setup             # creates prisma/dev.db and seeds the current stock + admin account
npm run dev               # http://localhost:3000
```

Staff log in at **/admin** with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (and can change the password under Settings).

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run db:seed` | Adds any missing seed cars and the admin account |
| `npm run db:reset` | Wipes cars, photos and enquiries, then reseeds |
| `npm run typecheck` | TypeScript check |

## What's in it

**Public site**
- `/`: featured-car slideshow, latest stock, buy / import / hire cards, location with live "open now" status
- `/cars`: full inventory with category chips, search, make and body filters, sort and "include sold", all reflected in the URL so filtered views can be shared
- `/cars/[slug]`: a page per car with photo gallery (swipe, thumbnails, full screen), price, key facts, specs, WhatsApp/call/viewing buttons, save and share, similar cars, sticky enquiry bar on phones, SEO metadata and `Car` structured data
- `/import`: three short steps and a request form
- `/hire`: pick a car, fill in the booking, send (saved to the inbox, with a WhatsApp option)
- `/visit`: hours, map, contact form
- Shortlist (♡) saved in the browser and sent to sales in one WhatsApp message
- `sitemap.xml` and `robots.txt` generated from the inventory

**Admin (`/admin`)**
- Dashboard: available / reserved / sold-this-month counts, listed stock value, new enquiries, listings missing price/mileage/photos, most-enquired cars
- Inventory: search, status tabs, inline status change, featured ★ and for-hire toggles, duplicate, delete
- Add / edit car: all specs, price (blank = "Price on request"), status (draft/available/reserved/sold), multi-photo upload with drag-and-drop, reordering, cover photo and click-to-set focal point
- Enquiries inbox: every form submission (car, viewing, hire, import, general) with call/WhatsApp links, details, and new → contacted → closed tracking

## Where things live

```
prisma/schema.prisma     data model (Car, Photo, Enquiry, User)
prisma/seed.ts           current stock + first admin
prisma/seed-images/      RNN's own photos used by the seed
src/app/(site)/          public pages
src/app/admin/           admin panel + server actions
src/components/          UI components
src/lib/                 db, auth, storage, formatting, site constants (phones, hours…)
storage/uploads/         uploaded photos (git-ignored), served at /media/<key>
```

Business details (phone numbers, WhatsApp, address, opening hours) are in `src/lib/site.ts`. Import-estimator rates are at the top of `src/components/Estimator.tsx`.

## Moving to hosting later

The app is written so the local pieces can be swapped without touching pages:

1. **Database:** change `provider` in `prisma/schema.prisma` to `postgresql`, set `DATABASE_URL` to a Postgres database (e.g. Supabase), run `npx prisma db push` and `npm run db:seed`.
2. **Photos:** replace the three functions in `src/lib/storage.ts` with Supabase Storage / S3 calls.
3. **Rate limits:** the login and enquiry limits are in memory; use a shared store (e.g. Redis/Upstash) when running more than one server.

## Notes

- Seeded specs are indicative manufacturer figures. Prices and mileage are intentionally blank for the sales team to fill in.
- Photos are RNN Motors' own stock images, taken from their previous website.
