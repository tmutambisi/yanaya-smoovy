/**
 * Reverse geocoding: GPS / map pin -> street + suburb, using OpenStreetMap's free
 * Nominatim service, called straight from the customer's browser.
 *
 * Nominatim usage policy (https://operations.osmfoundation.org/policies/nominatim/):
 *   - at most 1 request per second -> we throttle and only look up when the pin settles
 *   - results are cached so the same spot is never looked up twice
 *   - OSM attribution is shown on the map
 * If order volume grows a lot, move this behind our own API route or a paid geocoder.
 */
import { SUBURBS } from "./config";

export interface ReverseResult {
  /** e.g. "12 Natal Road" or a building name */
  street: string;
  /** Suburb name as OpenStreetMap knows it, e.g. "Avondale" */
  areaName: string;
  /** Our SUBURBS id if we deliver there */
  suburbId: string | null;
  /** City, e.g. "Harare" */
  city: string;
  /** Full human-readable address */
  display: string;
}

interface NominatimAddress {
  house_number?: string;
  road?: string;
  building?: string;
  amenity?: string;
  shop?: string;
  office?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
  residential?: string;
  hamlet?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
}

/**
 * OpenStreetMap labels central Harare inconsistently (Africa Unity Square comes back as
 * "Braeside", First Street as "Milton Park"), so the CBD is recognised by area instead.
 * APPROXIMATE box: Rotten Row / Julius Nyerere Way (W) to Fourth Street (E),
 * Josiah Tongogara / Samora Machel (N) to Kenneth Kaunda Ave (S). Adjust after a site check.
 */
const CBD_BOX = { south: -17.8365, north: -17.8215, west: 31.036, east: 31.0595 };
const inCbd = (lat: number, lng: number) =>
  lat >= CBD_BOX.south && lat <= CBD_BOX.north && lng >= CBD_BOX.west && lng <= CBD_BOX.east;

const cache = new Map<string, ReverseResult>();
let lastCall = 0;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

/** Other names OpenStreetMap may use for our suburbs. */
const ALIASES: Record<string, string[]> = {
  cbd: ["citycentre", "citycenter", "hararecentral", "centralbusinessdistrict", "hararecbd", "cbd"],
};

/**
 * Match OSM's area names to one of our delivery suburbs.
 * Exact name, an alias, or an OSM name that *contains* ours ("Avondale West" -> Avondale).
 * Never the other way round, so a bare "Harare" doesn't match "Harare CBD".
 */
export function matchSuburb(names: (string | undefined)[]): string | null {
  for (const n of names) {
    if (!n) continue;
    const k = norm(n);
    if (!k) continue;
    const hit =
      SUBURBS.find((s) => norm(s.name) === k || ALIASES[s.id]?.includes(k)) ??
      SUBURBS.find((s) => s.id !== "cbd" && k.includes(norm(s.name)));
    if (hit) return hit.id;
  }
  return null;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<ReverseResult> {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  // Throttle to 1 request/second
  const wait = lastCall + 1100 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  lastCall = Date.now();

  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18` +
    `&accept-language=en&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
  const data = (await res.json()) as { display_name?: string; address?: NominatimAddress; error?: string };
  if (data.error || !data.address) throw new Error(data.error ?? "No address here");

  const a = data.address;
  const place = a.building ?? a.amenity ?? a.shop ?? a.office;
  const road = a.road ? `${a.house_number ? `${a.house_number} ` : ""}${a.road}` : "";
  const street = [place, road].filter(Boolean).join(", ");
  const areaCandidates = [a.suburb, a.neighbourhood, a.quarter, a.residential, a.city_district, a.hamlet, a.village];
  const areaName = areaCandidates.find(Boolean) ?? a.town ?? "";

  const cbd = inCbd(lat, lng);
  const result: ReverseResult = {
    street,
    areaName: cbd ? "Harare CBD" : areaName,
    suburbId: cbd ? "cbd" : matchSuburb([...areaCandidates, a.town]),
    city: a.city ?? a.town ?? a.county ?? "",
    display: data.display_name ?? street,
  };
  cache.set(key, result);
  return result;
}
