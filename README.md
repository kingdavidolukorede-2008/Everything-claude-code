# Omojowo Integrated Farms — website

Static marketing and ordering site for a closed-loop integrated farm in Odogunyan,
Ikorodu, Lagos. No build step, no dependencies — open `index.html` or serve the
folder.

```
index.html              markup, meta, JSON-LD
assets/css/styles.css   tokens → primitives → components → responsive → motion/print
assets/js/app.js        catalogue, cart, filters, diagram, nav, scroll state
```

## Running it

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Deploys as-is to GitHub Pages, Netlify, Vercel or any static host.

## Editing content

**Prices and produce** live in the `PRODUCTS` array at the top of `assets/js/app.js`.
Each entry drives the shop card, the price ticker and the WhatsApp order message —
add, remove or reprice there and the rest follows.

```js
{ id:"eggs", arm:"Poultry", c:"var(--maize)", name:"Table eggs",
  unit:"Crate of 30", price:5200, note:"Collected daily", badge:"Seasonal" }
```

`badge` is optional. `arm` also generates the filter chips, so a new arm name
creates its own chip automatically.

**Phone number**: the `WA` constant in `assets/js/app.js` plus the `wa.me` links in
`index.html` — currently the placeholder `2348000000000`.

**Free-delivery threshold**: the `FREE_DELIVERY` constant in `assets/js/app.js`
(₦25,000), which drives the progress meter in the order bar.

**Colour and type**: the `:root` token block in `assets/css/styles.css`. The
`--maize` / `--pond` / `--clay` tokens are the darker text-safe shades; the
`-bright` variants are for graphics only, so keep body text on the base tokens
to hold contrast.

## How the ordering works

There is no checkout and no server. Quantities are held in `localStorage`
(`omojowo.cart.v1`) so an order survives a reload, and the order bar composes a
formatted itemised message into a `wa.me` deep link. The customer sends it; the
farm confirms weight, availability and delivery by reply.

## Accessibility and behaviour notes

- Skip link, visible focus rings, and a live region that announces cart and
  filter changes.
- Mobile menu is a real disclosure: `aria-expanded`, Escape to close, scrim
  click, focus kept inside while open, released on resize to desktop.
- The loop diagram is keyboard operable (`Enter` / `Space` to trace an arm,
  `Escape` to clear) and carries a text description for screen readers.
- Everything animated is disabled under `prefers-reduced-motion: reduce`.
- The shop grid is JavaScript-rendered; a `<noscript>` block gives WhatsApp and
  phone fallbacks.
- A print stylesheet drops the chrome and prints the price list.
