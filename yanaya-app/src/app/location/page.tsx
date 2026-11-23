"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { reverseGeocode, type ReverseResult } from "@/lib/geocode";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { DELIVERY_ZONES, MAP_DEFAULT_CENTER, SUBURBS } from "@/lib/config";
import { useOrder } from "@/lib/order-store";
import { usd } from "@/lib/pricing";
import { CheckIcon, LocateIcon, PinIcon, PrimaryButton, StickyFooter, TopBar } from "@/components/ui";

const PinMap = dynamic(() => import("@/components/PinMap").then((m) => m.PinMap), {
  ssr: false,
  loading: () => <div className="h-56 w-full animate-pulse rounded-2xl bg-leaf-50" />,
});

type GeoState = "idle" | "locating" | "done" | "error";

type Lookup =
  | { status: "idle" | "looking" | "error" }
  | { status: "found" | "outside"; result: ReverseResult };

export default function LocationPage() {
  const router = useRouter();
  // Use the customer's chosen mode here (not the 10-bottle effective mode) so they can always set an address.
  const { preferredMode: mode, location, setLocation, hydrated } = useOrder();

  const [suburbId, setSuburbId] = useState("");
  const [search, setSearch] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geo, setGeo] = useState<GeoState>("idle");
  const [touched, setTouched] = useState(false);
  const [lookup, setLookup] = useState<Lookup>({ status: "idle" });
  /** True while the street box holds text we filled in (so we may replace it on the next pin move). */
  const [streetAuto, setStreetAuto] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  /** Pin/GPS moved: look up the real street + suburb and fill them in. */
  const fillFromPin = async (p: { lat: number; lng: number }) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLookup({ status: "looking" });
    try {
      const r = await reverseGeocode(p.lat, p.lng, ctrl.signal);
      if (ctrl.signal.aborted) return;
      if (r.suburbId) setSuburbId(r.suburbId);
      // Never overwrite what the customer typed themselves
      const canReplace = addressRef.current.trim() === "" || streetAutoRef.current;
      if (r.street && canReplace) {
        setAddress(r.street);
        setStreetAuto(true);
      }
      setLookup({ status: r.suburbId ? "found" : "outside", result: r });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setLookup({ status: "error" });
    }
  };
  // Latest values for the async lookup above
  const streetAutoRef = useRef(streetAuto);
  streetAutoRef.current = streetAuto;
  const addressRef = useRef(address);
  addressRef.current = address;

  useEffect(() => {
    if (!hydrated) return;
    if (!mode) router.replace("/");
    else if (mode === "collect") router.replace("/collect");
    if (location) {
      setSuburbId(location.suburbId);
      setAddress(location.address);
      setNotes(location.notes);
      setCoords(location.coords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const filtered = useMemo(
    () => SUBURBS.filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase())),
    [search],
  );

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeo("error");
      return;
    }
    setGeo("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(p);
        setGeo("done");
        void fillFromPin(p);
      },
      () => setGeo("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (!hydrated || !mode) return null;

  // Collect orders use the Click & Collect page instead.
  if (mode === "collect") return null;

  /* ---------- Delivery ---------- */
  const lookupResult = "result" in lookup ? lookup.result : null;
  const suburb = SUBURBS.find((s) => s.id === suburbId);
  const fee = suburb ? DELIVERY_ZONES.find((z) => z.id === suburb.zone)?.feeUsd : undefined;
  const addressError = touched && address.trim().length < 5 ? "Enter your street address or building." : null;
  const suburbError = touched && !suburbId ? "Choose your area." : null;

  const submit = () => {
    setTouched(true);
    if (!suburbId || address.trim().length < 5) return;
    setLocation({ suburbId, address: address.trim(), notes: notes.trim(), coords });
    router.push("/store");
  };

  return (
    <main className="min-h-dvh pb-32">
      <TopBar back="/" title="Delivery address" />
      <div className="mx-auto max-w-xl space-y-5 px-4 pt-5">
        <button
          onClick={useMyLocation}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-leaf-500/40 bg-white p-4 text-left"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-leaf-50 text-leaf-700">
            {geo === "done" ? <CheckIcon className="h-5 w-5" /> : <LocateIcon className="h-5 w-5" />}
          </span>
          <span className="flex-1">
            <span className="block font-semibold">
              {geo === "locating" ? "Finding you…" : geo === "done" ? "Location pin added" : "Use my current location"}
            </span>
            <span className="block text-xs text-muted">
              {geo === "error"
                ? "Couldn't get your location. Type your address below."
                : geo === "done" && coords
                  ? `Helps our rider find you (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
                  : "Helps our rider find you faster"}
            </span>
          </span>
        </button>

        {/* What we found at the pin */}
        {lookup.status !== "idle" ? (
          <div
            aria-live="polite"
            className={`rounded-2xl border-2 p-3 text-sm ${
              lookup.status === "found"
                ? "border-leaf-600 bg-leaf-50"
                : lookup.status === "outside"
                  ? "border-sage-400 bg-sage-100"
                  : "border-black/10 bg-white"
            }`}
          >
            {lookup.status === "looking" ? (
              <p className="flex items-center gap-2 text-muted">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-leaf-600/30 border-t-leaf-600" />
                Finding your address…
              </p>
            ) : lookup.status === "error" ? (
              <p className="text-muted">Couldn&apos;t look up this spot. Choose your area and type your address below.</p>
            ) : lookup.status === "found" ? (
              <>
                <p className="font-semibold text-leaf-700">
                  ✓ {[lookup.result.street, lookup.result.areaName].filter(Boolean).join(", ")}
                </p>
                <p className="text-xs text-muted">Filled in for you below. Check it&apos;s right and add a house or flat number.</p>
              </>
            ) : (
              <>
                <p className="font-semibold">
                  {lookupResult?.areaName || lookupResult?.city || "This spot"} isn&apos;t in our delivery area yet
                </p>
                <p className="text-xs text-muted">
                  Pick the nearest area below, or go back and choose Click &amp; Collect.
                </p>
              </>
            )}
          </div>
        ) : null}

        <div>
          <label className="text-sm font-semibold" htmlFor="suburb-search">
            Your area
          </label>
          <input
            id="suburb-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suburb…"
            className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 outline-none focus:border-leaf-500"
          />
          <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-black/10 bg-white">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-muted">We don&apos;t deliver there yet. Try Collect instead.</p>
            ) : (
              filtered.map((s) => {
                const zoneFee = DELIVERY_ZONES.find((z) => z.id === s.zone)?.feeUsd ?? 0;
                const selected = s.id === suburbId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSuburbId(s.id)}
                    className={`flex w-full items-center gap-3 border-b border-black/5 px-4 py-3 text-left last:border-0 ${
                      selected ? "bg-leaf-50" : ""
                    }`}
                  >
                    <PinIcon className={`h-4 w-4 ${selected ? "text-leaf-700" : "text-muted"}`} />
                    <span className="flex-1 text-sm font-medium">{s.name}</span>
                    <span className="text-xs text-muted">{usd(zoneFee)} delivery</span>
                    {selected ? <CheckIcon className="h-4 w-4 text-leaf-700" /> : null}
                  </button>
                );
              })
            )}
          </div>
          {suburbError ? <p className="mt-1 text-sm text-red-600">{suburbError}</p> : null}
        </div>

        <div>
          <p className="text-sm font-semibold">Pin your exact spot</p>
          <p className="mb-2 text-xs text-muted">Drag the pin or tap the map: your gate or building entrance.</p>
          <PinMap
            value={coords}
            center={suburb ? { lat: suburb.lat, lng: suburb.lng } : MAP_DEFAULT_CENTER}
            onChange={(p) => {
              setCoords(p);
              setGeo("done");
              void fillFromPin(p);
            }}
          />
          <p className="mt-1 text-xs text-muted">
            {coords ? "Pin set ✓" : "No pin yet: we'll use your address and directions."}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="address">
            Street address / building
          </label>
          <input
            id="address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setStreetAuto(false); // customer edited it: keep their text
            }}
            placeholder="e.g. 12 King George Rd, Block B"
            className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 outline-none focus:border-leaf-500"
          />
          {addressError ? <p className="mt-1 text-sm text-red-600">{addressError}</p> : null}
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="notes">
            Directions for the rider <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Gate colour, landmark, reception desk…"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-leaf-500"
          />
        </div>
      </div>

      <StickyFooter>
        {suburb && fee !== undefined ? (
          <p className="mb-2 text-center text-xs text-muted">
            Delivery to {suburb.name}: <b className="text-ink">{usd(fee)}</b>
          </p>
        ) : null}
        <PrimaryButton onClick={submit}>Confirm address</PrimaryButton>
      </StickyFooter>
    </main>
  );
}
