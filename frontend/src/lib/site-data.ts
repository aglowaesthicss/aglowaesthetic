export const SITE = {
  name: "Aglow Aesthetics",
  motto: "The Pinnacle of Korean Skincare Prestige",
  tagline: "Transforming skin, beauty and wellness with authentic Korean care",
  intro: "Chennai's First Ever Korean Aesthetics",
  phone: "9994390069",
  phoneHref: "tel:+919994390069",
  address:
    "Door No. 5, Plot No. 33, 2nd Floor, Sapthagiri Nagar, Inner Ring Road, Puzhuthivakkam, Chennai - 600091",
  mapsUrl: "https://www.google.com/maps?q=12.9746823,80.2081747&z=17&hl=en",
  mapsEmbed:
    "https://www.google.com/maps?q=12.9746823,80.2081747&z=17&hl=en&output=embed",
  hours: "Monday – Sunday · 10:00 AM – 8:00 PM",
} as const;

export const ABOUT_PARAGRAPHS = [
  "At Aglow Aesthetics, located in the heart of Puzhuthivakkam, Chennai, we bring you the secrets of flawless, glass-skin beauty straight from South Korea. As Chennai's First Ever Korean Aesthetic Clinic, we combine advanced South Korean skincare technology, innovative techniques, and individualized treatments to enhance your natural beauty and boost your confidence.",
  "We believe that true beauty starts with healthy skin and holistic wellness. Our clinic offers a comprehensive range of personalized treatments tailored for Skin, Beauty and Wellness. Whether you are looking for deep skin rejuvenation, glow-enhancing therapies, anti-aging solutions, or relaxing aesthetic care, our expert team is here to guide you on your transformation journey.",
  "Experience world-class Korean aesthetic standards right here in Puzhuthivakkam.",
];

export const HIGHLIGHTS = [
  {
    icon: "sparkles",
    title: "Authentic Korean Expertise",
    body: "World-renowned Korean skincare procedures and advanced aesthetic technology, brought to Chennai.",
  },
  {
    icon: "leaf",
    title: "Skin, Beauty & Wellness",
    body: "A holistic approach designed to help you look radiant and feel refreshed from within.",
  },
  {
    icon: "stethoscope",
    title: "Personalized Care",
    body: "Customized treatment plans tailored specifically to your unique skin type and concerns.",
  },
  {
    icon: "map-pin",
    title: "Convenient Location",
    body: "A modern, hygienic and relaxing clinic setup in Puzhuthivakkam, Chennai.",
  },
] as const;

export type ServiceCategory = {
  slug: string;
  title: string;
  note?: string;
  blurb: string;
  services: { name: string; note?: string }[];
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    slug: "skin-rejuvenation",
    title: "Skin Rejuvenation & Resurfacing",
    blurb:
      "Resurface, refine and renew for that signature Korean glass-skin clarity.",
    services: [
      { name: "Medical Grade Chemical Peels" },
      { name: "Micro Needling" },
      { name: "Laser Skin Resurfacing" },
      { name: "Intense Pulsed Light" },
      { name: "Advanced Facials" },
      { name: "Derma Planing" },
    ],
  },
  {
    slug: "skin-tightening",
    title: "Energy Based Skin Tightening & Lifting",
    blurb:
      "Non-surgical lifting technologies that restore contour, firmness and definition.",
    services: [
      { name: "High Intensity Focused Ultrasound (HIFU)" },
      { name: "Radio Frequency" },
      { name: "RF Micro Needling" },
      { name: "Thread Lifts", note: "Performed only by doctors" },
    ],
  },
  {
    slug: "hair-regenerative",
    title: "Hair & Regenerative Therapies",
    blurb: "Advanced regenerative protocols for scalp health and hair density.",
    services: [
      { name: "Exosome Therapy" },
      { name: "Scalp Micro Needling & Hair Mesotherapy" },
    ],
  },
  {
    slug: "iv-nutrient-infusions",
    title: "IV Nutrient Infusions",
    blurb: "Wellness from within — nutrient therapy for radiance and vitality.",
    services: [{ name: "Skin & Wellness Drips" }],
  },
  {
    slug: "injectables",
    title: "Injectables & Anti-Aging",
    note: "Strictly by professional doctors",
    blurb: "Precision injectables for natural, refined and age-defying results.",
    services: [
      { name: "Botox" },
      { name: "Dermal Fillers" },
      { name: "Bio Stimulators" },
      { name: "Skin Boosters" },
    ],
  },
  {
    slug: "lasers",
    title: "Lasers",
    blurb: "Clinical laser technology for clarity, smoothness and lasting comfort.",
    services: [{ name: "Carbon Laser" }, { name: "Laser Hair Reduction" }],
  },
];

export const ALL_SERVICE_NAMES = SERVICE_CATEGORIES.flatMap((c) =>
  c.services.map((s) => s.name),
);

export type Offer = {
  id: string;
  title: string;
  special: boolean;
  discount: string;
  description: string;
  promoCode?: string;
  startDate: string;
  endDate: string;
};

export const OFFERS: Offer[] = [
  {
    id: "grand-opening-20",
    title: "Grand Opening Offer",
    special: true,
    discount: "20% OFF",
    description:
      "Get 20% instant discount on your very first treatment session at Aglow Aesthetics.",
    promoCode: "AGLOW20",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
  },
];

export type Testimonial = {
  id: string;
  type: "text" | "instagram" | "youtube";
  author: string;
  treatment?: string;
  quote?: string;
  url?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    type: "text",
    author: "Divya R.",
    treatment: "Advanced Facial",
    quote:
      "My skin has never looked this clear. The Korean protocols here are on another level — calm, clinical and genuinely effective.",
  },
  {
    id: "t2",
    type: "text",
    author: "Sneha K.",
    treatment: "HIFU Lifting",
    quote:
      "Visible lift after a single session and zero downtime. The team explained every step before starting.",
  },
  {
    id: "t3",
    type: "text",
    author: "Arun M.",
    treatment: "Exosome Therapy",
    quote:
      "I came in for hair thinning and the difference in three months has been remarkable. Truly personalised care.",
  },
];
