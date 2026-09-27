/* ==========================================================================
   Havenmark Properties — site content
   Everything a non-developer edits lives in this file: business details and
   listings. The pages read from here; nothing else needs touching to rebrand
   or reprice.
   ========================================================================== */
window.SITE = {
  name: "Havenmark Properties",
  area: "Lekki",
  // International format, digits only — used for wa.me and tel: links.
  whatsapp: "2348000000000",
  phoneDisplay: "+234 800 000 0000",
  email: "hello@havenmark.ng",
  address: "Plot 12, Admiralty Way, Lekki Phase 1, Lagos",
  hours: "Mon–Fri 9am–6pm · Sat 10am–4pm",
  cac: "RC 1234567",
  // Formspree form ID (the part after /f/ in the endpoint, e.g. "xyzabcde"),
  // or the full endpoint URL. Both forms post here; each submission's subject
  // line says which form it came from. Leave "" to run without a backend: the
  // forms still confirm, and the visitor can send the details on WhatsApp.
  formspree: "",
  yearsExperience: 12,
  propertiesManaged: 260,
  happyTenants: 1800,
  social: {
    instagram: "https://instagram.com/havenmark.ng",
    facebook: "https://facebook.com/havenmark.ng",
    tiktok: "https://tiktok.com/@havenmark.ng",
    x: "https://x.com/havenmark_ng"
  }
};

/* Photos are Unsplash placeholders. Swap `src` for the client's own photos
   (any URL, or a file in assets/img/). If an image fails to load, the frame
   falls back to a branded gradient rather than a broken-image icon. */
(function () {
  var u = function (id) { return "https://images.unsplash.com/photo-" + id; };
  var P = {
    exterior1: u("1600596542815-ffad4c1539a9"),
    exterior2: u("1600585154340-be6161a56a0c"),
    villaPool: u("1512917774080-9991f1c4c750"),
    luxury:    u("1613490493576-7fde63acd811"),
    terrace:   u("1600047509807-ba8f99d2cdde"),
    house:     u("1580587771525-78b9dba3b914"),
    block:     u("1545324418-cc1a3fa10c00"),
    living1:   u("1600607687939-ce8a6c25118c"),
    living2:   u("1600210492486-724fe5c67fb0"),
    living3:   u("1493809842364-78817add7ffb"),
    apt1:      u("1502672260266-1c1ef2d93688"),
    apt2:      u("1522708323590-d24dbb6b0267"),
    apt3:      u("1560448204-e02f11c3d0e2"),
    kitchen1:  u("1600566753190-17f0baa2a6c3"),
    kitchen2:  u("1484154218962-a197022b5858"),
    bed1:      u("1505691938895-1758d7feb511"),
    bed2:      u("1540518614846-7eded433c457"),
    bath:      u("1552321554-5fefe8c9ef14")
  };
  window.PHOTOS = P;

  /* Listing fields
     id        short ref, also the URL (?id=hm-101)
     deal      "rent" | "sale"
     price     naira, a number; rent is per year
     type      one of the property types used by the search filter
     video     optional YouTube video ID for the tour; leave "" to offer a
               live WhatsApp video walkthrough instead
     fees      optional one-off costs shown in the "total move-in" breakdown */
  window.LISTINGS = [
    {
      id: "hm-101", deal: "rent", featured: true,
      title: "3-Bedroom Terrace Duplex",
      location: "Chevron Drive", type: "Terrace",
      price: 6500000, beds: 3, baths: 4, size: 220,
      summary: "Bright, newly finished terrace in a gated mini-estate two minutes from Chevron roundabout.",
      description: [
        "A newly finished three-bedroom terrace duplex in a quiet, gated estate of eight units off Chevron Drive. Every room is en-suite, with a guest toilet downstairs and a fitted kitchen with store.",
        "The estate runs on a central transformer with a 60kVA backup generator, has a treated borehole, and is manned by a uniformed security team round the clock. Two dedicated parking spaces per unit."
      ],
      features: { parking: "2 cars, interlocked", security: "24/7 guards, CCTV, gated", water: "Treated borehole", power: "Estate transformer + 60kVA backup" },
      amenities: ["All rooms en-suite", "Fitted kitchen", "Guest toilet", "Walk-in closet", "Balcony", "Pop ceiling"],
      fees: { "Service charge": 750000, "Agency (10%)": 650000, "Legal (10%)": 650000, "Caution deposit": 500000 },
      video: "",
      photos: [[P.terrace, "Front of the terrace duplex"], [P.living1, "Open-plan living room"], [P.kitchen1, "Fitted kitchen"], [P.bed1, "Master bedroom"], [P.bath, "En-suite bathroom"]]
    },
    {
      id: "hm-102", deal: "sale", featured: true,
      title: "4-Bedroom Fully Detached Duplex with BQ",
      location: "Ikota", type: "Detached",
      price: 185000000, beds: 4, baths: 5, size: 450,
      summary: "Contemporary detached home with a boys' quarters, on a 450sqm plot inside a serviced estate.",
      description: [
        "A contemporary four-bedroom fully detached duplex on a 450sqm plot in a well-serviced Ikota estate, with a one-room boys' quarters, family lounge upstairs and a spacious compound.",
        "Documents are clean and verifiable: Governor's Consent, approved building plan and survey. We arrange lawyer-to-lawyer verification before any payment."
      ],
      features: { parking: "4 cars, compound", security: "Estate gate, patrols, CCTV", water: "Borehole + treatment plant", power: "Prepaid meter, solar-ready" },
      amenities: ["Boys' quarters", "Family lounge", "Study", "Walk-in closet", "Balconies", "Governor's Consent"],
      title_doc: "Governor's Consent",
      video: "",
      photos: [[P.exterior1, "Front elevation of the detached duplex"], [P.living2, "Main living room"], [P.kitchen2, "Kitchen"], [P.bed2, "Bedroom"], [P.bath, "Bathroom"]]
    },
    {
      id: "hm-103", deal: "rent", featured: true,
      title: "2-Bedroom Serviced Apartment",
      location: "Lekki Phase 1", type: "Apartment",
      price: 5000000, beds: 2, baths: 3, size: 140,
      summary: "Fully serviced flat with 24-hour power, gym and pool — minutes from Admiralty Way.",
      description: [
        "A two-bedroom serviced apartment in a modern block off Admiralty Way. Service charge covers 24-hour power, water, cleaning of common areas, the gym and the swimming pool.",
        "Ideal for a professional couple or a small family who want to be close to Lekki's restaurants, schools and offices without the hassle of running a house."
      ],
      features: { parking: "1 allocated space", security: "Concierge, access control, CCTV", water: "Treated borehole", power: "24hr — grid + central generator" },
      amenities: ["Swimming pool", "Gym", "Elevator", "Fitted kitchen", "Air-conditioning", "Balcony"],
      fees: { "Service charge": 1500000, "Agency (10%)": 500000, "Legal (10%)": 500000, "Caution deposit": 300000 },
      video: "",
      photos: [[P.block, "Apartment block exterior"], [P.apt1, "Living area"], [P.apt2, "Dining and lounge"], [P.bed1, "Bedroom"], [P.kitchen1, "Kitchen"]]
    },
    {
      id: "hm-104", deal: "rent", featured: true,
      title: "1-Bedroom Apartment (Mini Flat)",
      location: "Agungi", type: "Apartment",
      price: 2200000, beds: 1, baths: 1, size: 60,
      summary: "Neat mini flat in a quiet compound, close to Lekki–Epe Expressway and Agungi bridge.",
      description: [
        "A clean, well-finished one-bedroom apartment in a compound of six flats in Agungi, a short walk from the Lekki–Epe Expressway.",
        "Prepaid meter, steady borehole water and a caretaker on site. A good first home for a young professional working on the Island or in Lekki."
      ],
      features: { parking: "1 car", security: "Gated, caretaker on site", water: "Borehole", power: "Prepaid meter" },
      amenities: ["Wardrobe", "Tiled floors", "Kitchen cabinets", "Water heater"],
      fees: { "Service charge": 200000, "Agency (10%)": 220000, "Legal (10%)": 220000, "Caution deposit": 100000 },
      video: "",
      photos: [[P.apt3, "Living room of the mini flat"], [P.bed2, "Bedroom"], [P.kitchen2, "Kitchen"], [P.bath, "Bathroom"]]
    },
    {
      id: "hm-105", deal: "sale", featured: true,
      title: "5-Bedroom Detached Mansion with Pool",
      location: "Osapa London", type: "Detached",
      price: 450000000, beds: 5, baths: 6, size: 650,
      summary: "Architect-designed home with a pool, cinema room and a two-room BQ on a 650sqm plot.",
      description: [
        "An architect-designed five-bedroom mansion in Osapa London with a swimming pool, cinema room, family lounge, and a two-room boys' quarters, finished to a very high standard.",
        "Smart-home lighting, full solar-and-inverter backup, and C of O title. Viewings are by appointment with proof of funds."
      ],
      features: { parking: "6 cars, gated compound", security: "Electric fence, CCTV, estate patrol", water: "Borehole + treatment plant", power: "Solar + inverter + generator" },
      amenities: ["Swimming pool", "Cinema room", "Two-room BQ", "Smart-home lighting", "Family lounge", "C of O"],
      title_doc: "Certificate of Occupancy (C of O)",
      video: "",
      photos: [[P.villaPool, "Mansion with swimming pool"], [P.luxury, "Front of the mansion at dusk"], [P.living3, "Formal living room"], [P.kitchen1, "Kitchen"], [P.bed1, "Master suite"], [P.bath, "Master bathroom"]]
    },
    {
      id: "hm-106", deal: "rent", featured: true,
      title: "4-Bedroom Semi-Detached Duplex",
      location: "Lekki Phase 1", type: "Semi-detached",
      price: 12000000, beds: 4, baths: 5, size: 300,
      summary: "Spacious family home with a BQ on a quiet close, near top schools in Lekki Phase 1.",
      description: [
        "A spacious four-bedroom semi-detached duplex with a one-room boys' quarters on a quiet close in Lekki Phase 1, near several of the area's best schools.",
        "Large living and dining area, family lounge upstairs and a private compound. Estate power with a dedicated inverter backup in the unit."
      ],
      features: { parking: "3 cars, private compound", security: "Estate gate, guards, CCTV", water: "Treated borehole", power: "Estate power + inverter" },
      amenities: ["Boys' quarters", "Family lounge", "Private compound", "Fitted kitchen", "Laundry room"],
      fees: { "Service charge": 1200000, "Agency (10%)": 1200000, "Legal (10%)": 1200000, "Caution deposit": 750000 },
      video: "",
      photos: [[P.house, "Front of the semi-detached duplex"], [P.living1, "Living room"], [P.kitchen2, "Kitchen"], [P.bed2, "Bedroom"], [P.bath, "Bathroom"]]
    }
  ];

  window.TESTIMONIALS = [
    { name: "Adaeze O.", role: "Tenant, Lekki Phase 1", quote: "They sent a video walkthrough before I even left work, and the flat looked exactly like it. No surprise fees — the breakdown they gave was what I paid." },
    { name: "Tunde B.", role: "Landlord, Chevron", quote: "Rent comes in on time and I get a proper report every quarter. I stopped taking tenant calls at midnight the month I signed with them." },
    { name: "Mrs. Folake A.", role: "Bought in Ikota", quote: "Their lawyer walked us through the Governor's Consent line by line. As a first-time buyer in Lagos, that is what made me trust them." }
  ];
})();
