// file: src/app/[locale]/sell/location-client.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMapEvents as useMapEventsHook } from "react-leaflet";

// Lazy-load Map parts to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// default Leaflet marker fix (no broken icons)
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

type Props = { listingId: string };

export default function LocationClient({ listingId }: Props) {
  const [city, setCity] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [showExact, setShowExact] = useState(false);
  const [pos, setPos] = useState<[number, number]>([41.6086, 21.7453]); // MK center-ish
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // search via Nominatim (client-side)
  async function searchPlace() {
    if (!q.trim()) return;
    setStatus("Searching…");
    setError(null);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("countrycodes", "mk");
      url.searchParams.set("limit", "1");
      const res = await fetch(url.toString(), {
        headers: { "Accept-Language": "mk" },
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        const hit = data[0];
        setPos([parseFloat(hit.lat), parseFloat(hit.lon)]);
        // Try to surface city/municipality from response if available
        const d = hit.display_name as string;
        if (d) {
          // naïve split: "Place, Municipality, City, North Macedonia"
          const parts = d.split(",").map(s => s.trim());
          setCity(parts[2] || parts[1] || parts[0] || city);
          setMunicipality(parts[1] || municipality);
        }
        setStatus("Found ✅");
      } else {
        setStatus(null);
        setError("No results");
      }
    } catch {
      setStatus(null);
      setError("Search failed");
    }
  }

  function MapClicker() {
    useMapEventsHook({
      click(e: { latlng: { lat: number; lng: number } }) {
        setPos([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  async function save() {
    setStatus("Saving…");
    setError(null);
    try {
      const res = await fetch("/api/sell/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          city,
          municipality,
          lat: pos[0],
          lng: pos[1],
          showExactLocation: showExact,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to save");
        setStatus(null);
        return;
      }
      setStatus("Saved ✅");
    } catch {
      setError("Network error");
      setStatus(null);
    }
  }

  return (
    <div className="rounded border p-4 space-y-3 bg-white">
      <h3 className="text-md font-semibold">Step 3: Location</h3>

      <div className="grid gap-2 md:grid-cols-[1fr,auto]">
        <input
          className="border rounded px-3 py-2"
          placeholder="Search city, address…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={searchPlace} className="bg-black text-white px-3 py-2 rounded">
          Search
        </button>
      </div>

      <div className="h-72 w-full overflow-hidden rounded border">
        {/* @ts-expect-error - MapContainer type issues with dynamic import */}
        <MapContainer center={pos} zoom={11} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClicker />
          <Marker position={pos} />
        </MapContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">City *</label>
          <input className="border rounded px-3 py-2 w-full" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Municipality</label>
          <input className="border rounded px-3 py-2 w-full" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showExact} onChange={(e) => setShowExact(e.target.checked)} />
        Show exact location on the listing page
      </label>

      <div className="text-xs text-gray-600">
        Lat/Lng: {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
      </div>

      <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">Save location</button>
      {status && <p className="text-sm text-green-700">{status}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
