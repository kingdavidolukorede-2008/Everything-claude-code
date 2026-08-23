# Ever Increasing Grace and Revival Fire Assembly

Website for **Ever Increasing Grace and Revival Fire Assembly** — *The Yoke Breaker* —
13 Unity Road, Off Command Road, Unity Bus Stop, Ipaja, Alimosho, Lagos 102213.

React 19 · Vite 6 · TypeScript · Tailwind CSS 4 · React Router 7

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
```

## Structure

```
src/
  lib/site.ts        Church details, navigation, service times, image URLs
  lib/forms.ts       Where form submissions go
  lib/useReveal.ts   Scroll-reveal observer
  components/        Nav, Footer, Photo, Logo, ScrollManager
  sections/          Home page sections, one file each
  pages/             HomePage, AboutPage
```

`src/lib/site.ts` is the single source of truth. Service times, the address, the
phone number and the navigation are all edited there, not in the components.

## Before this goes live

Four things need real content from the church:

1. **Photographs.** `IMAGES` in `src/lib/site.ts` points at stock placeholders.
   Put the church's own photos in `public/images/` and change the URLs to
   `/images/your-file.jpg`. The About card and About hero are rendered in
   black-and-white, so pick images that hold up without colour.
2. **The pastors.** `AboutPage.tsx` describes the lead pastors but does not name
   them, because the names were not supplied. Add them, and a real photograph.
3. **Giving details.** `sections/Give.tsx` deliberately contains no bank or
   transfer details — it points to the church line instead. Add an account panel
   there once the pastors confirm the real details.
4. **Sermon recordings.** `sections/Sermons.tsx` says recordings are not
   published online yet. Replace that section with links if that changes.

## Forms

There is no backend. Prayer requests, sign-ups and newsletter joins open a
prefilled WhatsApp message to the church line (0802 339 8788) — the channel the
church already uses.

To collect submissions on a server instead, set an endpoint that accepts `POST`
JSON:

```bash
# .env
VITE_FORMS_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

When that variable is set it takes over and WhatsApp is not opened. See
`src/lib/forms.ts`.

## Deploying

The build is a static site in `dist/`. It uses `BrowserRouter`, so the host must
rewrite unknown paths to `index.html` or `/about` will 404 on refresh:

- **Netlify** — add `public/_redirects` containing `/*  /index.html  200`
- **Vercel** — handled automatically
- **Apache/Nginx** — add a fallback rewrite to `index.html`

## Accessibility and motion

Scroll reveals only engage once JavaScript has confirmed it can run them, so the
page is fully readable if scripts fail. `prefers-reduced-motion` disables the
reveals and smooth scrolling. The mobile menu traps `Escape`, locks body scroll,
and exposes `aria-expanded`/`aria-controls`.
