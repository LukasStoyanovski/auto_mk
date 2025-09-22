// file: src/app/[locale]/listing/[id]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs"; // use Node so Prisma is OK
export const alt = "Auto.mk listing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: { locale: Locale; id: string } };

export default async function OgImage({ params }: Props) {
  const { id } = params;

  const data = await prisma.listing.findUnique({
    where: { id },
    select: {
      title: true,
      priceEur: true,
      priceMkd: true,
      city: true,
      photos: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], select: { url: true } },
      vehicle: { select: { make: true, model: true, year: true } },
    },
  });

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111",
            color: "#fff",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Auto.mk
        </div>
      ),
      { ...size }
    );
  }

  const img = data.photos[0]?.url;
  const price = data.priceEur
    ? `€ ${data.priceEur.toLocaleString("mk-MK")}`
    : `${(data.priceMkd ?? 0).toLocaleString("mk-MK")} MKD`;
  const subtitle = [data.vehicle.year, data.vehicle.make, data.vehicle.model]
    .filter(Boolean)
    .join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b0b0b",
          display: "flex",
          flexDirection: "row",
          color: "#fff",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
        }}
      >
        {/* Photo */}
        <div
          style={{
            flex: 2,
            height: "100%",
            background: img ? `url(${img}) center / cover no-repeat` : "#1f1f1f",
          }}
        />
        {/* Meta */}
        <div
          style={{
            flex: 3,
            padding: 48,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 18,
                height: 18,
                background: "#e11d48",
                borderRadius: 4,
              }}
            />
            <div style={{ fontSize: 28, letterSpacing: 1, color: "#e5e7eb" }}>Auto.mk</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15 }}>{data.title}</div>
            <div style={{ fontSize: 26, color: "#cbd5e1" }}>{subtitle}</div>
            <div style={{ fontSize: 26, color: "#94a3b8" }}>{data.city ?? "—"}</div>
          </div>

          <div style={{ fontSize: 44, fontWeight: 900 }}>{price}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
