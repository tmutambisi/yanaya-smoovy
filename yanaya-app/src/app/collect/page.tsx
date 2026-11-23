"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { COLLECTION_POINTS, isOpenNow } from "@/lib/config";
import { useOrder } from "@/lib/order-store";
import { PrimaryButton, TopBar } from "@/components/ui";

/** Click & Collect: who is collecting, and where. */
export default function CollectPage() {
  const router = useRouter();
  const { hydrated, customer, setCustomer, collectPointId, setCollectPoint, setMode } = useOrder();
  const [name, setName] = useState("");
  const [pointId, setPointId] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setName(customer.name);
    setPointId(collectPointId ?? (COLLECTION_POINTS.length === 1 ? COLLECTION_POINTS[0].id : ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated) return null;

  const nameError = touched && name.trim().length < 2 ? "Enter the collector's name." : null;
  const pointError = touched && !pointId ? "Choose where you'll collect." : null;

  const save = () => {
    setTouched(true);
    if (name.trim().length < 2 || !pointId) return;
    setCustomer({ ...customer, name: name.trim() });
    setCollectPoint(pointId);
    setMode("collect");
    router.push("/store");
  };

  return (
    <main className="min-h-dvh bg-[#f1f2ea]">
      <TopBar back="/" title="Click & Collect" />
      <div className="mx-auto max-w-xl space-y-5 px-4 pt-6">
        <label className="block">
          <span className="font-semibold text-black/70">Collector&apos;s Name *</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="mt-2 h-14 w-full rounded-2xl bg-white px-4 text-lg outline-none focus:ring-2 focus:ring-leaf-500"
          />
          {nameError ? <span className="mt-1 block text-sm text-red-600">{nameError}</span> : null}
        </label>

        <div>
          <p className="font-semibold text-black/70">Collection point *</p>
          <div className="mt-2 space-y-2">
            {COLLECTION_POINTS.map((p) => {
              const selected = p.id === pointId;
              const open = isOpenNow(p);
              return (
                <button
                  key={p.id}
                  onClick={() => setPointId(p.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left ring-2 transition ${
                    selected ? "ring-leaf-600" : "ring-transparent"
                  }`}
                >
                  <span
                    className={`mt-1 h-5 w-5 shrink-0 rounded-full border-2 ${
                      selected ? "border-[6px] border-leaf-600" : "border-black/25"
                    }`}
                  />
                  <span className="flex-1">
                    <span className="block text-lg font-bold">{p.name}</span>
                    <span className="block text-sm text-muted">{p.address}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {p.hours} ·{" "}
                      <span className={open ? "font-semibold text-leaf-600" : "font-semibold text-red-600"}>
                        {open ? "Open" : "Closed"}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {pointError ? <p className="mt-1 text-sm text-red-600">{pointError}</p> : null}
        </div>

        <PrimaryButton onClick={save}>Save</PrimaryButton>
      </div>
    </main>
  );
}
