// file: src/app/api/sell/draft/current/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listing = await prisma.listing.findFirst({
    where: { status: "DRAFT", seller: { email: session.user.email } },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  return NextResponse.json({ listingId: listing?.id ?? null });
}
