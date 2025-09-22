// file: src/components/listing-map.tsx
"use client";

import { createElement, useEffect, useState } from "react";
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

  const MapContainer = leaflet.MapContainer;
  const TileLayer = leaflet.TileLayer;
  const Marker = leaflet.Marker;

  return (
    <div className="h-64 w-full overflow-hidden rounded border">
      {createElement(
        MapContainer,
        {
          center,
          zoom: 12,
          style: { height: "100%", width: "100%" },
        } satisfies MapContainerProps,
        <>
          {createElement(TileLayer, {
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          } satisfies TileLayerProps)}
          {createElement(Marker, {
            position: center,
          } satisfies MarkerProps)}
        </>,
      )}
    </div>
  );
}
