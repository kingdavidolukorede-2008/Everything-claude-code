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

`public/images/photo/` holds photography rather than linework. The hero's largest
plate is `jollof-rice.webp` — a supplied stock cutout, background removed and
re-encoded to a 576×576 transparent WebP (2× its 288px maximum display width).
It is the one photograph on the page; everything else is engraved.

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
