// file: src/app/api/sell/location/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Schema = z.object({
  listingId: z.string().min(1),
  city: z.string().min(1, "City is required"),
  municipality: z.string().optional().default(""),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  showExactLocation: z.boolean().default(false),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const data = parsed.data;

  const listing = await prisma.listing.findFirst({
    where: { id: data.listingId, status: "DRAFT", seller: { email: session.user.email! } },
    select: { id: true },
  });
  if (!listing) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      city: data.city,
      municipality: data.municipality || null,
      lat: data.lat,
      lng: data.lng,
      showExactLocation: data.showExactLocation,
    },
  });

  return NextResponse.json({ ok: true });
}
