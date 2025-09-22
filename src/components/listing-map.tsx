// file: src/components/listing-map.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Lazy import react-leaflet components client-side only
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });

// Default marker icons (avoid broken images)
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon as any;

export default function ListingMap({ lat, lng }: { lat: number; lng: number }) {
  const [center, setCenter] = useState<[number, number]>([lat, lng]);

  useEffect(() => {
    setCenter([lat, lng]);
  }, [lat, lng]);

  return (
    <div className="h-64 w-full overflow-hidden rounded border">
      {(MapContainer as any)({ center, zoom: 12, style: { height: "100%", width: "100%" }, children: (
        <>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={center} />
        </>
      ) })}
    </div>
  );
}


