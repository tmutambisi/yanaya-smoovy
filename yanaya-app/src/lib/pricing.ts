/**
 * Pure pricing & rules logic. No React, no browser APIs —
 * the same function will run on the server at checkout later
 * (never trust totals sent from the browser).
 */
import {
  CRATE_SIZE,
  DELIVERY_MIN_BOTTLES,
  DELIVERY_ZONES,
  MAX_BOTTLES_PER_ORDER,
  PRICE_TIERS,
  PRODUCT,
  SUBURBS,
  ZIG_RATE,
} from "./config";

export type FulfilmentMode = "delivery" | "collect";

export type QuantityResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

/** Validate raw text from the quantity input. Whole numbers 1..MAX only. */
export function parseQuantity(raw: string): QuantityResult {
  const s = raw.trim();
  if (s === "") return { ok: false, error: "Enter how many bottles you want." };
  if (!/^\d+$/.test(s)) return { ok: false, error: "Use whole numbers only (e.g. 12)." };
  const n = Number(s);
  if (n < 1) return { ok: false, error: "Order at least 1 bottle." };
  if (n > MAX_BOTTLES_PER_ORDER)
    return {
      ok: false,
      error: `For more than ${MAX_BOTTLES_PER_ORDER} bottles, please contact us for a bulk quote.`,
    };
  return { ok: true, value: n };
}

export function tierFor(qty: number) {
  return PRICE_TIERS.find((t) => qty >= t.min && qty <= t.max) ?? null;
}

export function nextTierFor(qty: number) {
  return PRICE_TIERS.find((t) => t.min > qty) ?? null;
}

export function deliveryFeeFor(suburbId: string | null | undefined): number | null {
  const suburb = SUBURBS.find((s) => s.id === suburbId);
  if (!suburb) return null;
  return DELIVERY_ZONES.find((z) => z.id === suburb.zone)?.feeUsd ?? null;
}

export function packing(qty: number) {
  return { crates: Math.floor(qty / CRATE_SIZE), loose: qty % CRATE_SIZE };
}

export function packingLabel(qty: number) {
  const { crates, loose } = packing(qty);
  const parts: string[] = [];
  if (crates) parts.push(`${crates} crate${crates === 1 ? "" : "s"}`);
  if (loose) parts.push(`${loose} loose bottle${loose === 1 ? "" : "s"}`);
  return parts.join(" + ") || "—";
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface Quote {
  qty: number;
  mode: FulfilmentMode;
  unitPriceUsd: number;
  discountPct: number;
  subtotalUsd: number;
  discountUsd: number;
  deliveryFeeUsd: number;
  totalUsd: number;
  totalZig: number;
  /** Delivery is allowed for this quantity. */
  deliveryEligible: boolean;
  /** Bottles still needed to unlock delivery (0 when eligible). */
  bottlesToUnlockDelivery: number;
  /** Can this quote be checked out as-is? */
  canCheckout: boolean;
  blockReason: string | null;
  nextTier: { bottlesNeeded: number; discountPct: number } | null;
  crates: number;
  loose: number;
}

export function quote(
  qty: number,
  mode: FulfilmentMode,
  suburbId?: string | null,
): Quote {
  const unit = PRODUCT.priceUsd;
  const tier = tierFor(qty);
  const discountPct = tier?.discountPct ?? 0;
  const subtotal = round2(qty * unit);
  const discount = round2((subtotal * discountPct) / 100);

  const deliveryEligible = qty >= DELIVERY_MIN_BOTTLES;
  const bottlesToUnlockDelivery = Math.max(0, DELIVERY_MIN_BOTTLES - qty);

  let deliveryFee = 0;
  let blockReason: string | null = null;
  if (mode === "delivery") {
    const fee = deliveryFeeFor(suburbId);
    if (!deliveryEligible) {
      blockReason = `Add ${bottlesToUnlockDelivery} more bottle${bottlesToUnlockDelivery === 1 ? "" : "s"} for delivery, or switch to Collect.`;
    } else if (fee === null) {
      blockReason = "Choose your delivery area.";
    } else {
      deliveryFee = fee;
    }
  }

  const total = round2(subtotal - discount + deliveryFee);
  const next = nextTierFor(qty);
  const { crates, loose } = packing(qty);

  return {
    qty,
    mode,
    unitPriceUsd: unit,
    discountPct,
    subtotalUsd: subtotal,
    discountUsd: discount,
    deliveryFeeUsd: deliveryFee,
    totalUsd: total,
    totalZig: round2(total * ZIG_RATE),
    deliveryEligible,
    bottlesToUnlockDelivery,
    canCheckout: blockReason === null,
    blockReason,
    nextTier: next ? { bottlesNeeded: next.min - qty, discountPct: next.discountPct } : null,
    crates,
    loose,
  };
}

export const usd = (n: number) => `$${n.toFixed(2)}`;
export const zig = (n: number) =>
  `ZiG ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
