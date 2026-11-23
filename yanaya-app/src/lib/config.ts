/**
 * ============================================================
 *  BUSINESS SETTINGS — ⚠️ PLACEHOLDERS
 * ============================================================
 * Every number below is a placeholder until Yanaya confirms it
 * (see "Open Questions" in the project plan). Later these move
 * into the Supabase `settings` / `price_tiers` tables and are
 * edited from /admin.
 */

export const PRODUCT = {
  name: "Smoovy Baobab",
  tagline: "Cold-blended baobab smoothie",
  sizeLabel: "Single bottle", // PLACEHOLDER: confirm bottle size (e.g. 350ml)
  priceUsd: 1, // Confirmed: $1 per bottle
  image: "/yanaya/smoovy.webp",
};

/**
 * Wider Yanaya menu (photos supplied by the client in public/yanaya).
 * Only Smoovy Baobab can be ordered online for now; the rest are shown as
 * "coming soon online". Item names are PLACEHOLDERS based on the photos —
 * confirm the real names (and prices, if they become orderable).
 */
export const MENU_CATEGORIES = ["Smoothies", "Juices", "Breakfast", "Wraps", "Snacks"] as const;

export const MENU_ITEMS: {
  id: string;
  name: string;
  category: (typeof MENU_CATEGORIES)[number];
  image: string;
  orderable: boolean;
}[] = [
  { id: "smoovy", name: "Smoovy Baobab", category: "Smoothies", image: "/yanaya/smoovy.webp", orderable: true },
  { id: "blended-fruits", name: "Freshly Blended Fruits", category: "Smoothies", image: "/yanaya/blended-fruits.jpg", orderable: false },
  { id: "smoothie-bowl", name: "Smoothie Bowl", category: "Smoothies", image: "/yanaya/smoothie-bowl.jpg", orderable: false },
  { id: "almond-milk", name: "Almond Milk", category: "Juices", image: "/yanaya/almond-milk.jpg", orderable: false },
  { id: "fruit-bowl", name: "Fruit & Yoghurt Bowl", category: "Breakfast", image: "/yanaya/fruit-yoghurt-bowl.jpg", orderable: false },
  { id: "sandwich", name: "Breakfast Sandwich", category: "Breakfast", image: "/yanaya/breakfast-sandwich.jpg", orderable: false },
  { id: "brunch", name: "Brunch Platter", category: "Breakfast", image: "/yanaya/brunch.jpg", orderable: false },
  { id: "wraps", name: "Wraps", category: "Wraps", image: "/yanaya/wraps.jpg", orderable: false },
  { id: "parfait", name: "Muesli Parfait", category: "Snacks", image: "/yanaya/muesli-parfait.jpg", orderable: false },
];

export const MENU_BANNER = "/yanaya/yanaya-banner.jpg";

/** PLACEHOLDER: ZiG per 1 USD. Admin will update this. */
export const ZIG_RATE = 26.8;

/** Confirmed rule: delivery unlocks at 10 bottles. */
export const DELIVERY_MIN_BOTTLES = 10;

/** Confirmed rule: bottles are packed in crates of 10. */
export const CRATE_SIZE = 10;

/** Max per online order before we ask the customer to contact us. PLACEHOLDER */
export const MAX_BOTTLES_PER_ORDER = 500;

/** Confirmed tier bands — discount percentages are PLACEHOLDERS. */
export const PRICE_TIERS = [
  { min: 10, max: 19, discountPct: 5 },
  { min: 20, max: 49, discountPct: 10 },
  { min: 50, max: Infinity, discountPct: 15 },
] as const;

/** PLACEHOLDER delivery zones and fees (USD). */
export const DELIVERY_ZONES = [
  { id: "a", label: "Zone A", feeUsd: 2 },
  { id: "b", label: "Zone B", feeUsd: 3 },
  { id: "c", label: "Zone C", feeUsd: 4 },
] as const;

export type ZoneId = (typeof DELIVERY_ZONES)[number]["id"];

/**
 * PLACEHOLDER suburb list — confirm Yanaya's real delivery areas.
 * lat/lng are APPROXIMATE suburb centres, only used to move the map when a suburb is picked.
 */
export const SUBURBS: { id: string; name: string; city: string; zone: ZoneId; lat: number; lng: number }[] = [
  { id: "cbd", name: "Harare CBD", city: "Harare", zone: "a", lat: -17.8292, lng: 31.0522 },
  { id: "avondale", name: "Avondale", city: "Harare", zone: "a", lat: -17.799, lng: 31.038 },
  { id: "belgravia", name: "Belgravia", city: "Harare", zone: "a", lat: -17.81, lng: 31.042 },
  { id: "milton-park", name: "Milton Park", city: "Harare", zone: "a", lat: -17.818, lng: 31.028 },
  { id: "eastlea", name: "Eastlea", city: "Harare", zone: "a", lat: -17.827, lng: 31.073 },
  { id: "mount-pleasant", name: "Mount Pleasant", city: "Harare", zone: "b", lat: -17.77, lng: 31.048 },
  { id: "highlands", name: "Highlands", city: "Harare", zone: "b", lat: -17.795, lng: 31.095 },
  { id: "marlborough", name: "Marlborough", city: "Harare", zone: "b", lat: -17.755, lng: 30.998 },
  { id: "mabelreign", name: "Mabelreign", city: "Harare", zone: "b", lat: -17.785, lng: 31.005 },
  { id: "hatfield", name: "Hatfield", city: "Harare", zone: "b", lat: -17.88, lng: 31.09 },
  { id: "borrowdale", name: "Borrowdale", city: "Harare", zone: "c", lat: -17.755, lng: 31.095 },
  { id: "greendale", name: "Greendale", city: "Harare", zone: "c", lat: -17.815, lng: 31.125 },
];

/** PLACEHOLDER main depot (delivers + collection). */
export const DEPOT = {
  id: "depot",
  name: "Yanaya Depot",
  address: "Depot address to be confirmed, Harare",
  hours: "Mon–Sat · 08:00–17:00", // PLACEHOLDER
  openDays: [1, 2, 3, 4, 5, 6], // 0 = Sunday. PLACEHOLDER
  open: "08:00", // PLACEHOLDER
  close: "17:00", // PLACEHOLDER
  deliveryEtaMins: 45, // PLACEHOLDER
};

/**
 * Click & Collect points. Only the depot for now.
 * If Yanaya confirms branches hold stock (Open Question 1), add them here.
 */
export const COLLECTION_POINTS = [DEPOT];

/** Is a location open right now (local time)? */
export function isOpenNow(p: { openDays: number[]; open: string; close: string }, now = new Date()) {
  if (!p.openDays.includes(now.getDay())) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  const toMins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  return mins >= toMins(p.open) && mins < toMins(p.close);
}

export const PAYMENT_METHODS = [
  { id: "ecocash", label: "EcoCash", hint: "Prompt sent to your phone" },
  { id: "onemoney", label: "OneMoney", hint: "Prompt sent to your phone" },
  { id: "innbucks", label: "InnBucks", hint: "Pay with InnBucks code" },
  { id: "card", label: "Visa / Mastercard / Zimswitch", hint: "Secure card page" },
  // Proposal: "pay via Paynow ... or once delivered". Label changes by mode (see paymentLabel).
  // Backend note: these orders skip Paynow, so the stock hold must last until the order is
  // completed or cancelled by staff — not the 10-minute checkout window.
  { id: "on_receipt", label: "Pay on delivery", hint: "Cash, EcoCash or swipe when you receive it" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export function paymentLabel(id: PaymentMethodId, mode: "delivery" | "collect") {
  if (id === "on_receipt") return mode === "delivery" ? "Pay on delivery" : "Pay at collection";
  return PAYMENT_METHODS.find((m) => m.id === id)!.label;
}

/** Map defaults (OpenStreetMap). Harare CBD. */
export const MAP_DEFAULT_CENTER = { lat: -17.8292, lng: 31.0522 };
