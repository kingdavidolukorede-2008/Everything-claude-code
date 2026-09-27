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

## How the forms work (Formspree)

Both forms, **Book an inspection** and **List your property**, post to
[Formspree](https://formspree.io), which emails each submission to the owner.

1. Create a free Formspree account and a new form. Formspree gives you an
   endpoint like `https://formspree.io/f/xyzabcde`.
2. Paste the ID (`xyzabcde`) or the whole URL into `formspree` in
   `assets/js/data.js`.
3. Deploy, then send one test booking from the live site. Formspree asks you to
   confirm the first submission by email before it starts delivering.

Both forms share one Formspree form. The email subject says which form sent it,
e.g. *"Inspection request: 3-Bedroom Terrace Duplex (HM-101)"* or *"New landlord
enquiry: Terrace in Ikate, Lekki"*. Each email also includes the name, phone
number, property (with price and ref), date and time, and the page the visitor
submitted from.

- The confirmation screen shows only after Formspree accepts the submission.
  While it sends, the button reads "Sending…".
- If sending fails (bad connection, wrong ID), the visitor's answers stay in the
  form and they see a retry message with a link to send the same details on WhatsApp.
- A hidden `_gotcha` field catches most spam bots. Formspree also has its own
  spam filtering.
- With `formspree: ""` the site sends nothing. The forms still validate and
  confirm, and the visitor can send the details on WhatsApp. This mode is useful
  for demos.

## Details worth knowing

- Every "Chat on WhatsApp" link on a listing names the property, its price, a
  reference number and the page link.
- Filters sync to the URL (`?deal=rent&beds=3`), so a filtered list can be shared.
- Budget ranges switch between yearly-rent and purchase bands based on Rent/Buy.
- On a phone, the detail page has a sticky WhatsApp / Book Inspection bar, a
  swipeable gallery and a full-screen photo viewer.
- Accessibility: skip link, labelled controls, visible focus, keyboard-operable
  menu, dialogs and lightbox. Reduced-motion preferences are respected.
