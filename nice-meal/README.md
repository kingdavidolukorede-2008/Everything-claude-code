# Nice Meal — website

Static marketing site for Nice Meal, a Nigerian restaurant on Aina Obembe Street,
Idimu / Baruwa, Ipaja, Lagos. No build step, no dependencies — open `index.html`
or serve the folder.

```
index.html              homepage: markup, meta, Restaurant JSON-LD
nice-meal-menu.html     full menu page, with Menu JSON-LD
assets/css/styles.css   tokens → base → nav → hero → sections → footer → motion → responsive → print
assets/js/app.js        nav state, mobile disclosure, scroll reveal
assets/img/             8 photographs, two widths each, WebP + JPEG
favicon.svg             "NM" mark
_headers                security + caching headers for Netlify / Cloudflare Pages

backend/                the ordering database — Supabase migrations and tests
kitchen/                the kitchen dashboard, served at /kitchen/
admin/                  the admin dashboard, served at /admin/
assets/js/nm-client.js  the small Supabase client both dashboards share
test/                   browser tests for both dashboards
```

The marketing pages above are self-contained: they need no database, no keys and
no network, and they keep working exactly as they are if the two folders below
them are never deployed. `backend/`, `kitchen/` and `admin/` each have their
own README.

## Running it

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Deploys as-is to GitHub Pages, Netlify, Vercel or any static host. On Netlify and
Cloudflare Pages the `_headers` file is picked up automatically; GitHub Pages
ignores it (see **Security headers** below).

## Editing content

**Homepage menu cards** are the seven `<article class="menu-card">` blocks in the
`#menu` section of `index.html`. Each carries its own `<picture>`, category, name,
description and price.

**The full menu** lives in `nice-meal-menu.html` as plain HTML — four
`.menu-course` blocks, each holding `.menu-item` articles. It is deliberately not
JavaScript-rendered: a menu is the page search engines most need to read, and a
JS-built one is the page they read worst.

Adding a dish means adding one `<article class="menu-item">`:

```html
<article class="menu-item">
  <h3 class="menu-item-name">Ofada Rice &amp; Ayamase <span class="menu-tag">New</span></h3>
  <p class="menu-item-price">From ₦3,000</p>
  <p class="menu-item-desc">Local ofada rice with green pepper sauce.</p>
  <ul class="menu-item-options"><li>Beef</li><li>Assorted</li></ul>
</article>
```

`.menu-tag` and `.menu-item-options` are both optional. Mirror the change in the
`Menu` JSON-LD at the bottom of the same file so the structured data keeps matching
what a visitor actually sees — search engines penalise markup that does not.

**Phone number**: `tel:+2349157428604` and the printed `0915 742 8604`, in both
HTML files and in the `telephone` field of the homepage JSON-LD.

**Colour and type**: the `:root` token block at the top of `assets/css/styles.css`.
The accent comes in three weights and they are not interchangeable:

| token | value | use it for |
|---|---|---|
| `--spice` | `#c8600a` | display type (32px+) and hairlines — 3.78:1, below AA for small text |
| `--spice-ink` | `#a75008` | **any small accent text, and any fill with text on it** — clears 4.5:1 both ways |
| `--spice-light` | `#e07a2a` | accent on the dark grounds only — 2.78:1 on cream |

Likewise `--text-light` (`#9a7a5a`) is for the dark grounds; quiet text on cream or
white takes `--text-soft` (`#7d6349`). Reaching for the wrong one is the easiest way
to reintroduce a contrast failure, so the page is scanned with axe-core after
palette changes.

## Photography

The nine photos arrived embedded in the original page as base64 `data:` URIs —
3.2 MB of markup that could not be cached, lazy-loaded, or given alt text. They are
now real files. Two of them turned out to be the same picture (the hero background
and the About photo), so eight remain.

Each is generated at two widths in both WebP and JPEG, and referenced through
`<picture>` with `srcset`/`sizes`:

| use | widths |
|---|---|
| hero / about (`dining-hall`) | 900, 1600 |
| menu cards | 400, 800 (`banga-starch` 400, 600 — its source is 600px) |
| kids play area | 500, 750 |

To replace one, drop the full-size original in and regenerate:

```python
from PIL import Image
src = Image.open('original.jpg').convert('RGB')
for w in (400, 800):
    h = round(src.height * w / src.width)
    im = src.resize((w, h), Image.LANCZOS)
    im.save(f'assets/img/name-{w}.jpg', 'JPEG', quality=78, optimize=True, progressive=True)
    im.save(f'assets/img/name-{w}.webp', 'WEBP', quality=74, method=6)
```

Then update the `srcset`, `width`, `height` and `alt` on that `<picture>`. The hero
is the LCP element and is preloaded in `<head>` — if its filename changes, change the
`<link rel="preload">` too.

The one card with no photograph (Soft Drinks & Water) uses `.menu-card--gradient`
instead. Give it a photo by switching it to `.menu-card--img` and adding a
`<picture>` like the others.

## Security headers

Three of the original page's protections did not actually work, because browsers
ignore them in `<meta>` form:

- `http-equiv="X-Frame-Options"` — ignored entirely in a meta tag.
- `frame-ancestors`, `sandbox` and `report-uri` — ignored inside a meta CSP.

They are set as real response headers in `_headers` instead, which Netlify and
Cloudflare Pages apply. The meta CSP stays in both pages as the fallback for hosts
with no header control (GitHub Pages among them); it covers every directive except
those three. `script-src` is `'self'` with no `'unsafe-inline'` — all JavaScript is
in `assets/js/app.js`. `style-src` keeps `'unsafe-inline'` because the design uses a
few inline `style` attributes.

## Accessibility and behaviour notes

Both pages pass axe-core with zero violations across WCAG 2.0/2.1 A and AA plus
axe's best-practice rules, at 1280px and 390px.

- Skip link, headings in document order, and a focus ring that clears the 3:1
  WCAG 1.4.11 minimum on every ground the site uses — `--spice-ink` by default,
  `--spice-light` inside the dark sections where it reads better.
- `scroll-margin-top` on every `[id]` so an anchor jump clears the fixed nav
  instead of parking the heading behind it.
- The mobile menu is a real disclosure: `aria-expanded`, `aria-controls`, Escape to
  close, scrim click to close, focus returned to the button, scroll lock released on
  resize back to desktop. The original had none — below 900px it simply hid the nav.
- **Nothing readable depends on JavaScript.** The nav bar is solid by default and
  script only lifts it at the top of the page, where the hero behind it is dark;
  the section entrance is a scroll-driven CSS animation (`animation-timeline:
  view()`) behind an `@supports` guard, so a browser without it — or a visitor
  whose script request fails — gets the content immediately rather than a page of
  invisible sections. Verified by loading the site with `app.js` blocked.
- Every photo carries alt text; the hero copy of the dining-room photo is `alt=""`
  because the same image is described in full in the About section.
- `prefers-reduced-motion: reduce` disables the entrance animations *and* forces the
  revealed content visible, so nothing animated is left invisible.
- A print stylesheet drops the chrome and prints the menu. It also forces the
  scroll-driven entrance off: a print context has no scrollport, so without that
  override the sections print blank.

## Content to confirm before this goes live

These come from the copy as supplied and are worth a second look:

1. **Opening hours contradict each other.** The trust bar and the Find Us lead say
   *"Monday to Saturday"*, the order panel says *"Mon–Sat"*, but the hours table says
   *"Monday – Sunday, 8:00 am – 11:00 pm"*. The visible copy is left exactly as
   written; the JSON-LD follows the hours table (Mo–Su 08:00–23:00). Pick one and
   fix all four places.
2. **Glovo and Facebook links are generic** — `https://glovoapp.com` and
   `https://facebook.com`, not the restaurant's own store and page. Replace with the
   real URLs.
3. **No `aggregateRating` in the JSON-LD.** The page shows "4.6 stars on Google", but
   Google requires a rating *count* alongside the value and only accepts ratings the
   site itself collected. Add it once you have a review count you can stand behind.
4. **The map is a placeholder card**, not an embedded map — deliberately, since an
   embedded Google map would need `frame-src` opened up and would load third-party
   trackers. It links out to Google Maps instead.
