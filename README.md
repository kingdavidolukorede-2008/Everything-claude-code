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
  interior scenes and the About room. `gallery-4.svg` is still generated but no
  longer used: a photograph of the real forecourt took that tile.

Dish plates are square (1000×1000) so they crop safely to the 4:3 featured cards
and read cleanly at thumbnail size; scenes are 1200×900. Each dish's artwork is
resolved from its id by `plateFor()` in `src/utils/format.ts`, so adding a menu
item means adding a composition of the same id — nothing else to wire up.

`public/images/photo/` holds photography rather than linework. The hero's three
food subjects are stock cutouts, backgrounds removed and re-encoded as
transparent WebP at 2× their maximum display width: `jollof-rice.webp` (576×576),
`shawarma-wrap.webp` (384×384) and `egusi-pounded-yam.webp` (384×384).

Two of them are the restaurant's own photographs of itself, the only images on
the site that need no licence.

`belle-food-storefront.webp` (722×542) is the frontage from the street at night,
used by the About section. It is cropped to the 4:3 the section's frame expects
and carries a light grade — contrast 1.10, saturation 1.08 — so it sits with the
dark palette. Nothing else is retouched. It ships at its native resolution, which
is short of 2× the 524px display width; a higher-resolution original would
sharpen it on retina screens.

`forecourt-night.webp` (1200×900) is the forecourt looking back at the entrance,
and it fills the fourth tile of the Look Inside gallery. It is a portrait phone
frame, so the 4:3 is a horizontal band taken out of it: high enough to hold the
whole lit sign, low enough to keep the delivery bikes, and stopping just above
the parked car's number plate, which is a private vehicle's and does not belong
on the page. It ships ungraded — the festoon bulbs are already at the clip point,
and the standard grade took blown pixels from 0.60% of the frame to 1.12%.

The rest are dish photographs, all WebP q74 and all full-frame but one:

| File | Size | Dish |
| --- | --- | --- |
| `party-jollof.webp` | 800 | Party Jollof (menu + Kitchen feature) |
| `whole-catfish.webp` | 800 | Grilled Catfish / Whole Catfish (menu + Kitchen feature) |
| `peppered-snail.webp` | 512 | Peppered Snail |
| `puff-puff.webp` | 512 | Puff-Puff |
| `spring-rolls.webp` | 512 | Spring Rolls |
| `chicken-suya.webp` | 375 | Chicken Suya Skewers |
| `efo-riro.webp` | 512 | Efo Riro |
| `catfish-pepper-soup.webp` | 440 | Catfish Pepper Soup |
| `pounded-yam.webp` | 512 | Pounded Yam / Eba / Semo |
| `native-fried-rice.webp` | 512 | Native Fried Rice |
| `ofada-ayamase.webp` | 420 | Ofada Rice & Ayamase |
| `coconut-rice.webp` | 440 | Coconut Rice |
| `peppered-chicken.webp` | 512 | Peppered Chicken |
| `turkey-chips.webp` | 512 | Turkey & Chips |
| `chilled-malt.webp` | 306×512 | Chilled Malt (cutout) |

800px covers the Kitchen feature card at 2×; 512px covers the 112px menu
thumbnail at better than 4×, which is all the dishes that are not featured need.
`chicken-suya.webp` ships at 375 because that is its source's full height — it is
not upscaled, and it would need a larger original before it could be featured.

Cropping follows one rule: crop inside the plate. Several sources are a dish shot
on a white ground, and a square taken from the whole frame brings that white into
the card, where it glares against the wine. Cropping to a square that sits inside
the vessel gives a card filled edge to edge with food instead. The snail and efo
riro squares are inscribed in their bowls; the spring rolls are cropped into the
pile rather than the plate; the suya crop also avoids the newsprint the bowl is
lined with, so no lettering ends up on the page.

Grading is a light contrast 1.06 / saturation 1.04, applied only when it does not
cost highlights: blown pixels are counted before and after, and the plain version
wins when the graded one clips. `whole-catfish.webp` failed that check — its foil
was already within a few levels of clipping, and the grade took blown highlights
from 2.6% of the frame to 4.3% — so it ships as shot.
`belle-food-storefront.webp` carries a slightly stronger 1.10 / 1.08.

`pounded-yam.webp` needed the opposite treatment. Swallow is pale food on a white
plate, and 36% of that frame came in fully blown — a third of the card would have
been flat white burning a hole in a dark page. It gets a highlight rolloff instead
of a contrast bump: everything above 195 is compressed into the top band and the
whole image pulled down 7%, which takes blown pixels to zero while leaving the
mid-tones alone, so the balls keep their shape and sheen.

Those are all the photographs on the page. Everything else is engraved: the two
herb plates drifting in the hero, and three of the four Look Inside tiles.

Dish photographs are registered in `src/data/photos.ts` and resolved by
`dishImage()` in `src/utils/format.ts`. A dish with no entry falls back to its
engraving at `/images/<id>.svg`, so the menu can be photographed one plate at a
time without ever showing a gap — adding a dish means dropping the file in
`public/images/photo/` and adding a line to that map, with no component changes.
Each entry says whether the file wants `cover` (a full-frame photograph) or
`contain` (a cutout on transparency, which the square and 4:3 card frames would
otherwise crop into), and carries its own alt text; the fallback alt still reads
"Engraving of …", which is only true while the dish is unphotographed.

Fifteen of the sixteen dishes have their own photograph, and no dish is engraved
any more. Egusi Soup is the exception: it and the Egusi & Pounded Yam feature card
still borrow the hero's cutout, which is why the Kitchen row reads as two
full-bleed photographs beside one floating plate. A full-frame egusi is the last
photograph the menu is waiting on.

`chilled-malt.webp` is the one dish photograph that is not full-frame. Its source
is a product shot of bottles standing on white, which no crop can turn into a
filled square, so it is cut out and framed `contain` like the hero plates. It also
carries the drink's own label, which is the only lettering on any photograph on
the page.

Full-frame is the format the cards want. A cutout has to be letterboxed to avoid
cropping the dish, so it floats with the card colour showing around it, while a
full-frame photograph fills the frame edge to edge. Cutouts earn their keep in
the hero, where the plates drift over the background and need transparency; for
menu and feature cards, a photograph that bleeds off its own edges is the better
source.

They needed three different cutout methods. The jollof and the shawarma arrived
flattened onto a transparency checkerboard, so their alpha came from
flood-filling that neutral ground inward from the frame edge. The egusi is a
white plate on a white background — barely ten luminance levels apart, so no
fill can separate them — and its alpha is a circle fitted from the luminance
profiles along the image's four centre axes. The malt bottles stand on white with
a soft contact shadow, which a hard threshold leaves behind as a grey pool on the
wine; its fill ramps alpha between luminance 196 and 238 instead of cutting at one
level, so the shadow fades out with the ground.

Supplied photographs must arrive without watermarks. A watermark sitting on the
background comes away with the cutout, but one lying on the food itself cannot be
removed, and cropping it out is not a way around it either — either way the
protected image ends up published with its mark gone. A watermarked source is
turned away and a licensed copy asked for instead. One has been so far: a fried
rice first offered for Coconut Rice, carrying a photographer's mark across the pan
rim and the rice. A clean photograph replaced it.

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
