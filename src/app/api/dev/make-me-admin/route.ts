// file: src/app/api/dev/make-me-admin/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Flip your role to ADMIN
  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { role: "ADMIN" },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ ok: true, user });
}

export async function GET() {
  // Convenience handler to hit in the browser during development
  return POST();
}
