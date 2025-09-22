// file: src/app/api/admin/listing/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PATCH(req: Request) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id, status } = await req.json();
  const allowed = ["PUBLISHED", "REJECTED", "ARCHIVED"] as const;
  if (!id || !allowed.includes(status)) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  await prisma.listing.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}
