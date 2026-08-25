# Belle Food

A dark, typographic, late-night restaurant site for **Belle Food** — a women-owned,
founder-led kitchen open 24 hours on Chevron Drive, Eti-Osa, Lekki, Lagos.

Built with React, Vite, TypeScript and Tailwind CSS v4.

## Running it

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build
npm run lint      # oxlint
```

## Structure

```
index.html               meta, title, OG tags
src/
  App.tsx                entry component — providers + page sections
  main.tsx                React root
  index.css               Tailwind v4 @theme tokens, fonts, base styles
  types.ts                shared types (MenuItem, CartLine, Fulfilment…)
  data/                   business info, menu, reviews (all real content)
  context/                CartContext (order state) and ToastContext
  hooks/                  Lagos clock, reduced-motion, body-scroll-lock
  components/             one component per page section + Nav, CartDrawer,
                            ReserveModal, DialSVG (24-hour hero dial), Icons
public/images/            generated SVG "photography" plates (see below)
```

## Images

`public/images/*.svg` are hand-built, art-directed graphics (dark gradient
wash + gold linework motif + film grain + vignette) rather than photographs —
the AI image-generation tools available in this environment didn't have
enough balance to produce the full photoreal set the brief called for. They're
designed to match the site's palette exactly and carry no watermarks or text.
Swap them for real photography by replacing the files at the same paths
(`about-interior.svg`, `dish-*.svg`, `menu-*.svg`, `gallery-*.svg`) — code
references them by path, not format, so real `.jpg`/`.webp` files work as
long as the referencing paths in `src/data/menu.ts`, `src/components/About.tsx`
and `src/components/Gallery.tsx` are updated to match.

## Functionality

- **Order drawer**: add/remove items, adjust quantity, pick dine-in / takeaway
  / delivery, fill in contact details, and build a prefilled WhatsApp order
  ticket (`wa.me/2349137421838`) or call directly.
- **Reserve modal**: name, phone, guest count, date, time and notes, with a
  confirmation state and a call-to-confirm fallback.
- **Live Africa/Lagos clock** in the hero and Visit section.
- Mobile nav locks body scroll; both the cart drawer and reserve modal close
  on `Escape` or overlay click.
- Money is formatted with `Intl.NumberFormat('en-NG', { currency: 'NGN' })`.
- Respects `prefers-reduced-motion` throughout (marquee, dial spin, scroll
  reveals).
