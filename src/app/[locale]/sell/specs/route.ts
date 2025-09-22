// file: src/app/api/sell/specs/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Schema = z.object({
  listingId: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  mileageKm: z.coerce.number().int().min(0),
  category: z.enum([
    "CAR","MOTORCYCLE","VAN","TRUCK","BUS","AGRI","CONSTRUCTION","OTHER"
  ]),
  fuel: z.enum(["PETROL","DIESEL","HYBRID","PHEV","EV","LPG","CNG"]),
  transmission: z.enum(["MANUAL","AUTO"]),
  condition: z.enum(["NEW","USED","DAMAGED"]),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const data = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const listing = await prisma.listing.findFirst({
      where: { id: data.listingId, sellerId: user.id, status: "DRAFT" },
      select: { id: true, vehicleId: true },
    });
    if (!listing) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    await prisma.vehicle.update({
      where: { id: listing.vehicleId },
      data: {
        category: data.category as "CAR" | "MOTORCYCLE" | "VAN" | "TRUCK" | "BUS" | "AGRI" | "CONSTRUCTION" | "OTHER",
        make: data.make,
        model: data.model,
        year: data.year,
        mileageKm: data.mileageKm,
        fuel: data.fuel as "PETROL" | "DIESEL" | "HYBRID" | "PHEV" | "EV" | "LPG" | "CNG",
        transmission: data.transmission as "MANUAL" | "AUTO",
        condition: data.condition as "NEW" | "USED" | "DAMAGED",
      },
    });

    const title = `${data.year} ${data.make} ${data.model}`.trim();
    await prisma.listing.update({
      where: { id: listing.id },
      data: { title },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Specs PATCH error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
