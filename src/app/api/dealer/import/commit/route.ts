// file: src/app/api/dealer/import/commit/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parse } from "csv-parse/sync";
import { z } from "zod";

// Same schema as validate
const RowSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  priceMkd: z.coerce.number().int().min(0),
  city: z.string().min(1),
  mileageKm: z.coerce.number().int().min(0).default(0),
  fuel: z.enum(["PETROL","DIESEL","HYBRID","PHEV","EV","LPG","CNG"]).default("PETROL"),
  transmission: z.enum(["MANUAL","AUTO"]).default("MANUAL"),
});

// Helpers copied from validator
function toInt(input: unknown): number | undefined {
  if (input === null || input === undefined) return undefined;
  const raw = String(input);
  const cleaned = raw.replace(/[^\d-]/g, "");
  if (!cleaned) return undefined;
  return parseInt(cleaned, 10);
}
function normFuel(v: any): string | undefined {
  if (!v) return undefined;
  const s = String(v).trim().toUpperCase();
  const map: Record<string, string> = { GASOLINE: "PETROL", BENZIN: "PETROL", BENZINE: "PETROL", NAFTA: "DIESEL" };
  return map[s] || s;
}
function normTrans(v: any): string | undefined {
  if (!v) return undefined;
  const s = String(v).trim().toUpperCase();
  const map: Record<string, string> = { AUTOMATIC: "AUTO", AUTOMATIK: "AUTO", MANUALNI: "MANUAL" };
  return map[s] || s;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  const csv = Buffer.from(await file.arrayBuffer()).toString("utf8");
  const rows: any[] = parse(csv, {
    delimiter: [",",";","\t"],
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relaxColumnCount: true,
  });

  const rateRow = await prisma.adminSettings.findUnique({ where: { id: 1 }, select: { eurMkdRate: true } });
  const eurRate = rateRow?.eurMkdRate ? Number(rateRow.eurMkdRate) : undefined;

  const report: Array<
    | { ok: true; rowNumber: number; listingId: string }
    | { ok: false; rowNumber: number; errors: string[] }
  > = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const payload = {
      make: r.make ?? r.Make,
      model: r.model ?? r.Model,
      year: toInt(r.year ?? r.Year),
      priceMkd: toInt(r.priceMkd ?? r.PriceMkd ?? r.price ?? r.Price),
      city: (r.city ?? r.City ?? "").toString().trim(),
      mileageKm: toInt(r.mileageKm ?? r.MileageKm ?? r.mileage ?? r.Mileage) ?? 0,
      fuel: normFuel(r.fuel ?? r.Fuel),
      transmission: normTrans(r.transmission ?? r.Transmission),
    };

    const parsed = RowSchema.safeParse(payload);
    if (!parsed.success) {
      report.push({
        ok: false,
        rowNumber: i + 2,
        errors: parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
      });
      continue;
    }

    const d = parsed.data;
    try {
      const vehicle = await prisma.vehicle.create({
        data: {
          category: "CAR",
          make: d.make,
          model: d.model,
          year: d.year,
          mileageKm: d.mileageKm,
          fuel: d.fuel as any,
          transmission: d.transmission as any,
          euroStandard: "NA",
          condition: "USED",
        },
        select: { id: true },
      });

      const priceEur =
        eurRate && eurRate > 0 ? Math.round(d.priceMkd / eurRate) : 0;

      const listing = await prisma.listing.create({
        data: {
          title: `${d.year} ${d.make} ${d.model}`,
          status: "DRAFT",
          sellerId: user.id,
          vehicleId: vehicle.id,
          priceMkd: d.priceMkd,
          priceEur,
          negotiable: true,
          city: d.city,
          showExactLocation: false,
          accidentFree: true,
          serviceHistory: "NONE",
        },
        select: { id: true },
      });

      report.push({ ok: true, rowNumber: i + 2, listingId: listing.id });
    } catch (e: any) {
      report.push({
        ok: false,
        rowNumber: i + 2,
        errors: ["DB error: " + (e?.message || "unknown")],
      });
    }
  }

  const created = report.filter((r) => r.ok).length;
  const failed = report.length - created;

  return NextResponse.json({
    summary: { total: report.length, created, failed },
    report: report.slice(0, 100),
  });
}
