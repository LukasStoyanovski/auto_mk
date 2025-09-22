// file: src/components/listing-card.tsx
import Link from "next/link";

type ListingItem = {
  id: string;
  title: string;
  priceMkd: number;
  priceEur: number;
  city: string | null;
  make: string;
  model: string;
  year: number | null;
  primaryPhotoUrl: string | null;
};

export default function ListingCard({ item, locale }: { item: ListingItem; locale: string }) {
  const price = item.priceEur ? `€ ${item.priceEur.toLocaleString()}` : `${item.priceMkd.toLocaleString()} MKD`;

  return (
    <Link
      href={`/${locale}/listing/${item.id}`}
      className="block rounded-lg border bg-white hover:shadow-sm transition"
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-gray-100">
        {item.primaryPhotoUrl ? (
          <img src={item.primaryPhotoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-400 text-sm">No photo</div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <div className="font-medium leading-tight line-clamp-2">{item.title}</div>
        <div className="text-sm text-gray-600">
          {item.year ? `${item.year} · ` : ""}{item.make} {item.model}
        </div>
        <div className="text-sm font-semibold">{price}</div>
        <div className="text-xs text-gray-500">{item.city || "—"}</div>
      </div>
    </Link>
  );
}
