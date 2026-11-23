"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DEPOT, SUBURBS, paymentLabel } from "@/lib/config";
import { useOrder, type OrderStatus } from "@/lib/order-store";
import { usd } from "@/lib/pricing";
import { PriceBreakdown } from "@/components/PriceBreakdown";
import { BagIcon, CheckIcon, Logo, ScooterIcon } from "@/components/ui";

const STEPS: Record<"delivery" | "collect", { id: OrderStatus; label: string; hint: string }[]> = {
  delivery: [
    { id: "received", label: "Order confirmed", hint: "We've got your order" },
    { id: "preparing", label: "Preparing", hint: "Packing your bottles" },
    { id: "out_for_delivery", label: "Out for delivery", hint: "Your rider is on the way. Have your cash ready" },
    { id: "completed", label: "Delivered", hint: "Enjoy your Smoovy Baobab!" },
  ],
  collect: [
    { id: "received", label: "Order confirmed", hint: "We've got your order" },
    { id: "preparing", label: "Preparing", hint: "Packing your bottles" },
    {
      id: "ready_for_collection",
      label: "Ready for collection",
      hint: "Show your order number at the depot and pay in cash",
    },
    { id: "completed", label: "Collected", hint: "Enjoy your Smoovy Baobab!" },
  ],
};

export default function TrackOrderPage() {
  const { token } = useParams<{ token: string }>();
  const { orders, hydrated, advanceStatus } = useOrder();

  if (!hydrated) return null;
  const order = orders[token];

  if (!order) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-xl place-items-center px-4 text-center">
        <div>
          <p className="text-lg font-bold">Order not found</p>
          <p className="mt-1 text-sm text-muted">Check the link in your receipt.</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-leaf-700">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const paid = order.paid ?? true;
  const steps = STEPS[order.mode];
  const current = steps.findIndex((s) => s.id === order.status);
  const done = order.status === "completed";
  const suburb = SUBURBS.find((s) => s.id === order.location?.suburbId);
  const methodLabel = paymentLabel(order.paymentMethod, order.mode);

  return (
    <main className="min-h-dvh pb-12">
      <section className="bg-leaf-700 text-white">
        <div className="mx-auto max-w-xl px-4 pt-4 pb-8">
          <Logo />
          <div className="mt-6 flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/15">
              {order.mode === "delivery" ? (
                <ScooterIcon className="h-7 w-7 text-sage-400" />
              ) : (
                <BagIcon className="h-7 w-7 text-sage-400" />
              )}
            </span>
            <div>
              <p className="text-sm text-white/70">Order {order.token}</p>
              <h1 className="text-2xl font-black">{steps[current]?.label}</h1>
              <p className="text-sm text-white/80">{steps[current]?.hint}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-4 max-w-xl space-y-4 px-4">
        {/* Progress */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <ol className="relative">
            {steps.map((s, i) => {
              const reached = i <= current;
              const isLast = i === steps.length - 1;
              return (
                <li key={s.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {!isLast ? (
                    <span
                      className={`absolute top-7 left-[13px] h-[calc(100%-1.5rem)] w-0.5 ${
                        i < current ? "bg-leaf-600" : "bg-black/10"
                      }`}
                    />
                  ) : null}
                  <span
                    className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                      reached ? "bg-leaf-600 text-white" : "border-2 border-black/10 bg-white"
                    } ${i === current && !done ? "ring-4 ring-leaf-100" : ""}`}
                  >
                    {reached ? <CheckIcon className="h-4 w-4" /> : null}
                  </span>
                  <div className={reached ? "" : "opacity-50"}>
                    <p className="font-semibold">{s.label}</p>
                    <p className="text-xs text-muted">{s.hint}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {!done ? (
            <button
              onClick={() => advanceStatus(order.token)}
              className="mt-5 w-full rounded-xl border border-dashed border-black/15 py-2 text-xs font-semibold text-muted"
            >
              Demo only: move to next status (staff will do this from /admin)
            </button>
          ) : null}
        </section>

        {/* Where */}
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {order.mode === "delivery" ? "Delivering to" : "Collect from"}
          </p>
          {order.mode === "delivery" ? (
            <>
              <p className="font-bold">{suburb?.name}</p>
              <p className="text-sm text-muted">{order.location?.address}</p>
              {order.location?.notes ? (
                <p className="mt-1 text-sm text-muted">“{order.location.notes}”</p>
              ) : null}
            </>
          ) : (
            <>
              <p className="font-bold">{DEPOT.name}</p>
              <p className="text-sm text-muted">{DEPOT.address}</p>
              <p className="text-sm text-muted">{DEPOT.hours}</p>
            </>
          )}
        </section>

        {/* Receipt */}
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-bold">Receipt</h2>
            <span className={`text-xs ${paid ? "text-muted" : "font-semibold text-sage-500"}`}>
              {paid ? "Paid in cash" : `${methodLabel}: ${usd(order.quote.totalUsd)} due`}
            </span>
          </div>
          <PriceBreakdown q={order.quote} />
          <p className="mt-3 text-xs text-muted">
            {order.customer.isCorporate && order.customer.company ? `${order.customer.company} · ` : ""}
            {order.customer.name} · {order.customer.phone}
          </p>
        </section>


        <Link
          href="/"
          className="block rounded-2xl bg-white p-4 text-center text-sm font-bold text-leaf-700 shadow-sm"
        >
          Order again
        </Link>
      </div>
    </main>
  );
}
