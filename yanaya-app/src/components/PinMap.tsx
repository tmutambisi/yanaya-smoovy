"use client";

/**
 * Draggable delivery pin on OpenStreetMap (free, no API key).
 * Leaflet touches `window`, so it is imported inside useEffect (client only).
 * Production note: for real traffic, use a tile provider whose terms allow it
 * (OSM's public tiles are for light use only).
 */
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";

type LatLng = { lat: number; lng: number };

const PIN_SVG = `<svg viewBox="0 0 24 24" width="36" height="36" fill="#00662a" stroke="#2a2a2c" stroke-width="1.2" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Z"/><circle cx="12" cy="9" r="2.6" fill="#9ab46c" stroke="none"/></svg>`;

export function PinMap({
  value,
  center,
  onChange,
}: {
  /** Current pin, or null if not set yet. */
  value: LatLng | null;
  /** Where to look when there is no pin (e.g. the chosen suburb). */
  center: LatLng;
  onChange: (p: LatLng) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Create the map once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current || map.current) return;
      const start = value ?? center;
      const m = L.map(el.current, { zoomControl: true, attributionControl: true }).setView(
        [start.lat, start.lng],
        value ? 16 : 14,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(m);

      const icon = L.divIcon({ html: PIN_SVG, className: "", iconSize: [36, 36], iconAnchor: [18, 34] });
      const mk = L.marker([start.lat, start.lng], { draggable: true, icon }).addTo(m);
      mk.on("dragend", () => {
        const p = mk.getLatLng();
        onChangeRef.current({ lat: p.lat, lng: p.lng });
      });
      m.on("click", (e) => {
        mk.setLatLng(e.latlng);
        onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
      map.current = m;
      marker.current = mk;
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow external changes (GPS location, or a newly chosen suburb when no pin is set)
  useEffect(() => {
    const target = value ?? center;
    if (!map.current || !marker.current) return;
    marker.current.setLatLng([target.lat, target.lng]);
    map.current.setView([target.lat, target.lng], value ? 16 : 14);
  }, [value?.lat, value?.lng, center.lat, center.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className="isolate z-0 h-56 w-full overflow-hidden rounded-2xl border border-black/10 bg-leaf-50" />;
}
