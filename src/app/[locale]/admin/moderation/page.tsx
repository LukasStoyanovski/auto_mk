// file: src/app/[locale]/admin/moderation/page.tsx
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth-helpers";

async function getItems() {
  const h = await headers();
  const c = await cookies();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? "http";
  const base = (process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`).replace(/\/$/, "");
  const res = await fetch(`${base}/api/admin/listings/reviews`, {
    cache: "no-store",
    headers: {
      cookie: c.toString(),
    },
  });
  if (!res.ok) return { items: [] };
  return res.json() as Promise<{ items: Array<{ id: string; title: string; city: string; createdAt: string; vehicle: { make: string; model: string; year: number }; seller: { email: string; name: string | null } }> }>;
}

export default async function ModerationPage() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) notFound();

  const { items } = await getItems();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Moderation queue</h1>
      {items.length === 0 ? (
        <p className="text-sm text-gray-600">No items in review.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.id} className="rounded border p-3 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-gray-600">
                    {it.vehicle.year} {it.vehicle.make} {it.vehicle.model} • {it.city} • {it.seller.name ?? it.seller.email}
                  </div>
                </div>
                <div className="flex gap-2">
                  <AdminAction id={it.id} status="PUBLISHED" />
                  <AdminAction id={it.id} status="REJECTED" />
                  <AdminAction id={it.id} status="ARCHIVED" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminAction({ id, status }: { id: string; status: "PUBLISHED" | "REJECTED" | "ARCHIVED" }) {
  async function act() {
    "use server";
    const h = await headers();
    const c = await cookies();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const protocol = h.get("x-forwarded-proto") ?? "http";
    const base = (process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`).replace(/\/$/, "");
    await fetch(`${base}/api/admin/listings/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: c.toString() },
      body: JSON.stringify({ id, status }),
      cache: "no-store",
    });
  }
  return (
    <form action={act}>
      <button className="px-3 py-1 rounded border">{status}</button>
    </form>
  );
}


