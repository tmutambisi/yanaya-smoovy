"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  COLLECTION_POINTS,
  DEPOT,
  MENU_BANNER,
  MENU_CATEGORIES,
  MENU_ITEMS,
  PRICE_TIERS,
  PRODUCT,
  isOpenNow,
} from "@/lib/config";
import { useOrder } from "@/lib/order-store";
import { usd } from "@/lib/pricing";
import { ClockIcon, LeafIcon, TopBar } from "@/components/ui";

type Category = "All" | (typeof MENU_CATEGORIES)[number];

/** After choosing Delivery / Collect: banner, the depot "store" card, Smoovy and the full menu. */
export default function StorePage() {
  const router = useRouter();
  const { hydrated, preferredMode, collectPointId } = useOrder();
  const [category, setCategory] = useState<Category>("All");

  useEffect(() => {
    if (hydrated && !preferredMode) router.replace("/");
  }, [hydrated, preferredMode, router]);

  // The page renders after saved state loads, so jump to #menu / #corporate / #help manually.
  useEffect(() => {
    if (!hydrated || !preferredMode) return;
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView(), 150);
    return () => window.clearTimeout(t);
  }, [hydrated, preferredMode]);

  if (!hydrated || !preferredMode) return null;

  const store = preferredMode === "collect" ? (COLLECTION_POINTS.find((p) => p.id === collectPointId) ?? DEPOT) : DEPOT;
  const open = isOpenNow(store);

  return (
    <main className="min-h-dvh bg-[#f1f2ea] pb-12">
      <TopBar back="/" />

      <div className="mx-auto max-w-xl px-3 pt-3">
        {/* Promo banner */}
        <div className="relative overflow-hidden rounded-xl bg-leaf-700 p-4 text-white">
          <div className="absolute -right-6 -bottom-10 h-40 w-40 rounded-full bg-sage-500/40" />
          <div className="relative flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xl leading-tight font-black">Pay your way</p>
              <p className="mt-0.5 inline-block bg-night px-2 py-0.5 text-lg font-black text-sage-400 italic">
                {preferredMode === "delivery" ? "online or on delivery!" : "online or at collection!"}
              </p>
              <p className="mt-2 text-xs text-white/80">EcoCash · OneMoney · InnBucks · Card · Cash</p>
            </div>
            <div className="relative h-28 w-22 shrink-0 -rotate-6 overflow-hidden rounded-xl border-4 border-night shadow-xl">
              <Image src={PRODUCT.image} alt="" fill sizes="96px" className="object-cover" />
            </div>
          </div>
        </div>

        {/* Store card */}
        <h2 className="mt-6 px-1 text-lg font-semibold italic">
          {preferredMode === "delivery" ? "Delivering from" : "Collecting from"}
        </h2>
        <section className="mt-2 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">{store.name}</h3>
              <p className="mt-1 text-muted">
                Open: {store.open} - {store.close} -{" "}
                <span className={open ? "text-leaf-600" : "text-red-600"}>{open ? "Open" : "Closed"}</span>
              </p>
              <p className="flex items-center gap-1 text-muted">
                <ClockIcon className="h-4 w-4" />
                {preferredMode === "delivery"
                  ? `Delivery Time: ${store.deliveryEtaMins} mins`
                  : "Ready to collect after you order"}
              </p>
            </div>
            {/* SAMPLE: will come from today's production batch */}
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-sage-400 text-center text-xs leading-tight font-bold text-night">
              FRESH
              <br />
              TODAY
            </span>
          </div>

          {!open ? (
            <p className="mt-3 rounded-lg bg-sage-100 px-3 py-2 text-sm">
              We&apos;re closed right now. You can still order. We&apos;ll prepare it when we open.
            </p>
          ) : null}

          <h3 className="mt-5 text-xl font-semibold">Order online</h3>
          <Link href="/order" className="mt-2 block overflow-hidden rounded-lg shadow-sm active:scale-[0.99]">
            <div className="relative h-56 bg-sage-100">
              <Image
                src={PRODUCT.image}
                alt={PRODUCT.name}
                fill
                sizes="(max-width: 576px) 100vw, 560px"
                className="object-cover"
                priority
              />
              <div className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-leaf-700 shadow">
                {usd(PRODUCT.priceUsd)} / bottle
              </div>
            </div>
            <div className="flex items-center justify-between bg-leaf-700 px-4 py-3 text-white">
              <span>
                <span className="block text-lg font-black">{PRODUCT.name}</span>
                <span className="block text-xs text-white/75">{PRODUCT.tagline}</span>
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-leaf-700">Order</span>
            </div>
          </Link>
        </section>

        {/* Full menu (photos from the client). Only Smoovy is orderable online for now. */}
        <h2 id="menu" className="mt-6 scroll-mt-20 px-1 text-lg font-semibold italic">
          Our menu
        </h2>
        <div className="relative mt-2 aspect-[562/313] overflow-hidden rounded-xl">
          <Image
            src={MENU_BANNER}
            alt="Yanaya: salads, smoothies, juices, wraps, snacks"
            fill
            sizes="(max-width: 576px) 100vw, 560px"
            className="object-cover"
          />
        </div>
        <div className="-mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Menu categories">
          {(["All", ...MENU_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-bold transition ${
                category === c ? "border-night bg-leaf-700 text-white" : "border-transparent bg-white text-night"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {MENU_ITEMS.filter((m) => category === "All" || m.category === category).map((m) => {
            const card = (
              <>
                <div className="relative aspect-square bg-sage-100">
                  <Image src={m.image} alt={m.name} fill sizes="(max-width: 576px) 50vw, 280px" className="object-cover" />
                  {!m.orderable ? (
                    <span className="absolute top-2 left-2 rounded-full bg-night/85 px-2 py-0.5 text-[11px] font-semibold text-white">
                      Coming soon online
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-sm leading-tight font-bold">{m.name}</span>
                    <span className="block text-xs text-muted">{m.category}</span>
                  </span>
                  {m.orderable ? (
                    <span className="shrink-0 rounded-full bg-leaf-700 px-3 py-1 text-xs font-bold text-white">
                      Order
                    </span>
                  ) : null}
                </div>
              </>
            );
            return m.orderable ? (
              <Link key={m.id} href="/order" className="overflow-hidden rounded-xl bg-white shadow-sm active:scale-[0.99]">
                {card}
              </Link>
            ) : (
              <div key={m.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                {card}
              </div>
            );
          })}
        </div>
        <p className="mt-2 px-1 text-xs text-muted">
          The full menu is available in store. Online ordering for more items is coming soon.
        </p>

        {/* Bulk savings */}
        <h2 id="corporate" className="mt-6 scroll-mt-20 px-1 text-lg font-semibold italic">
          Buy more, save more
        </h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PRICE_TIERS.map((t) => (
            <div key={t.min} className="rounded-xl bg-white p-3 text-center shadow-sm">
              <p className="text-2xl font-black text-leaf-700">{t.discountPct}%</p>
              <p className="text-xs text-muted">
                {t.max === Infinity ? `${t.min}+ bottles` : `${t.min}–${t.max} bottles`}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 px-1 text-xs text-muted">
          Offices, gyms and clinics: choose Corporate / Bulk when ordering. Verified accounts can pay by invoice.
        </p>

        {/* Health benefits — PLACEHOLDER COPY: replace with Yanaya's approved wording */}
        <h2 className="mt-6 px-1 text-lg font-semibold italic">Why baobab?</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { t: "Vitamin C", d: "Baobab fruit is naturally rich in vitamin C." },
            { t: "Fibre", d: "A natural source of dietary fibre." },
            { t: "Antioxidants", d: "Packed with naturally occurring antioxidants." },
            { t: "Proudly local", d: "Made with African baobab, blended in Harare." },
          ].map((b) => (
            <div key={b.t} className="rounded-xl bg-white p-4 shadow-sm">
              <LeafIcon className="h-5 w-5 text-leaf-600" />
              <p className="mt-2 font-bold">{b.t}</p>
              <p className="text-xs text-muted">{b.d}</p>
            </div>
          ))}
        </div>

        {/* Reviews — SAMPLE CONTENT, will come from published reviews in Supabase */}
        <div className="mt-6 flex items-baseline justify-between px-1">
          <h2 className="text-lg font-semibold italic">What customers say</h2>
          <span className="text-xs text-muted">Sample reviews</span>
        </div>
        <div className="mt-2 space-y-2">
          {[
            { name: "Tendai M.", text: "Ordered 20 for our office, delivered cold and on time.", stars: 5 },
            { name: "Rumbi C.", text: "My go-to after gym. Collecting is quick.", stars: 5 },
          ].map((r) => (
            <figure key={r.name} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="text-sage-500" aria-label={`${r.stars} out of 5 stars`}>
                {"★".repeat(r.stars)}
              </div>
              <blockquote className="mt-1 text-sm">{r.text}</blockquote>
              <figcaption className="mt-2 text-xs font-semibold text-muted">{r.name}</figcaption>
            </figure>
          ))}
        </div>

        {/* Help — PLACEHOLDER contact details */}
        <section id="help" className="mt-6 scroll-mt-20 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="font-bold">Help &amp; contact</h2>
          <p className="mt-1 text-sm text-muted">Phone and email to be confirmed by Yanaya.</p>
        </section>
      </div>
    </main>
  );
}
