"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DELIVERY_MIN_BOTTLES, MAX_BOTTLES_PER_ORDER, PRODUCT } from "@/lib/config";
import { useOrder } from "@/lib/order-store";
import { parseQuantity, usd } from "@/lib/pricing";
import { PriceBreakdown } from "@/components/PriceBreakdown";
import Image from "next/image";
import { BagIcon, PrimaryButton, ScooterIcon, StickyFooter, TopBar } from "@/components/ui";

const QUICK = [10, 20, 50];

export default function OrderPage() {
  const router = useRouter();
  const {
    mode,
    deliveryLocked,
    location,
    quantity,
    setQuantity,
    setMode,
    customer,
    setCustomer,
    currentQuote: q,
    hydrated,
  } = useOrder();
  const [raw, setRaw] = useState(String(quantity));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !mode) router.replace("/");
  }, [hydrated, mode, router]);

  // Keep the text box in sync when quantity changes elsewhere (chips, stepper, mode switch)
  useEffect(() => {
    setRaw(String(quantity));
    setError(null);
  }, [quantity]);

  if (!hydrated || !mode || !q) return null;

  const onType = (v: string) => {
    setRaw(v);
    const r = parseQuantity(v);
    if (r.ok) {
      setError(null);
      setQuantity(r.value);
    } else {
      setError(r.error);
    }
  };

  const step = (d: number) => {
    const n = Math.min(MAX_BOTTLES_PER_ORDER, Math.max(1, quantity + d));
    setQuantity(n);
  };

  const needsAddress = mode === "delivery" && !location;
  const inputValid = error === null;
  const canContinue = inputValid && q.canCheckout && !needsAddress;

  return (
    <main className="min-h-dvh pb-40">
      <TopBar back="/store" />

      <div className="mx-auto max-w-xl space-y-4 px-4 pt-5">
        {/* Product */}
        <section className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm">
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-sage-100">
            <Image src={PRODUCT.image} alt={PRODUCT.name} fill sizes="80px" className="object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black">{PRODUCT.name}</h1>
            <p className="text-sm text-muted">{PRODUCT.sizeLabel}</p>
            <p className="mt-1 font-bold text-leaf-700">{usd(PRODUCT.priceUsd)}</p>
          </div>
        </section>

        {/* Quantity */}
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex rounded-xl bg-cream p-1 text-sm font-semibold">
            {[
              { v: false, l: "Individual" },
              { v: true, l: "Corporate / Bulk" },
            ].map((o) => (
              <button
                key={o.l}
                onClick={() => setCustomer({ ...customer, isCorporate: o.v })}
                className={`flex-1 rounded-lg py-2 transition ${
                  customer.isCorporate === o.v ? "bg-white shadow-sm" : "text-muted"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
          {customer.isCorporate ? (
            <p className="-mt-2 mb-3 text-xs text-muted">
              Offices, gyms &amp; clinics: add your company name at checkout.
            </p>
          ) : null}
          <h2 className="font-bold">How many bottles?</h2>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => step(-1)}
              disabled={quantity <= 1}
              className="grid h-14 w-14 place-items-center rounded-2xl bg-leaf-50 text-2xl font-bold text-leaf-700 disabled:opacity-40"
              aria-label="One less bottle"
            >
              −
            </button>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={raw}
              onChange={(e) => onType(e.target.value)}
              aria-label="Number of bottles"
              aria-invalid={!inputValid}
              className={`h-14 min-w-0 flex-1 rounded-2xl border-2 bg-cream text-center text-2xl font-black outline-none ${
                inputValid ? "border-transparent focus:border-leaf-500" : "border-red-400"
              }`}
            />
            <button
              onClick={() => step(1)}
              disabled={quantity >= MAX_BOTTLES_PER_ORDER}
              className="grid h-14 w-14 place-items-center rounded-2xl bg-leaf-700 text-2xl font-bold text-white disabled:opacity-40"
              aria-label="One more bottle"
            >
              +
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

          <div className="mt-3 flex gap-2">
            {QUICK.map((n) => (
              <button
                key={n}
                onClick={() => setQuantity(n)}
                className={`flex-1 rounded-full border py-2 text-sm font-semibold transition ${
                  quantity === n && inputValid
                    ? "border-leaf-700 bg-leaf-700 text-white"
                    : "border-black/10 bg-white"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {inputValid && q.nextTier ? (
            <p className="mt-3 rounded-xl bg-sage-100/70 px-3 py-2 text-sm">
              Add <b>{q.nextTier.bottlesNeeded}</b> more to save <b>{q.nextTier.discountPct}%</b>
            </p>
          ) : null}
        </section>

        {/* Under the delivery minimum: order has defaulted to Depot Collection */}
        {inputValid && deliveryLocked ? (
          <section className="rounded-3xl border-2 border-sage-400 bg-white p-4">
            <div className="flex items-start gap-3">
              <BagIcon className="mt-0.5 h-6 w-6 shrink-0 text-sage-500" />
              <div>
                <p className="font-bold">Switched to Collect</p>
                <p className="text-sm text-muted">
                  Delivery starts at {DELIVERY_MIN_BOTTLES} bottles. Add {q.bottlesToUnlockDelivery} more bottle
                  {q.bottlesToUnlockDelivery === 1 ? "" : "s"} to get this order delivered.
                </p>
              </div>
            </div>
            <button
              onClick={() => setQuantity(DELIVERY_MIN_BOTTLES)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-700 py-3 text-sm font-bold text-white"
            >
              <ScooterIcon className="h-4 w-4" />
              Add {q.bottlesToUnlockDelivery} bottle{q.bottlesToUnlockDelivery === 1 ? "" : "s"} &amp; deliver
            </button>
          </section>
        ) : null}

        {/* Collect hint when they could have delivery */}
        {inputValid && mode === "collect" && q.deliveryEligible ? (
          <button
            onClick={() => {
              setMode("delivery");
              if (!location) router.push("/location");
            }}
            className="flex w-full items-center gap-3 rounded-2xl bg-leaf-50 p-3 text-left text-sm"
          >
            <ScooterIcon className="h-5 w-5 text-leaf-700" />
            <span>
              Your order qualifies for <b>delivery</b>. Tap to switch.
            </span>
          </button>
        ) : null}

        {needsAddress ? (
          <Link href="/location" className="block rounded-2xl bg-white p-4 text-sm font-semibold text-leaf-700 shadow-sm">
            Set your delivery address →
          </Link>
        ) : null}

        {/* Summary */}
        {inputValid ? (
          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold">Order summary</h2>
            <PriceBreakdown q={q} />
          </section>
        ) : null}
      </div>

      <StickyFooter>
        <PrimaryButton disabled={!canContinue} onClick={() => router.push("/checkout")}>
          {canContinue ? (
            <>
              Checkout <span className="opacity-60">·</span> {usd(q.totalUsd)}
            </>
          ) : !inputValid ? (
            "Enter a valid quantity"
          ) : needsAddress ? (
            "Set delivery address"
          ) : (
            `Add ${q.bottlesToUnlockDelivery} more for delivery`
          )}
        </PrimaryButton>
      </StickyFooter>
    </main>
  );
}
