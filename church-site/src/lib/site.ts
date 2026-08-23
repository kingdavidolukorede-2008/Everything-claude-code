/* ============================================================
   Single source of truth for church details and content.
   Everything the church may want to change lives here.
   ============================================================ */

export const CHURCH = {
  name: "Ever Increasing Grace and Revival Fire Assembly",
  shortName: "Ever Increasing Grace",
  nickname: "The Yoke Breaker",
  phoneDisplay: "0802 339 8788",
  phoneHref: "tel:+2348023398788",
  whatsapp:
    "https://wa.me/2348023398788?text=Good%20day.%20Please%20pray%20with%20me%20about%3A%20",
  address: {
    line1: "13 Unity Road, Off Command Road",
    line2: "Unity Bus Stop, Ipaja",
    line3: "Alimosho, Lagos 102213",
    full: "13 Unity Road, Off Command Road, Unity Bus Stop, Ipaja, Alimosho, Lagos 102213",
  },
  scripture: {
    text: "To open the blind eyes, to bring out the prisoners from the prison, and them that sit in darkness out of the prison house.",
    ref: "Isaiah 42:7",
  },
} as const;

export const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  `${CHURCH.name}, ${CHURCH.address.full}`,
)}&output=embed`;

export const MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${CHURCH.name}, ${CHURCH.address.full}`,
)}`;

/* ------------------------------------------------------------
   Photography.

   These are remote placeholders so the site looks right on first
   run. Replace each URL with the church's own photograph — drop the
   file in `public/images/` and use "/images/your-file.jpg".
   Every one renders through <Photo>, which falls back to a branded
   panel if a URL ever fails, so a bad link never shows a broken icon.
   ------------------------------------------------------------ */
export const IMAGES = {
  congregation:
    "https://images.pexels.com/photos/8468/pexels-photo-8468.jpeg?auto=compress&cs=tinysrgb&w=1400",
  community:
    "https://images.pexels.com/photos/29093766/pexels-photo-29093766.jpeg?auto=compress&cs=tinysrgb&w=1400",
  celebration:
    "https://images.pexels.com/photos/7520361/pexels-photo-7520361.jpeg?auto=compress&cs=tinysrgb&w=1400",
  pastors:
    "https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg?auto=compress&cs=tinysrgb&w=1400",
} as const;

/* ------------------------------------------------------------
   Navigation. `to` values with a hash resolve to a section on the
   home page; plain paths are routes.
   ------------------------------------------------------------ */
export type NavItem = {
  label: string;
  to: string;
  children?: { label: string; to: string }[];
};

export const NAV: NavItem[] = [
  { label: "About", to: "/about" },
  {
    label: "Quick links",
    to: "/#visit",
    children: [
      { label: "Plan your first visit", to: "/#visit" },
      { label: "Send a prayer request", to: "/#prayer" },
      { label: "Service schedule", to: "/#gatherings" },
      { label: "Directions to the church", to: "/#map" },
    ],
  },
  { label: "Gatherings", to: "/#gatherings" },
  { label: "Community", to: "/#community" },
  { label: "Sermons", to: "/#sermons" },
  { label: "Map", to: "/#map" },
  { label: "Give", to: "/#give" },
];

/* ------------------------------------------------------------
   Weekly rhythm
   ------------------------------------------------------------ */
export type Gathering = {
  day: string;
  name: string;
  time: string;
  note: string;
};

export const GATHERINGS: Gathering[] = [
  {
    day: "Sunday",
    name: "Worship service",
    time: "8:00 – 11:00 am",
    note: "Praise, the word, and prayer for anyone who comes forward. Start here.",
  },
  {
    day: "Tuesday",
    name: "Bible study",
    time: "5:30 – 7:00 pm",
    note: "Slower, seated, question-friendly. One book at a time.",
  },
  {
    day: "Thursday",
    name: "Revival hour",
    time: "5:30 – 7:00 pm",
    note: "Intercession for the church, for Ipaja, and for the week's requests.",
  },
  {
    day: "Last Friday",
    name: "Night vigil",
    time: "10:00 pm – 2:00 am",
    note: "Once a month. Long, loud, and the reason people call us The Yoke Breaker.",
  },
];

/* ------------------------------------------------------------
   First-visit reassurance
   ------------------------------------------------------------ */
export const VISIT_NOTES = [
  {
    title: "Finding the gate",
    body: "Unity Bus Stop on Unity Road, off Command Road. Number 13 — a short walk from the stop, and anyone at the junction can point you to it.",
  },
  {
    title: "Wear what you own",
    body: "Lace and gele, or the shirt you wore to work. Nobody is checking, and nobody will comment.",
  },
  {
    title: "Nobody will single you out",
    body: "You will not be asked to stand, introduce yourself, or give. Sit quietly if you prefer. That is a fine first Sunday.",
  },
];
