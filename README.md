# RNN Motors — website concept

A redesigned site for **RNN Motors** (The Retro Hub, Ndoto Road, Lavington, Nairobi): luxury car sales, custom importation and chauffeured car hire.

Static HTML/CSS/JS, no build step. Uses GSAP + ScrollTrigger and Lenis from CDNs.

## Run locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173.

## What's in it

- **Hero**: auto-advancing showcase of signature cars with progress bars, Ken Burns motion and parallax
- **Showroom**: live filter + search, 3D tilt cards, detail modal with hover-zoom, keyboard nav, and per-car WhatsApp enquiry
- **Shortlist**: heart cars, then send the whole list to the sales team in one WhatsApp message (saved in the browser)
- **Signature Collection**: pinned horizontal scroll on desktop, swipe carousel on mobile
- **Import**: animated 6-step process and a landed-cost estimator (KRA duty, excise, VAT, IDF/RDL, freight) with an 8-year age-rule warning
- **Hire**: occasion → car → details booking builder that writes a pre-filled WhatsApp request
- **Visit**: live "open now" status in Nairobi time, today's hours highlighted, dark-styled map

## Editing content

- Cars live in `js/data.js`. Add an object and drop the photo in `assets/cars/`.
- Specs marked "On request" are unknown and should be filled in by the sales team.
- Estimator rates and freight assumptions are at the top of the IMPORT section in `js/main.js`.

Photos are RNN Motors' own stock images, taken from their current website.
