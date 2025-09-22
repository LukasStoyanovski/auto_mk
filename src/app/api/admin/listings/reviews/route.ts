// file: src/app/api/admin/listings/review/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const items = await prisma.listing.findMany({
    where: { status: "REVIEW" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, city: true, createdAt: true,
      vehicle: { select: { make: true, model: true, year: true } },
      seller: { select: { email: true, name: true } },
    },
  });
  return NextResponse.json({ items });
}
