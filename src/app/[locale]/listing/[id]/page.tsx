// file: src/app/[locale]/listing/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/db";
import Price from "@/components/price";
import type { Metadata } from "next";
import { baseUrl } from "@/lib/url";
import Image from "next/image";

type Props = { params: { locale: Locale; id: string } };

// --- SEO: dynamic metadata for this listing ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = params;
  const url = `${baseUrl()}/${locale}/listing/${id}`;
  const ogImg = `${url}/opengraph-image`;

  const data = await prisma.listing.findUnique({
    where: { id },
    select: {
      title: true,
      priceEur: true,
      priceMkd: true,
      city: true,
      photos: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], select: { url: true } },
    },
  });
  if (!data) return {};
  const desc = [data.title, data.city, data.priceEur ? `€ ${data.priceEur.toLocaleString()}` : `${data.priceMkd.toLocaleString()} MKD`]
    .filter(Boolean)
    .join(" • ");

  return {
    title: data.title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
        title: data.title,
        description: desc,
        url,
        siteName: "Auto.mk",
        images: [{ url: ogImg, width: 1200, height: 630 }],
        type: "article",
        locale,
      },
      twitter: {
        card: "summary_large_image",
        title: data.title,
        description: desc,
        images: [ogImg],
      },
  };
}

export default async function ListingDetail({ params }: Props) {
  const { id, locale } = params;

  const data = await prisma.listing.findUnique({
    where: { id },
    include: {
      vehicle: {
        select: {
          make: true,
          model: true,
          year: true,
          mileageKm: true,
          fuel: true,
          transmission: true,
          drivetrain: true,
          euroStandard: true,
          condition: true,
          powerKw: true,
          engineDisplacementCc: true,
        },
      },
      photos: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { id: true, url: true, isPrimary: true },
      },
      seller: { select: { id: true, name: true, email: true } },
    },
  });

  if (!data) notFound();

  const v = data.vehicle;
  const primaryPhoto = data.photos[0]?.url;

  // --- SEO: JSON-LD (Vehicle + Offer) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: data.title,
    brand: v.make,
    model: v.model,
    vehicleModelDate: v.year || undefined,
    vehicleTransmission: v.transmission,
    fuelType: v.fuel,
    vehicleEngine: v.engineDisplacementCc
      ? { "@type": "EngineSpecification", engineDisplacement: `${v.engineDisplacementCc} cm3`, enginePower: v.powerKw ? `${v.powerKw} kW` : undefined }
      : undefined,
    mileageFromOdometer: v.mileageKm ? { "@type": "QuantitativeValue", value: v.mileageKm, unitCode: "KMT" } : undefined,
    image: primaryPhoto ? [primaryPhoto] : undefined,
    offers: {
      "@type": "Offer",
      price: data.priceEur || data.priceMkd,
      priceCurrency: data.priceEur ? "EUR" : "MKD",
      availability: data.status === "PUBLISHED" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `${baseUrl()}/${locale}/listing/${data.id}`,
    },
  };

  return (
    <div className="space-y-6">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{data.title}</h1>
        <span className="px-2 py-1 text-xs rounded bg-gray-100 border">{data.status}</span>
      </div>

      {/* Gallery */}
      <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
        <div className="rounded border bg-white overflow-hidden">
          {data.photos.length ? (
            <Image src={data.photos[0].url} alt="" width={800} height={600} className="w-full aspect-[4/3] object-cover" />
          ) : (
            <div className="w-full aspect-[4/3] grid place-items-center text-gray-400">No photo</div>
          )}
        </div>
        {data.photos.length > 1 && (
          <div className="grid grid-cols-3 gap-2">
            {data.photos.slice(1, 7).map((p) => (
              <Image key={p.id} src={p.url} alt="" width={200} height={150} className="rounded border aspect-[4/3] object-cover bg-gray-100" />
            ))}
          </div>
        )}
      </div>

      {/* Price & quick facts */}
      <div className="rounded border bg-white p-4">
        <div className="flex items-center justify-between">
          <Price mkd={data.priceMkd} eur={data.priceEur} />
          <div className="text-sm text-gray-600">{data.city ?? "—"}</div>
        </div>
      </div>

      {/* Specs */}
      <div className="rounded border bg-white p-4">
        <h2 className="text-lg font-semibold mb-3">Specs</h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <div><dt className="text-gray-500">Make / Model</dt><dd>{v.make} {v.model}</dd></div>
          <div><dt className="text-gray-500">Year</dt><dd>{v.year ?? "—"}</dd></div>
          <div><dt className="text-gray-500">Mileage</dt><dd>{v.mileageKm?.toLocaleString("mk-MK") ?? "—"} km</dd></div>
          <div><dt className="text-gray-500">Fuel</dt><dd>{v.fuel}</dd></div>
          <div><dt className="text-gray-500">Transmission</dt><dd>{v.transmission}</dd></div>
          <div><dt className="text-gray-500">EURO</dt><dd>{v.euroStandard}</dd></div>
          <div><dt className="text-gray-500">Condition</dt><dd>{v.condition}</dd></div>
        </dl>
      </div>

      {/* Location (only if allowed and present) */}
      {data.showExactLocation && data.lat != null && data.lng != null && (
        <div className="rounded border bg-white p-4">
          <h2 className="text-lg font-semibold mb-3">Location</h2>
          <div className="text-sm text-gray-600 mb-2">
            {data.city}{data.municipality ? `, ${data.municipality}` : ""}
          </div>
          <div className="h-64 w-full overflow-hidden rounded border bg-gray-100 grid place-items-center text-gray-500">
            Map preview temporarily unavailable
          </div>
        </div>
      )}

      {/* Seller box */}
      <div className="rounded border bg-white p-4">
        <h2 className="text-lg font-semibold mb-2">Seller</h2>
        <p className="text-sm">
          {data.seller.name ?? data.seller.email} • <span className="text-gray-600">{data.seller.email}</span>
        </p>
      </div>
    </div>
  );
}
