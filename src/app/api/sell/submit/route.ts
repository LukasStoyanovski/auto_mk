// file: src/app/api/sell/submit/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-helpers";

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  // Only allow own DRAFT to go to REVIEW
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, sellerId: user.id, status: "DRAFT" },
    select: { id: true },
  });
  if (!listing) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "REVIEW" },
  });

  return NextResponse.json({ ok: true });
}
