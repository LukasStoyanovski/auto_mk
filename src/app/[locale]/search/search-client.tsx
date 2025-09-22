// file: src/app/[locale]/search/search-client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ListingCard from "@/components/listing-card";

type Item = {
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

export default function SearchClient({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname()!;
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") || "");
  const [city, setCity] = useState(sp.get("city") || "");
  const [min, setMin] = useState(sp.get("minPriceMkd") || "");
  const [max, setMax] = useState(sp.get("maxPriceMkd") || "");
  const page = Number(sp.get("page") || 1);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const take = 12;

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (city) p.set("city", city);
    if (min) p.set("minPriceMkd", min);
    if (max) p.set("maxPriceMkd", max);
    p.set("page", String(page));
    p.set("take", String(take));
    return p.toString();
  }, [q, city, min, max, page]);

  async function fetchResults() {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?${queryString}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.items);
        setTotal(data.total);
      } else {
        setItems([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  function updateUrl(next: Partial<{ q: string; city: string; min: string; max: string; page: number }>) {
    const p = new URLSearchParams(sp.toString());
    if (next.q !== undefined) p.set("q", next.q);
    if (next.city !== undefined) {
      if (next.city) p.set("city", next.city);
      else p.delete("city");
    }
    if (next.min !== undefined) {
      if (next.min) p.set("minPriceMkd", next.min);
      else p.delete("minPriceMkd");
    }
    if (next.max !== undefined) {
      if (next.max) p.set("maxPriceMkd", next.max);
      else p.delete("maxPriceMkd");
    }
    if (next.page !== undefined) p.set("page", String(next.page));
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }

  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <form
        className="grid gap-3 md:grid-cols-[1fr,160px,160px,160px,auto]"
        onSubmit={(e) => {
          e.preventDefault();
          updateUrl({ q, city, min, max, page: 1 });
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search make, model, title…"
          className="border rounded px-3 py-2"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="border rounded px-3 py-2"
        />
        <input
          value={min}
          onChange={(e) => setMin(e.target.value)}
          placeholder="Min MKD"
          inputMode="numeric"
          className="border rounded px-3 py-2"
        />
        <input
          value={max}
          onChange={(e) => setMax(e.target.value)}
          placeholder="Max MKD"
          inputMode="numeric"
          className="border rounded px-3 py-2"
        />
        <button className="bg-black text-white px-4 py-2 rounded">Search</button>
      </form>

      {/* Results */}
      {loading ? (
        <p className="text-sm text-gray-600">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-600">No results.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => (
              <ListingCard key={it.id} item={it} locale={locale} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => updateUrl({ page: Math.max(1, page - 1) })}
              disabled={page <= 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => updateUrl({ page: Math.min(totalPages, page + 1) })}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
