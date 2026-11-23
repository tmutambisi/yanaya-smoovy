"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DELIVERY_MIN_BOTTLES } from "@/lib/config";
import { useOrder } from "@/lib/order-store";
import { IntroSplash } from "@/components/IntroSplash";
import { ChevronIcon, TopBar, YanayaBadge } from "@/components/ui";

/** Splash / start screen: big brand mark + two order-type buttons. */
export default function Home() {
  const router = useRouter();
  const { setMode, orders, customer, location, hydrated } = useOrder();
  const [introDone, setIntroDone] = useState(false);
  const lastOrder = hydrated
    ? Object.values(orders).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    : undefined;
  const firstName = hydrated ? customer.name.trim().split(/\s+/)[0] : "";

  const startDelivery = () => {
    setMode("delivery");
    router.push(location ? "/store" : "/location");
  };
  const startCollect = () => {
    setMode("collect");
    router.push("/collect");
  };

  // Home content waits for the intro, then rises in.
  const rise = introDone ? "y-rise" : "opacity-0";
  const delay = (ms: number) => (introDone ? { animationDelay: `${ms}ms` } : undefined);

  return (
    <main className="flex min-h-dvh flex-col bg-leaf-700">
      <IntroSplash onDone={() => setIntroDone(true)} />
      <TopBar welcome={firstName ? `Welcome back, ${firstName}` : "Welcome to Yanaya"} />

      <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10">
        {/* soft background shapes */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-leaf-500/40" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-sage-400/25" />

        <div className={`relative flex flex-1 items-center ${rise}`}>
          <YanayaBadge size="lg" />
        </div>

        <div className="relative w-full pb-6">
          <h1 className={`text-center text-2xl font-bold text-white ${rise}`} style={delay(120)}>
            Start My New Order
          </h1>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className={rise} style={delay(220)}>
              <OrderTypeButton onClick={startDelivery} big="ORDER" small="for" big2="DELIVERY" highlight />
            </div>
            <div className={rise} style={delay(300)}>
              <OrderTypeButton onClick={startCollect} big="CLICK" small="&" big2="COLLECT" />
            </div>
          </div>
          <p className={`mt-4 text-center text-xs text-white/75 ${rise}`} style={delay(380)}>
            Delivery from {DELIVERY_MIN_BOTTLES} bottles · Collect any amount
          </p>

          {lastOrder ? (
            <Link
              href={`/order/${lastOrder.token}`}
              className="mt-6 flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-3 text-white backdrop-blur"
            >
              <span className="flex-1 text-sm">
                <span className="block font-bold">Track order {lastOrder.token}</span>
                <span className="block text-white/70">{lastOrder.quote.qty} bottles</span>
              </span>
              <ChevronIcon className="h-5 w-5" />
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function OrderTypeButton({
  onClick,
  big,
  small,
  big2,
  highlight,
}: {
  onClick: () => void;
  big: string;
  small: string;
  big2: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`${big} ${small} ${big2}`.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
      className={`rounded-full border-4 border-night bg-white px-3 py-3.5 text-leaf-700 shadow-[0_5px_0_0_#9ab46c] transition active:translate-y-1 active:shadow-none ${
        highlight ? "ring-8 ring-sage-400/40" : ""
      }`}
    >
      <span className="block text-xl leading-none font-black tracking-tight">
        {big} <span className="font-normal lowercase">{small}</span>
      </span>
      <span className="block text-xl leading-tight font-black tracking-tight">{big2}</span>
    </button>
  );
}
