"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COLLECTION_POINTS, DEPOT, SUBURBS, paymentLabel, type PaymentMethodId } from "@/lib/config";

/** Cash only for now (see PAYMENT_METHODS in config). */
const PAYMENT: PaymentMethodId = "cash";
import { useOrder } from "@/lib/order-store";
import { usd } from "@/lib/pricing";
import { PriceBreakdown } from "@/components/PriceBreakdown";
import { BagIcon, CheckIcon, PrimaryButton, ScooterIcon, StickyFooter, TopBar } from "@/components/ui";

const ZW_MOBILE = /^(?:\+?263|0)7[1-8]\d{7}$/;

export default function CheckoutPage() {
  const router = useRouter();
  const { mode, location, collectPointId, customer, setCustomer, currentQuote: q, placeOrder, hydrated } =
    useOrder();
  const [touched, setTouched] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!mode) router.replace("/");
    else if (!q?.canCheckout) router.replace("/order");
  }, [hydrated, mode, q?.canCheckout, router]);

  if (!hydrated || !mode || !q || !q.canCheckout) return null;

  const phoneClean = customer.phone.replace(/[\s-]/g, "");
  const errors = {
    name: customer.name.trim().length < 2 ? "Enter your name." : null,
    phone: !ZW_MOBILE.test(phoneClean) ? "Enter a valid Zimbabwe mobile number (e.g. 0771 234 567)." : null,
    email:
      customer.email.trim() !== "" && !/^\S+@\S+\.\S+$/.test(customer.email.trim())
        ? "Check your email address."
        : null,
    company: customer.isCorporate && customer.company.trim().length < 2 ? "Enter the company name." : null,
  };
  const valid = !Object.values(errors).some(Boolean);
  const show = (k: keyof typeof errors) => (touched ? errors[k] : null);

  const update = (patch: Partial<typeof customer>) => setCustomer({ ...customer, ...patch });
  const suburb = SUBURBS.find((s) => s.id === location?.suburbId);
  const point = COLLECTION_POINTS.find((p) => p.id === collectPointId) ?? DEPOT;
  const placeCashOrder = () => {
    setTouched(true);
    if (!valid) return;
    setPlacing(true);
    // MOCK: the real version saves the order and reserves the bottles until staff mark it
    // delivered/collected or cancel it. Cash is collected by the rider or at the depot.
    setTimeout(() => {
      const order = placeOrder(PAYMENT);
      if (order) router.push(`/order/${order.token}`);
      else setPlacing(false);
    }, 700);
  };

  return (
    <main className="min-h-dvh pb-40">
      <TopBar back="/order" title="Checkout" />

      <div className="mx-auto max-w-xl space-y-4 px-4 pt-5">
        {/* Fulfilment */}
        <section className="flex items-start gap-3 rounded-3xl bg-white p-4 shadow-sm">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf-50 text-leaf-700">
            {mode === "delivery" ? <ScooterIcon className="h-5 w-5" /> : <BagIcon className="h-5 w-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {mode === "delivery" ? "Delivering to" : "Collecting from"}
            </p>
            {mode === "delivery" ? (
              <>
                <p className="font-bold">{suburb?.name}</p>
                <p className="truncate text-sm text-muted">{location?.address}</p>
              </>
            ) : (
              <>
                <p className="font-bold">{point.name}</p>
                <p className="text-sm text-muted">{point.hours}</p>
                {customer.name ? (
                  <p className="text-sm text-muted">Collector: {customer.name}</p>
                ) : null}
              </>
            )}
          </div>
          <Link href={mode === "delivery" ? "/location" : "/collect"} className="text-sm font-semibold text-leaf-700">
            Change
          </Link>
        </section>

        {/* Customer */}
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="font-bold">Your details</h2>
          <div className="mt-3 flex rounded-xl bg-cream p-1 text-sm font-semibold">
            {[
              { v: false, l: "Individual" },
              { v: true, l: "Corporate / Bulk" },
            ].map((o) => (
              <button
                key={o.l}
                onClick={() => update({ isCorporate: o.v })}
                className={`flex-1 rounded-lg py-2 transition ${
                  customer.isCorporate === o.v ? "bg-white shadow-sm" : "text-muted"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {customer.isCorporate ? (
              <Field label="Company name" error={show("company")}>
                <input
                  value={customer.company}
                  onChange={(e) => update({ company: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Avondale Fitness Club"
                />
              </Field>
            ) : null}
            <Field label="Full name" error={show("name")}>
              <input
                value={customer.name}
                onChange={(e) => update({ name: e.target.value })}
                autoComplete="name"
                className={inputCls}
              />
            </Field>
            <Field label="Mobile number" error={show("phone")}>
              <input
                value={customer.phone}
                onChange={(e) => update({ phone: e.target.value })}
                inputMode="tel"
                autoComplete="tel"
                placeholder="0771 234 567"
                className={inputCls}
              />
            </Field>
            <Field label="Email (for your receipt & updates)" error={show("email")} optional>
              <input
                value={customer.email}
                onChange={(e) => update({ email: e.target.value })}
                inputMode="email"
                autoComplete="email"
                className={inputCls}
              />
            </Field>
          </div>
        </section>

        {/* Payment: cash only for now */}
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="font-bold">Payment</h2>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-leaf-600 bg-leaf-50 p-3">
            <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-leaf-600 bg-leaf-600 text-white">
              <CheckIcon className="h-3 w-3" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">{paymentLabel(PAYMENT, mode)}</span>
              <span className="block text-xs text-muted">
                {mode === "delivery"
                  ? `Pay the rider ${usd(q.totalUsd)} in cash when your order arrives.`
                  : `Pay ${usd(q.totalUsd)} in cash at ${point.name} when you collect.`}
              </span>
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">Exact change helps. Nothing is paid online.</p>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-bold">Summary</h2>
          <PriceBreakdown q={q} />
        </section>
      </div>

      <StickyFooter>
        <PrimaryButton onClick={placeCashOrder} disabled={placing}>
          {placing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Placing your order…
            </>
          ) : (
            <>Place order · {usd(q.totalUsd)} cash</>
          )}
        </PrimaryButton>
      </StickyFooter>
    </main>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border border-black/10 bg-white px-4 outline-none focus:border-leaf-500";

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error: string | null;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">
        {label} {optional ? <span className="font-normal text-muted">(optional)</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
