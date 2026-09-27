# Havenmark Properties — Lagos real-estate demo site

Mobile-first website for a property manager in Lekki, Lagos: listings with
filters, a listing detail page, inspection booking, a landlord enquiry form,
and WhatsApp everywhere. No build step, no dependencies.

```
index.html              home: hero + search, listings + filters, how it works,
                        trust + testimonials, booking form, landlords, about/contact
property.html           listing detail (property.html?id=hm-101)
assets/js/data.js       ← business details, listings, testimonials (edit this)
assets/js/app.js        behaviour: filters, forms, gallery, lightbox, modal
assets/css/styles.css   navy + gold design tokens at the top of the file
```

Run it with `python3 -m http.server 8000` from this folder and open
http://localhost:8000. Deploys as-is to Netlify, Vercel or GitHub Pages.

## Making it the client's

Everything is in `assets/js/data.js`:

- **`SITE`**: business name, area, WhatsApp number (digits only, e.g.
  `2348031234567`), phone, email, address, hours, CAC number, stats and social links.
  Elements marked `data-site`/`data-count` in the HTML update from it automatically.
  Also update the `<title>`, meta descriptions and JSON-LD in `index.html` and
  `property.html`, which search engines and WhatsApp link previews read before any script runs.
- **`LISTINGS`**: the six current listings are **realistic samples**. Replace
  them with the client's real ones. `deal` is `"rent"` or `"sale"`, `price` is a
  plain number in naira (rent is per year), and `fees` (optional, for rentals) drives
  the "Total move-in cost" breakdown.
- **Photos**: currently Unsplash placeholders. Put the client's photos in
  `assets/img/` and use e.g. `["assets/img/chevron-1.webp", "Living room"]`.
  A photo that fails to load shows a branded navy frame, not a broken icon.
- **Video tour**: set `video` to a YouTube video ID. The player loads only
  when tapped, which keeps the page fast. With `video: ""` the tour tile offers a live
  WhatsApp video walkthrough instead.

## How the forms work

There is no server. The booking and landlord forms validate input (Nigerian phone
format, no Sundays or past dates) and then show a confirmation screen. That
screen has a **"Send details on WhatsApp"** button with the full request
pre-filled, so the enquiry actually reaches the manager. To receive the forms
by email as well, point them at Formspree or Netlify Forms.

## Details worth knowing

- Every "Chat on WhatsApp" link on a listing names the property, its price, a
  reference number and the page link.
- Filters sync to the URL (`?deal=rent&beds=3`), so a filtered list can be shared.
- Budget ranges switch between yearly-rent and purchase bands based on Rent/Buy.
- On a phone, the detail page has a sticky WhatsApp / Book Inspection bar, a
  swipeable gallery and a full-screen photo viewer.
- Accessibility: skip link, labelled controls, visible focus, keyboard-operable
  menu, dialogs and lightbox. Reduced-motion preferences are respected.
