// file: src/app/api/dealer/import/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parse } from "csv-parse/sync";
import { z } from "zod";

const RowSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  priceMkd: z.coerce.number().int().min(0),
  city: z.string().min(1),
  mileageKm: z.coerce.number().int().min(0).default(0),
  fuel: z.enum(["PETROL", "DIESEL", "HYBRID", "PHEV", "EV", "LPG", "CNG"]).default("PETROL"),
  transmission: z.enum(["MANUAL", "AUTO"]).default("MANUAL"),
});

// Normalize numbers like "1.200.000", "900,000", " 145 000 ", "2018 г.", "MKD 900.000"
function toInt(input: unknown): number | undefined {
  if (input === null || input === undefined) return undefined;
  const raw = String(input);
  // keep leading minus if any, strip everything that is not a digit
  const cleaned = raw.replace(/[^\d-]/g, "");
  if (!cleaned) return undefined;
  return parseInt(cleaned, 10);
}

// Case-insensitive enums + common aliases
function normFuel(v: unknown): string | undefined {
  if (!v) return undefined;
  const s = String(v).trim().toUpperCase();
  const map: Record<string, string> = {
    GASOLINE: "PETROL",
    BENZIN: "PETROL",
    BENZINE: "PETROL",
    NAFTA: "DIESEL",
  };
  return map[s] || s;
}

function normTrans(v: unknown): string | undefined {
  if (!v) return undefined;
  const s = String(v).trim().toUpperCase();
  const map: Record<string, string> = {
    AUTOMATIC: "AUTO",
    AUTOMATIK: "AUTO",
    MANUALNI: "MANUAL",
  };
  return map[s] || s;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  try {
    const csv = Buffer.from(await file.arrayBuffer()).toString("utf8");
    const rows = parse<Record<string, string | undefined>>(csv, {
      delimiter: [",", ";", "\t"],
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: true,
    });

    const diagnostics: Array<{
      ok: boolean;
      rowNumber: number;
      data?: z.infer<typeof RowSchema>;
      errors?: string[];
    }> = [];

    rows.forEach((r, i) => {
      const payload = {
        make: r.make ?? r.Make,
        model: r.model ?? r.Model,
        year: toInt(r.year ?? r.Year),
        priceMkd: toInt(r.priceMkd ?? r.PriceMkd ?? r.price ?? r.Price),
        city: (r.city ?? r.City ?? "").toString().trim(),
        mileageKm: toInt(r.mileageKm ?? r.MileageKm ?? r.mileage ?? r.Mileage),
        fuel: normFuel(r.fuel ?? r.Fuel),
        transmission: normTrans(r.transmission ?? r.Transmission),
      };

      const parsed = RowSchema.safeParse(payload);
      if (parsed.success) {
        diagnostics.push({ ok: true, rowNumber: i + 2, data: parsed.data });
      } else {
        diagnostics.push({
          ok: false,
          rowNumber: i + 2,
          errors: parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
        });
      }
    });

    const valid = diagnostics.filter(d => d.ok).length;
    const invalid = diagnostics.length - valid;

    return NextResponse.json({
      summary: { total: diagnostics.length, valid, invalid },
      diagnostics: diagnostics.slice(0, 50),
      expectedHeaders: Object.keys(RowSchema.shape),
    });
  } catch (e) {
    console.error("CSV import parse error:", e);
    return NextResponse.json({ error: "Invalid CSV" }, { status: 400 });
  }
}
