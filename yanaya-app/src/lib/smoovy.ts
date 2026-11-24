/**
 * Smoovy website content: everything the site says lives here.
 * Source: Yanaya's Smoovy product catalogue (assets/catalogue/).
 * Items marked TODO need confirming with Nyary.
 */

export const SITE = {
  name: "Smoovy",
  parent: "Yanaya",
  url: "https://www.sipsmoovy.com",
  tagline: "Energy in a bottle.",
  tagline2: "Happiness you can taste.",
  slogan: "Find your energy",
  description:
    "Smoovy by Yanaya: fruit smoothies made in Zimbabwe from locally sourced fruit, with no concentrates or artificial flavourings. Five flavours, 420ml. Order on WhatsApp.",
  size: "420ml",
  whatsappDisplay: "0717 377 549",
  whatsappIntl: "263717377549",
  email: "", // TODO: Nyary to supply
  socials: [] as { label: string; href: string }[], // TODO: Instagram / Facebook / TikTok links
  badges: ["Plant based", "Fruit sugars", "Boost health", "Vitamin infused"],
} as const;

export const NAV_LINKS = [
  { href: "/#flavours", label: "Flavours" },
  { href: "/#story", label: "Our Story" },
  { href: "/#source", label: "The Source" },
  { href: "/#process", label: "Process" },
  { href: "/#partner", label: "Partner" },
];

/** WhatsApp click-to-chat link with a pre-filled message. */
export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsappIntl}?text=${encodeURIComponent(message)}`;
}

export const ORDER_MESSAGE = "Hi Smoovy! I'd like to place an order.";

export interface Flavour {
  slug: string;
  name: string;
  /** "Baobab Flavoured Fruit Smoovy" */
  kind: string;
  /** Badge text, e.g. "Indigenous Energy Boost" */
  badge: string;
  /** One-liner under the name */
  line: string;
  /** Two short story paragraphs from the catalogue */
  story: [string, string];
  bottle: string;
  /** Mood tile (only 4 exist in the catalogue) */
  tile?: string;
  /** Theme colours sampled from the catalogue */
  color: {
    /** big background colour in the showcase */
    bg: string;
    /** text colour that reads well on `bg` */
    ink: string;
    /** strong accent (headline colour in the catalogue) */
    accent: string;
    /** soft tint (catalogue footer band) */
    tint: string;
  };
}

export const FLAVOURS: Flavour[] = [
  {
    slug: "baobalicious",
    name: "Baobalicious",
    kind: "Baobab Flavoured Fruit Smoovy",
    badge: "Indigenous Energy Boost",
    line: "The rich, creamy and mighty taste of African baobab.",
    story: [
      'This is our soul in a bottle. Baobalicious is a tribute to the ancient African Baobab, the "Tree of Life." For generations, its fruit has been a source of immense vitality.',
      "We wanted to take this powerful piece of our heritage and place it into the hands of modern Zimbabweans. This isn't just a flavour; it's a statement about where we come from and the strength we carry.",
    ],
    bottle: "/smoovy/bottles/baobalicious.webp",
    tile: "/smoovy/tiles/baobalicious.webp",
    color: { bg: "#c49930", ink: "#2a2a2c", accent: "#896221", tint: "#ffde8d" },
  },
  {
    slug: "whey-strawberry",
    name: "Whey Protein Strawberry",
    kind: "Whey Protein Packed Fruit Smoovy",
    badge: "Peak Performance Fuel",
    line: "A whirlpool of strawberry & rebellious whey crunch.",
    story: [
      "We saw athletes and everyday warriors looking for an edge: a clean, effective way to recover. We created this Smoovy for them.",
      "It's not about shortcuts; it's about providing the body with the high-quality building blocks it needs to repair and grow stronger. We chose the classic, universally loved flavour of strawberry to prove that functional can, and should, be delicious.",
    ],
    bottle: "/smoovy/bottles/whey-strawberry.webp",
    // bg darkened from the catalogue pink (#d65985) so white text meets WCAG AA contrast
    color: { bg: "#c4467a", ink: "#ffffff", accent: "#1b5429", tint: "#f9cedf" },
  },
  {
    slug: "berry-nice",
    name: "Berry Nice",
    kind: "Berry Flavoured Fruit Smoovy",
    badge: "Antioxidant Powerhouse",
    line: "Berries with a smooth, star-studded fresh surprise.",
    story: [
      "In a world full of stressors, we wanted to create a delicious form of defence. Berry Nice is our answer. It's a vibrant symphony of nature's most powerful protective fruits.",
      "We carefully selected a blend of berries known for their antioxidant properties to create a daily ritual of wellness that feels like an indulgent treat.",
    ],
    bottle: "/smoovy/bottles/berry-nice.webp",
    tile: "/smoovy/tiles/berry-nice.webp",
    color: { bg: "#80428b", ink: "#ffffff", accent: "#542267", tint: "#eed5e8" },
  },
  {
    slug: "choco-mint",
    name: "Choco Mint",
    kind: "Chocolate Flavoured Fruit Smoovy",
    badge: "Guilt-Free Indulgence",
    line: "A bold, thunderous wave of rich minty chocolate.",
    story: [
      "A healthy lifestyle shouldn't mean deprivation. We created Choco Mint to satisfy cravings the right way.",
      "It's a classic, decadent flavour combination, reimagined with wholesome ingredients. It's proof that you can indulge your senses while nourishing your body.",
    ],
    bottle: "/smoovy/bottles/choco-mint.webp",
    tile: "/smoovy/tiles/choco-mint.webp",
    color: { bg: "#5c2f12", ink: "#ffffff", accent: "#3e1f0b", tint: "#fedf8f" },
  },
  {
    slug: "pineapple-express",
    name: "Pineapple Express",
    kind: "Pineapple Flavoured Fruit Smoovy",
    badge: "A Taste of Pure Sunshine",
    line: "A sip of sunshine and joy with a little bit of zing.",
    story: [
      "Sometimes, all you need is a burst of pure, uncomplicated joy. Pineapple Express is exactly that.",
      "We wanted to bottle the feeling of a perfect sunny day. It's a simple, vibrant, and incredibly refreshing smoothie designed to lift your spirits and energise your day.",
    ],
    bottle: "/smoovy/bottles/pineapple-express.webp",
    tile: "/smoovy/tiles/pineapple-express.webp",
    color: { bg: "#f39c1f", ink: "#2a2a2c", accent: "#c4610f", tint: "#ffe081" },
  },
];

export const flavourBySlug = (slug: string) => FLAVOURS.find((f) => f.slug === slug);

export const orderFlavourMessage = (f: Flavour) => `Hi Smoovy! I'd like to order ${f.name} (${SITE.size}).`;

export const STORY = {
  philosophy:
    "Yanaya is the nourishing rain. Smoovy is the brilliant sunshine that follows.",
  philosophyMore:
    "It's not just a product; it's a philosophy. It's the simple idea that what's good for you should also make you feel good. It's permission to feel vibrant.",
  origin: "Smoovy was born from the heart of our parent company, Yanaya.",
  originMore: "It's the kinetic, joyful expression of our deeper mission.",
  onTheGo: "Smoovy is health on the go.",
  onTheGoMore: "It's your delicious companion for a life in motion.",
};

export const SOURCE = {
  title: "We buy from Zimbabwean farmers",
  stat: "100%",
  statLabel: "Organic, locally sourced fruit",
  lead: "Greatness starts at the source.",
  body: "That's why we never add concentrates or artificial flavourings to Smoovy.",
  partners:
    "Our indigenous ingredients, like baobab, are sourced through direct partnerships with local communities.",
};

export const PROCESS = {
  hook: "There is an easy way to make a smoothie.",
  hook2: "And there is a right way.",
  title: "Our Smoove Process",
  easy: { label: "The easy way", text: "Heat, which kills everything: the good and the bad." },
  right: {
    label: "The right way",
    text: "High-Pressure Processing (HPP). It's harder. It's more expensive. But it's the only way to preserve the soul of the fruit.",
  },
  close: "We choose the right way. Every time.",
};

export const PARTNER_INTERESTS = [
  "Placing a Wholesale Order",
  "Becoming a distributor",
  "Getting More Information / Support",
  "Investment opportunities",
] as const;

export const FAQ = [
  {
    q: "How do I order?",
    a: `Tap any "Place order" button to message us on WhatsApp (${SITE.whatsappDisplay}). Tell us your flavours, how many bottles and where you are, and we'll sort the rest.`,
  },
  {
    q: "What's in a Smoovy?",
    a: "Real, locally sourced fruit, processed with High-Pressure Processing (HPP) instead of heat, with no concentrates or artificial flavourings. Each flavour's ingredients are on its label.",
  },
  {
    q: "How big is a bottle?",
    a: `Every Smoovy is ${SITE.size}.`,
  },
  {
    q: "Can I stock Smoovy in my shop, gym or office?",
    a: "Yes. Use the partner form below for wholesale, distribution or office orders and we'll get back to you on WhatsApp.",
  },
  // TODO (Nyary): shelf life / storage, delivery areas, price
];
