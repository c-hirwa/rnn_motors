# RNN Motors

Website for **RNN Motors** (The Retro Hub, Ndoto Road, Lavington, Nairobi): luxury car sales, importation to order and chauffeured car hire.

## Stack

- **Next.js 15** (App Router, React 19, TypeScript), fully static apart from the hire page
- Plain CSS: black & silver theme with a subtle starry background, in `src/app/globals.css`
- No database: stock lives in `src/data/cars.ts`, photos in `public/cars/`
- Enquiry forms open WhatsApp with the visitor's message filled in

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

To check real-world speed, use the production build:

```bash
npm run build
npm start
```

## Deploying (Vercel)

Import the GitHub repo in Vercel; no environment variables are needed. The site uses Vercel's production domain for share links and the sitemap. If you add a custom domain, set `NEXT_PUBLIC_SITE_URL` (e.g. `https://rnnmotors.co.ke`).

## Updating stock

Everything is in `src/data/cars.ts`:

- **Add a car:** put its photo(s) in `public/cars/`, then copy an existing entry and edit it. The `slug` becomes the page address (`/cars/<slug>`).
- **Price / mileage:** set `priceKes` / `mileageKm`; leave `null` to show "Price on request" / hide mileage.
- **Sold or reserved:** change `status` to `"sold"` or `"reserved"`.
- **Home page slideshow:** `featured: true`. **Hire page:** `forHire: true`.

Commit and push; Vercel redeploys automatically.

Business details (phone numbers, WhatsApp, address, opening hours) are in `src/lib/site.ts`.

## Pages

- `/`: featured-car slideshow, marques strip, latest stock, scroll-driven 3D buy / import / hire story, location with live "open now" status
- `/cars`: showroom with category, search, make and body filters and sorting (shareable URLs)
- `/cars/[slug]`: one page per car: gallery, price, specs, WhatsApp / call / book-a-viewing, similar cars, SEO metadata
- `/import`: three short steps and a request form
- `/hire`: pick a car and send a booking request
- `/visit`: hours, map and a contact form

## 3D showroom (home page)

The "Buy, import or hire" section turns a 3D car on a turntable as you scroll. three.js and the model (`public/models/concept-car.glb`, ~2 MB) load only when a visitor scrolls near the section, and it renders only while the section is on screen. Visitors with reduced motion get a still view.

The model is ["Car Concept"](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept) by Eric Chadwick / Darmstadt Graphics Group, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). It was modified for this site (Khronos logos removed, repainted silver, simplified and compressed). The licence requires the credit line shown under the section, so keep it if the model stays.

## Adding a database later

When stock management or saved enquiries are needed, add Postgres (e.g. Supabase), load `src/data/cars.ts` into it as seed data, and change the functions in `src/lib/cars.ts` to query the database. Pages only use those functions, so they won't need changes.
