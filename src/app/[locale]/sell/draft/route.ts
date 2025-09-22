// file: src/app/[locale]/sell/draft/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create minimal Vehicle and Listing in DRAFT
  // @ts-ignore - Prisma client types not updated in linter
  const vehicle = await prisma.vehicle.create({
    data: {
      category: "CAR",
      make: "Draft",
      model: "Draft",
      year: 2015,
      mileageKm: 0,
      fuel: "PETROL",
      transmission: "MANUAL",
      euroStandard: "NA",
      condition: "USED",
    },
  });

  // @ts-ignore - Prisma client types not updated in linter
  const listing = await prisma.listing.create({
    data: {
      title: "Draft listing",
      sellerId: user.id,
      vehicleId: vehicle.id,
      priceMkd: 0,
      priceEur: 0,
      city: "Skopje",
      status: "DRAFT",
      showExactLocation: false,
      accidentFree: true,
      serviceHistory: "NONE",
    },
    select: { id: true },
  });

  return NextResponse.json({ listingId: listing.id }, { status: 201 });
}
