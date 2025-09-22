// file: src/components/listing-map.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type * as ReactLeafletModule from "react-leaflet";

type ReactLeaflet = typeof ReactLeafletModule;
type MapContainerType = ReactLeaflet["MapContainer"];
type TileLayerType = ReactLeaflet["TileLayer"];
type MarkerType = ReactLeaflet["Marker"];

const MapContainer = dynamic(
  () => import("react-leaflet").then(({ MapContainer }) => ({ default: MapContainer })),
  { ssr: false },
) as unknown as MapContainerType;
const TileLayer = dynamic(
  () => import("react-leaflet").then(({ TileLayer }) => ({ default: TileLayer })),
  { ssr: false },
) as unknown as TileLayerType;
const Marker = dynamic(
  () => import("react-leaflet").then(({ Marker }) => ({ default: Marker })),
  { ssr: false },
) as unknown as MarkerType;

// Default marker icons (avoid broken images)
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export default function ListingMap({ lat, lng }: { lat: number; lng: number }) {
  const [center, setCenter] = useState<[number, number]>([lat, lng]);

  useEffect(() => {
    setCenter([lat, lng]);
  }, [lat, lng]);

  return (
    <div className="h-64 w-full overflow-hidden rounded border">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center} />
      </MapContainer>
    </div>
  );
}
