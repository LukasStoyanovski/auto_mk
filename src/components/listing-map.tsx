// file: src/components/listing-map.tsx
"use client";

import dynamic from "next/dynamic";
import { forwardRef, useEffect, useState, type ComponentType } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";
import type {
  MapContainerProps,
  TileLayerProps,
  MarkerProps,
} from "react-leaflet";

const MapContainer = dynamic(
  () =>
    import("react-leaflet").then(({ MapContainer: LeafletMapContainer }) => {
      const Wrapped = forwardRef<LeafletMap, MapContainerProps>((props, ref) => (
        <LeafletMapContainer {...props} ref={ref} />
      ));
      Wrapped.displayName = "DynamicMapContainer";
      return Wrapped;
    }),
  { ssr: false },
) as ComponentType<MapContainerProps>;

const TileLayer = dynamic<TileLayerProps>(
  () =>
    import("react-leaflet").then(({ TileLayer: LeafletTileLayer }) =>
      function WrappedTileLayer(props: TileLayerProps) {
        return <LeafletTileLayer {...props} />;
      },
    ),
  { ssr: false },
);

const Marker = dynamic<MarkerProps>(
  () =>
    import("react-leaflet").then(({ Marker: LeafletMarker }) =>
      function WrappedMarker(props: MarkerProps) {
        return <LeafletMarker {...props} />;
      },
    ),
  { ssr: false },
);

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
