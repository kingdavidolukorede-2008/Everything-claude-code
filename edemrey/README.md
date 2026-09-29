# Edmery Homes and Properties: website

A conversion-focused, mobile-first website for **Edmery Homes and Properties Limited**, a real estate agency at 4th Floor, Polystar Building, Marwa, Lekki, Lagos.

There are two builds of the same design, and both read from **one content file**:

| Build | Folder | Use it when |
|---|---|---|
| **Static** (HTML/CSS/JS, no dependencies) | `static/` | You want the fastest load on Nigerian mobile networks and an upload-anywhere deploy. **Recommended for launch.** |
| **React + Vite** | `react/` | A developer will extend the site, for example with a CMS, a listings API or more pages. |

```
edemrey/
├── static/                    ← static site, and home of all shared assets
│   ├── index.html             markup, meta/Open Graph, RealEstateAgent JSON-LD
│   └── assets/
│       ├── data/content.js    ★ EDIT THIS: business info, listings, services, reviews, team
│       ├── data/lib.js        shared logic: price formatting, filters, validation, WhatsApp links
│       ├── data/icons.js      shared line-icon set
│       ├── css/styles.css     the whole design system (used by both builds)
│       ├── js/app.js          static-site components and behaviour
│       └── img/               images (the .svg files are placeholders)
└── react/
    ├── index.html             same meta and schema as the static build
    ├── vite.config.js         aliases @data and @css to ../static/assets
    └── src/
        ├── App.jsx            shell, hash router, filter state
        ├── components/        Navbar, Hero, SearchBar, TrustBar, Properties, PropertyCard,
        │                      Sections (Services, WhyUs, HowItWorks, About), Testimonials,
        │                      Contact, ContactForm, Footer, MobileContactBar, PropertyDetail
        └── hooks/             useHashRoute, useReveal
```

## Running it

**Static.** ES modules need a web server, since they don't run from `file://`:
```bash
cd edemrey/static && python3 -m http.server 8000     # open http://localhost:8000
```
To deploy, upload the contents of `static/` to any host: Netlify, Vercel, GitHub Pages, cPanel, or S3.

**React:**
```bash
cd edemrey/react
npm install
npm run dev        # development server
npm run build      # production build in react/dist/, deploy that folder
```

## Editing content

Everything lives in `static/assets/data/content.js`, and both builds pick up changes automatically.

- **Listings** are in `PROPERTIES`. Each entry drives its card, the filter chips, the search and its detail page (`#/property/<id>`).
  ```js
  { id: "lekki-phase-1-detached-duplex", title: "5-Bedroom Detached Duplex with Pool",
    area: "Lekki", location: "Lekki Phase 1, Lagos",
    status: "For Sale",            // "For Sale" | "For Rent" | "Commercial"
    category: "Residential",       // filter chip: Residential | Commercial | Industrial
    type: "Residential",           // search: Residential | Commercial | Industrial | Land
    price: 650e6, period: "",      // period "/yr" for rent
    beds: 5, baths: 6, size: 550,  // size in sqm, use null to hide beds/baths
    featured: true,
    images: ["lekki-duplex-1.webp", "lekki-duplex-2.webp"],
    description: "…", features: ["Swimming pool", "…"] }
  ```
  The `area` values automatically become the search form's location list.
- **Photos** go in `static/assets/img/`, referenced by file name. Use landscape WebP at about 1200px wide and 70–80% quality (roughly 80–150 KB each).
- **Phone, WhatsApp, address and hours** are in `BUSINESS`. The phone number also appears in `index.html` (in the JSON-LD and the `<noscript>` fallbacks) in both builds, so update it there too.
- **Receiving form submissions by email:** create a free form at Formspree (or Getform/Basin) and paste its URL into `BUSINESS.formEndpoint`. Until then, a submitted form opens WhatsApp with the enquiry already written out.
- **Social links:** fill in `BUSINESS.social`.
- **Colours and fonts:** the `:root` tokens at the top of `static/assets/css/styles.css`.

## Design decisions

**Colour.** Deep navy (`#0B1F3A`) carries authority and trust. It's used for the header, the "Why choose us" band, the contact card and the footer, so the page alternates between light and dark surfaces. Warm gold (`#C9A24B`) is kept for one thing per section: the primary button, section rules and icon accents. That restraint is what makes it read as premium rather than flashy. Gold fails contrast as text on light backgrounds, so there is a darker text-safe `--gold-ink` (`#7F6120`, 5.3:1), and gold is otherwise only paired with navy (6.9:1). Every text pair meets WCAG AA; the ratios are commented in the tokens.

**Typography.** Fraunces, a soft high-contrast serif, gives headings an editorial, high-end-agency feel. Inter keeps body text, forms and prices crisp on small, low-DPI Android screens. The type scale is fluid (`clamp()`), with body text at 16px/1.7 for comfortable reading. Small-caps gold "eyebrow" labels with a hairline rule repeat above every section as a signature detail.

**Layout.** It's mobile-first. The hero leads with the headline and two CTAs, and the search card overlaps the hero's bottom edge so search is visible without scrolling on most phones. After that the page makes its argument in order: trust signals, then inventory, then services, then proof (review-derived values, process, testimonials), then people, then contact. Each section has exactly one gold primary CTA. On phones, a sticky Call / WhatsApp bar keeps contact one tap away, and the property grid steps from 1 column to 2 to 4 at 360px, 768px and 1280px.

**Performance on slow connections.** The static build ships no JS framework: about 19 KB of gzipped JS including all the content, and the placeholder art is vector at under 21 KB per image. Images lazy-load with fixed dimensions so nothing jumps. Fonts use `display=swap`. Google Maps (about 1 MB) only loads when someone taps the map. Animations are a single IntersectionObserver fade-and-rise, and they are switched off under `prefers-reduced-motion`.

**Accessibility.** The markup is semantic (landmarks, a real `<form>` and `<ol>`), with a skip link and visible gold focus rings. The mobile menu has a focus trap and closes on Escape. Form errors are linked to their fields with `aria-describedby` and focus moves to the first invalid field. Live-region announcements cover filter results and form states. The carousel is keyboard-operable and the gallery supports arrow keys and swipe. All images have descriptive alt text or are marked decorative.

**Local SEO.** The site has a descriptive `<title>` and meta description, Open Graph and Twitter tags, and the `en_NG` locale. It also carries `RealEstateAgent` JSON-LD with the address, phone, 24/7 opening hours, areas served, a 4.9 rating from 11 reviews, and the three reviews.

## What we still need from the client

1. **Logo** as SVG, plus brand colours if they differ from the placeholder navy and gold. The monogram in the header, footer and favicon is a stand-in.
2. **Real listings:** title, location, price (sale or annual rent), beds, baths, size, status, description, features and title documents (C of O, Governor's consent and so on).
3. **Professional photography:** 4–8 landscape photos per listing, a hero image (ideally their best Lekki property at dusk), an office or team photo for the About section, and a 1200×630 image for social sharing (`og-image.jpg`).
4. **Team details:** names, roles, headshots, and optionally short bios and direct lines.
5. **Social media links:** Instagram, Facebook, LinkedIn and X handles, or tell us which to hide.
6. **Confirmation that 0802 090 2599 is on WhatsApp**, or a separate WhatsApp business number.
7. **An email inbox for enquiries** (to set up the form endpoint) and a public email address to display.
8. **Domain name** (e.g. edmeryhomes.com) to update the canonical and Open Graph URLs.
9. **Their Google Business Profile link**, so the rating badge and "Get directions" point to the exact listing, and ideally the office's map coordinates for the schema.
10. **Company story:** founding year, milestones, number of deals closed, and any RC/CAC registration or professional memberships they'd like to show. The current About copy is a draft that makes no factual claims beyond the Google rating.
11. **Permission** to feature the three named reviewers' testimonials, plus any further reviews they'd like shown.
