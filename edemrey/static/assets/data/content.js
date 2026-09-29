/* ==========================================================================
   Edmery Homes and Properties — site content
   --------------------------------------------------------------------------
   This is the ONE file to edit for listings, services, testimonials, team and
   contact details. Both the static site (edemrey/static) and the React site
   (edemrey/react) read from it.

   Images: put files in edemrey/static/assets/img/ and reference them here by
   file name only (e.g. "lekki-duplex-front.webp"). A 1200px-wide WebP at ~75%
   quality is ideal. The .svg files there now are placeholders.
   ========================================================================== */

export const BUSINESS = {
  name: "Edmery Homes and Properties Limited",
  shortName: "Edmery Homes",
  tagline: "Homes & Properties",
  phoneDisplay: "0802 090 2599",
  phoneIntl: "+2348020902599",           // used for tel: links and schema
  whatsapp: "2348020902599",             // wa.me number, no + or spaces (TODO: confirm with client)
  email: "",                             // TODO: add when the client provides one
  address: {
    line1: "4th Floor, Polystar Building",
    line2: "Marwa, Lekki",
    city: "Lagos",
    postcode: "101233",
    region: "Lagos",
    country: "NG",
  },
  hours: "Open 24 hours",
  rating: 4.9,
  reviewCount: 11,
  googleUrl: "https://www.google.com/maps/search/?api=1&query=Edmery+Homes+and+Properties+Limited+Lekki",
  mapEmbed: "https://www.google.com/maps?q=Polystar+Building,+Marwa,+Lekki,+Lagos&output=embed",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Polystar+Building+Marwa+Lekki+Lagos",
  // Social links: leave "" to hide an icon. TODO: get real handles from the client.
  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
    x: "",
  },
  // Paste a Formspree / Getform / Basin endpoint here to receive form
  // submissions by email. While empty, the form hands the enquiry to WhatsApp.
  formEndpoint: "",
};

export const NAV = [
  { id: "home", label: "Home" },
  { id: "properties", label: "Properties" },
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
];

/* Property categories drive the filter chips. */
export const CATEGORIES = ["Residential", "Commercial", "Industrial"];

/* Search form options. Locations are derived from listings automatically. */
export const PROPERTY_TYPES = ["Residential", "Commercial", "Industrial", "Land"];
export const BUDGETS = [
  { id: "any", label: "Any budget", min: 0, max: Infinity },
  { id: "u20", label: "Under ₦20M", min: 0, max: 20e6 },
  { id: "20-100", label: "₦20M – ₦100M", min: 20e6, max: 100e6 },
  { id: "100-300", label: "₦100M – ₦300M", min: 100e6, max: 300e6 },
  { id: "300p", label: "₦300M and above", min: 300e6, max: Infinity },
];

/* --------------------------------------------------------------------------
   Listings — SAMPLE DATA. Replace with the client's real listings.
   status:   "For Sale" | "For Rent" | "Commercial"
   category: "Residential" | "Commercial" | "Industrial" (filter chips)
   type:     "Residential" | "Commercial" | "Industrial" | "Land" (search)
   period:   "" for a one-off price, "/yr" for annual rent
   size:     square metres
   -------------------------------------------------------------------------- */
export const PROPERTIES = [
  {
    id: "lekki-phase-1-detached-duplex",
    title: "5-Bedroom Detached Duplex with Pool",
    area: "Lekki",
    location: "Lekki Phase 1, Lagos",
    status: "For Sale",
    category: "Residential",
    type: "Residential",
    price: 650e6,
    period: "",
    beds: 5, baths: 6, size: 550,
    featured: true,
    images: ["duplex-dusk.svg", "living-day.svg", "kitchen.svg", "bedroom.svg"],
    description:
      "A contemporary family home on a quiet, secure close in Lekki Phase 1. Double-height living spaces open onto a private pool terrace, with a fitted kitchen, a family lounge upstairs and a self-contained staff room. Minutes from Admiralty Way, schools and the Lekki–Ikoyi Link Bridge.",
    features: ["Swimming pool", "Fitted kitchen with island", "All rooms en-suite", "Boys' quarters", "Parking for 4 cars", "24/7 estate security", "Governor's consent"],
  },
  {
    id: "ikoyi-luxury-apartment",
    title: "3-Bedroom Luxury Apartment",
    area: "Ikoyi",
    location: "Old Ikoyi, Lagos",
    status: "For Rent",
    category: "Residential",
    type: "Residential",
    price: 25e6,
    period: "/yr",
    beds: 3, baths: 4, size: 220,
    featured: true,
    images: ["tower-day.svg", "living-night.svg", "kitchen.svg", "bedroom.svg"],
    description:
      "A high-floor apartment in a serviced tower with lagoon views. Open-plan living and dining, a guest toilet and a balcony off every bedroom. The building has a gym, a pool, backup power and a lift.",
    features: ["Lagoon views", "Gym and pool", "24-hour power backup", "Lift access", "Dedicated parking", "Service charge applies"],
  },
  {
    id: "chevron-terrace",
    title: "4-Bedroom Terrace Duplex",
    area: "Lekki",
    location: "Chevron Drive, Lekki",
    status: "For Sale",
    category: "Residential",
    type: "Residential",
    price: 220e6,
    period: "",
    beds: 4, baths: 5, size: 320,
    featured: true,
    images: ["terrace-day.svg", "terrace-dusk.svg", "living-day.svg", "bedroom.svg"],
    description:
      "A well-finished terrace in a gated estate off Chevron Drive, suited to a first home or a rental investment. A bright ground-floor living area, a family lounge, and a rooftop terrace.",
    features: ["Gated estate", "Rooftop terrace", "Fitted wardrobes", "Boys' quarters", "Paved compound", "C of O"],
  },
  {
    id: "victoria-island-office-floor",
    title: "Grade-A Office Floor",
    area: "Victoria Island",
    location: "Adeola Odeku, Victoria Island",
    status: "Commercial",
    category: "Commercial",
    type: "Commercial",
    price: 95e6,
    period: "/yr",
    beds: null, baths: 4, size: 850,
    featured: true,
    images: ["office-day.svg", "office-interior.svg", "office-dusk.svg"],
    description:
      "A full open-plan floor in a modern glass office tower on one of Victoria Island's main business streets. Ready for fit-out, with a central core, raised floors and generous parking.",
    features: ["Open-plan floor plate", "Raised floors", "Central air-conditioning", "Standby generator", "Basement parking", "Reception and security"],
  },
  {
    id: "ajah-warehouse",
    title: "Warehouse with Loading Bays",
    area: "Ajah",
    location: "Sangotedo, Ajah",
    status: "For Rent",
    category: "Industrial",
    type: "Industrial",
    price: 45e6,
    period: "/yr",
    beds: null, baths: 2, size: 2400,
    featured: true,
    images: ["warehouse-day.svg", "warehouse-dusk.svg"],
    description:
      "A high-clearance warehouse on the Lekki–Epe Expressway corridor with four roller-shutter loading bays, a truck yard and an office mezzanine. Good for distribution, FMCG storage or light assembly.",
    features: ["4 loading bays", "8m eaves height", "Truck turning yard", "Office mezzanine", "3-phase power", "Perimeter fence"],
  },
  {
    id: "lekki-free-trade-zone-plot",
    title: "1-Hectare Industrial Plot",
    area: "Ibeju-Lekki",
    location: "Lekki Free Trade Zone, Ibeju-Lekki",
    status: "For Sale",
    category: "Industrial",
    type: "Industrial",
    price: 480e6,
    period: "",
    beds: null, baths: null, size: 10000,
    featured: true,
    images: ["land-industrial.svg", "land-day.svg"],
    description:
      "A dry, fenced plot inside the Free Trade Zone corridor, close to the Lekki Deep Sea Port and the Dangote Refinery. Suited to manufacturing, logistics or a storage yard.",
    features: ["Dry, level land", "Near Lekki Deep Sea Port", "Good road access", "Fenced and gated", "Survey plan available"],
  },
  {
    id: "oniru-serviced-apartment",
    title: "2-Bedroom Serviced Apartment",
    area: "Victoria Island",
    location: "Oniru, Victoria Island",
    status: "For Rent",
    category: "Residential",
    type: "Residential",
    price: 12e6,
    period: "/yr",
    beds: 2, baths: 3, size: 140,
    featured: true,
    images: ["midrise-dusk.svg", "living-day.svg", "bedroom.svg"],
    description:
      "A fully serviced apartment a short walk from the Oniru beach and Landmark. It has cleaning, security and power included, so it suits expatriates and busy professionals.",
    features: ["Fully serviced", "Furnished option", "Steady power", "Close to the beach", "Secure parking"],
  },
  {
    id: "epe-residential-land",
    title: "600 sqm Residential Plot",
    area: "Epe",
    location: "Lekki–Epe Expressway, Epe",
    status: "For Sale",
    category: "Residential",
    type: "Land",
    price: 18e6,
    period: "",
    beds: null, baths: null, size: 600,
    featured: true,
    images: ["land-day.svg"],
    description:
      "A dry plot in a fast-growing estate along the Lekki–Epe corridor. Build now or hold as an investment. The estate has a gatehouse and an internal road network.",
    features: ["Dry land", "Gated estate", "Internal roads", "Instant allocation", "Flexible payment plan"],
  },
];

/* Icons are named after keys in icons.js. */
export const SERVICES = [
  { icon: "key", title: "Property Sales", text: "Buy or sell with a clear price strategy, verified documents and hands-on negotiation from the first viewing to completion." },
  { icon: "calendar", title: "Rentals & Leasing", text: "Homes, apartments and shortlets matched to your budget and lifestyle, with fair lease terms and tenants we have vetted properly." },
  { icon: "factory", title: "Commercial & Industrial", text: "Offices, retail, warehouses and industrial plots, including Free Trade Zone land along the Lekki–Epe corridor." },
  { icon: "megaphone", title: "Property Marketing", text: "Professional listings, targeted campaigns and a strong buyer network to sell or let your property quickly and at the right price." },
  { icon: "building", title: "Property Management", text: "Rent collection, maintenance, tenant relations and reporting, so your investment runs smoothly without the day-to-day stress." },
  { icon: "chart", title: "Consultation & Valuation", text: "Honest valuations and market advice to help you buy, sell or invest with confidence in the Lagos property market." },
];

/* Why choose us: taken from what clients say in Google reviews. */
export const VALUES = [
  { icon: "shield", title: "Reliable", text: "We do what we say. Clients describe us as dependable from the first call to the final handover." },
  { icon: "route", title: "Smooth Process", text: "Documents, inspections and paperwork are handled for you, so buying or selling feels stress-free." },
  { icon: "map", title: "Market Knowledge", text: "Deep, street-level knowledge of Lekki, Ikoyi, VI and the growing Lekki–Epe corridor." },
  { icon: "handshake", title: "Marketing & Negotiation", text: "Proven marketing strategies and firm negotiation that deliver quick, profitable results." },
];

export const STEPS = [
  { title: "Consult", text: "Tell us what you need: budget, location, timeline. It's free, and you can call us any time, day or night." },
  { title: "Shortlist", text: "We send a curated shortlist of verified properties that match your brief, with no time-wasters." },
  { title: "Inspect", text: "Tour your favourites with an agent who knows each property and neighbourhood inside out." },
  { title: "Close", text: "We negotiate, verify title documents and guide you to a safe, smooth handover." },
];

export const TESTIMONIALS = [
  { name: "Marcus Verli", role: "Home buyer", rating: 5, text: "Edmery Homes exceeded my expectations in helping me find the perfect home. Their team's dedication, professionalism, and market knowledge made the process smooth and stress-free." },
  { name: "Gil Automation", role: "Property seller", rating: 5, text: "Edmery Homes made selling our property hassle-free. Their marketing strategies and negotiation skills were impressive, resulting in a quick and profitable sale." },
  { name: "Lion Dynasty FX", role: "First-time buyer", rating: 5, text: "As a first-time homebuyer, I had many questions and concerns. Edmery Homes provided me with valuable insights, and their patience and support made my home purchase a breeze." },
];

/* About: draft copy. TODO: confirm the story, founding year and people with the client. */
export const ABOUT = {
  story:
    "Edmery Homes and Properties Limited is a Lagos real estate company based in the heart of Lekki. We help families find homes, help owners sell and let with confidence, and help businesses secure the offices, warehouses and industrial land they need to grow.",
  story2:
    "Our clients rate us 4.9 out of 5 on Google for one simple reason: we make property in Lagos feel straightforward. Every listing is checked, every client gets honest advice, and every deal is negotiated as if it were our own.",
  mission:
    "To make buying, selling and leasing property in Lagos transparent, smooth and rewarding, for first-time buyers and seasoned investors alike.",
  image: "living-day.svg",
};

export const TEAM = [
  { name: "Team member name", role: "Managing Director", photo: "" },
  { name: "Team member name", role: "Head of Sales & Lettings", photo: "" },
  { name: "Team member name", role: "Commercial & Industrial Lead", photo: "" },
];

/* Contact form "interest" options */
export const INTERESTS = ["Buying a property", "Renting a property", "Selling my property", "Letting / property management", "Commercial or industrial space", "Valuation or consultation"];
