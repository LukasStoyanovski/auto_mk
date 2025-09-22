// file: src/components/listing-map.tsx
"use client";

import { useEffect, useState, type ComponentType } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type {
  MapContainerProps,
  TileLayerProps,
  MarkerProps,
} from "react-leaflet";

// Default marker icons (avoid broken images)
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

type LeafletComponents = {
  MapContainer: typeof import("react-leaflet").MapContainer;
  TileLayer: typeof import("react-leaflet").TileLayer;
  Marker: typeof import("react-leaflet").Marker;
};

export default function ListingMap({ lat, lng }: { lat: number; lng: number }) {
  const [center, setCenter] = useState<[number, number]>([lat, lng]);
  const [leaflet, setLeaflet] = useState<LeafletComponents | null>(null);

  useEffect(() => {
    setCenter([lat, lng]);
  }, [lat, lng]);

  useEffect(() => {
    let mounted = true;
    import("react-leaflet").then((mod) => {
      if (!mounted) return;
      setLeaflet({
        MapContainer: mod.MapContainer,
        TileLayer: mod.TileLayer,
        Marker: mod.Marker,
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!leaflet) {
    return <div className="h-64 w-full overflow-hidden rounded border" />;
  }

  const MapContainer = leaflet.MapContainer as ComponentType<MapContainerProps>;
  const TileLayer = leaflet.TileLayer as ComponentType<TileLayerProps>;
  const Marker = leaflet.Marker as ComponentType<MarkerProps>;

  return (
    <div className="h-64 w-full overflow-hidden rounded border">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center} />
      </MapContainer>
    </div>
  );
}
