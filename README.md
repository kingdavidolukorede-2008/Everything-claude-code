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
  lib/utils.ts            cn() — clsx + tailwind-merge
  components/ui/          shadcn-convention component folder
scripts/                  engraving library + plate generator (see Images)
public/images/            generated engraved dish plates and scenes (see below)
```

## Images

`public/images/*.svg` are an original engraved illustration system — gold linework
on a wine ground, in the vocabulary of antique menu plates: contour outlines,
parallel hatching for shadow, and stipple for grain and texture. Every dish has
its own bespoke plate; there are no shared or repeated marks.

They are generated, not hand-authored, so they stay consistent and editable:

```bash
node scripts/generate-plates.mjs    # rewrites public/images/
```

- `scripts/engrave-lib.mjs` — drawing primitives (vessels, hatching, stipple,
  fish, mounds, skewers, steam, …) plus the stroke-weight hierarchy.
- `scripts/generate-plates.mjs` — one composition per dish, plus the four
  interior scenes and the About room.

Dish plates are square (1000×1000) so they crop safely to the 4:3 featured cards
and read cleanly at thumbnail size; scenes are 1200×900. Each dish's artwork is
resolved from its id by `plateFor()` in `src/utils/format.ts`, so adding a menu
item means adding a composition of the same id — nothing else to wire up.

`public/images/photo/` holds photography rather than linework. The hero's three
food subjects are supplied stock cutouts, backgrounds removed and re-encoded as
transparent WebP at 2× their maximum display width: `jollof-rice.webp` (576×576),
`shawarma-wrap.webp` (384×384) and `egusi-pounded-yam.webp` (384×384).

`belle-food-storefront.webp` (722×542) is the odd one out: the restaurant's own
photograph of its frontage at night, used by the About section. It is cropped to
the 4:3 the section's frame expects and carries a light grade — contrast 1.10,
saturation 1.08 — so it sits with the dark palette. Nothing else is retouched.
It is the only image on the site that needs no licence, and it ships at its
native resolution, which is short of 2× the 524px display width; a
higher-resolution original would sharpen it on retina screens.

`party-jollof.webp` (800×800, WebP q74) is a full-frame photograph of a dish of
party jollof, used by the Party Jollof menu card and the Kitchen feature card. It
is not a cutout and is not meant to be one — the dish runs off every edge of the
frame, so there is no whole plate to lift out. It carries the same light grade as
the storefront, at contrast 1.06 and saturation 1.04.

Together these five are the only photographs on the page; everything else is
engraved.

Dish photographs are registered in `src/data/photos.ts` and resolved by
`dishImage()` in `src/utils/format.ts`. A dish with no entry falls back to its
engraving at `/images/<id>.svg`, so the menu can be photographed one plate at a
time without ever showing a gap — adding a dish means dropping the file in
`public/images/photo/` and adding a line to that map, with no component changes.
Each entry says whether the file wants `cover` (a full-frame photograph) or
`contain` (a cutout on transparency, which the square and 4:3 card frames would
otherwise crop into), and carries its own alt text; the fallback alt still reads
"Engraving of …", which is only true while the dish is unphotographed.

Photographed so far: Party Jollof, from its own full-frame photograph; Egusi Soup
and the Egusi & Pounded Yam feature card, both still borrowing the hero's cutout.
Grilled Catfish is the conspicuous gap — it sits between the other two in the
Kitchen section's three-card row, which therefore shows all three treatments at
once: a full-bleed photograph, an engraving, and a cutout floating on the card.

Full-frame is the format the cards want. A cutout has to be letterboxed to avoid
cropping the dish, so it floats with the card colour showing around it, while a
full-frame photograph fills the frame edge to edge. Cutouts earn their keep in
the hero, where the plates drift over the background and need transparency; for
menu and feature cards, a photograph that bleeds off its own edges is the better
source.

They needed two different cutout methods. The jollof and the shawarma arrived
flattened onto a transparency checkerboard, so their alpha came from
flood-filling that neutral ground inward from the frame edge. The egusi is a
white plate on a white background — barely ten luminance levels apart, so no
fill can separate them — and its alpha is a circle fitted from the luminance
profiles along the image's four centre axes.

Supplied photographs must arrive without watermarks. A watermark sitting on the
background comes away with the cutout, but one lying on the food itself cannot
be removed — ask for a licensed copy instead.

To use real photography elsewhere, drop files at the same paths and update
`plateFor()` for the extension.

## shadcn / component conventions

The project follows the shadcn layout so components can be dropped in or pulled
with the shadcn CLI without rewiring imports:

- `components.json` — shadcn config (Tailwind v4, no `tailwind.config`, CSS at
  `src/index.css`, lucide icon library).
- `@/*` resolves to `src/*` — declared in `tsconfig.json` and `tsconfig.app.json`
  for the type-checker, and in `vite.config.ts` `resolve.alias` for the bundler.
  Both are required; TypeScript paths alone do not affect the bundle. `baseUrl`
  is deliberately omitted — it is deprecated in TypeScript 6, and `paths`
  resolves relative to the tsconfig without it.
- `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge), which every shadcn
  component imports.
- `src/components/ui/` holds third-party/generated primitives. Keeping them in
  their own folder matters: the shadcn CLI writes and overwrites files there, so
  anything hand-written outside `ui/` is safe from being clobbered on the next
  `shadcn add`, and the boundary keeps "vendored, regenerable" separate from
  "ours".

Two primitives are vendored in `src/components/ui/`:

- `hero-section-7.tsx` — the floating-food hero, driven by `FloatingPlates.tsx`.
- `cuisine-selector-chips.tsx` — a wrapping row of toggle chips that reflow with
  a spring as each grows to fit its tick. It arrives as a full-page cuisine
  picker; the default export keeps that demo intact, and the named `CuisineChips`
  export is the reusable group. `MenuSection.tsx` uses it as the menu's category
  filter, passing `MENU_CATEGORIES` and a `ChipTheme` that swaps the stock
  orange-on-zinc for gold on wine. Selecting nothing shows everything, which is
  what the old `All` chip did; unlike that filter, courses now combine.

Both keep the vendored source recognisable so an upstream update can be diffed
against it. Two deliberate departures in the chip group: `MotionConfig
reducedMotion="user"`, because the site's global reduced-motion CSS only reaches
CSS animation and never Framer Motion's JS-driven transforms; and a ref-tracked
selection, because toggling off the rendered value drops a chip whenever two
toggles land in the same React batch.

`framer-motion` and `lucide-react` are the only runtime dependencies beyond React
and the Tailwind toolchain. Framer Motion is not cheap — it takes the production
bundle from 82&nbsp;kB gzipped to 125&nbsp;kB (271&nbsp;kB to 401&nbsp;kB raw), and
its `layout` animation is the whole point of the chip group, so the lighter
`LazyMotion`/`domAnimation` subset would not cover it. Hand-rolling the reflow in
CSS would remove the dependency at the cost of the spring.

Belle Food's own sections live directly in `src/components/` and use the house
tokens (`bg-ink`, `text-cream`, `text-gold`) rather than the semantic ones.

`src/index.css` also maps the shadcn semantic tokens — `--color-background`,
`--color-primary`, `--color-muted-foreground`, `--color-border`, `--color-ring`
and the rest — onto the Belle Food palette, so a shadcn component dropped in
renders in the house colours instead of default neutral.

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
