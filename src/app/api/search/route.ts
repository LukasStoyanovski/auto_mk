// file: src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Filters = {
  q?: string;
  city?: string;
  fuel?: string;
  transmission?: string;
  minPriceMkd?: number;
  maxPriceMkd?: number;
  page?: number;
  take?: number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filters: Filters = {
    q: searchParams.get("q") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    fuel: searchParams.get("fuel") ?? undefined,
    transmission: searchParams.get("transmission") ?? undefined,
    minPriceMkd: searchParams.get("minPriceMkd")
      ? Number(searchParams.get("minPriceMkd"))
      : undefined,
    maxPriceMkd: searchParams.get("maxPriceMkd")
      ? Number(searchParams.get("maxPriceMkd"))
      : undefined,
    page: Math.max(1, Number(searchParams.get("page") || 1)),
    take: Math.min(50, Math.max(1, Number(searchParams.get("take") || 12))),
  };

  const offset = (filters.page! - 1) * filters.take!;
  const q = (filters.q || "").trim();
  const hasQ = q.length > 0;

  // dynamic WHERE pieces (safe parameterized)
  const where: string[] = [];
  const params: any[] = [];

  // Status: allow DRAFT for now so you can see your new items; later: ['PUBLISHED']
  const includeDraft = searchParams.get("includeDraft") === "1";

  where.push(includeDraft ? `l."status" IN ('DRAFT','PUBLISHED')` : `l."status" = 'PUBLISHED'`);

  if (filters.city) {
    params.push(filters.city);
    where.push(`l."city" = $${params.length}`);
  }
  if (filters.fuel) {
    params.push(filters.fuel);
    where.push(`v."fuel" = $${params.length}::"FuelType"`);
  }
  if (filters.transmission) {
    params.push(filters.transmission);
    where.push(`v."transmission" = $${params.length}::"Transmission"`);
  }
  if (typeof filters.minPriceMkd === "number") {
    params.push(filters.minPriceMkd);
    where.push(`l."priceMkd" >= $${params.length}`);
  }
  if (typeof filters.maxPriceMkd === "number") {
    params.push(filters.maxPriceMkd);
    where.push(`l."priceMkd" <= $${params.length}`);
  }

  // Full-text + trigram bits (optional when q present)
  let rankExpr = "NULL::float";
  let simExpr = "NULL::float";
  if (hasQ) {
    params.push(q);
    // rank on concatenated text (simple config works fine for mk/sq/en mix)
    rankExpr = `ts_rank_cd(
      to_tsvector('simple', coalesce(l."title",'') || ' ' || coalesce(v."make",'') || ' ' || coalesce(v."model",'')),
      websearch_to_tsquery('simple', $${params.length})
    )`;

    // best trigram similarity across make/model/title
    params.push(q);
    params.push(q);
    params.push(q);
    simExpr = `GREATEST(
      similarity(v."make", $${params.length - 2}),
      similarity(v."model", $${params.length - 1}),
      similarity(l."title", $${params.length})
    )`;

    // prefer rows that match either FTS or have some trigram similarity
    const prevLen = params.length;
    where.push(`(
      ${rankExpr} > 0
      OR ${simExpr} >= 0.1
      OR v."make" ILIKE '%' || $${prevLen - 2} || '%'
      OR v."model" ILIKE '%' || $${prevLen - 1} || '%'
      OR l."title" ILIKE '%' || $${prevLen} || '%'
    )`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Main query
  const sql = `
    SELECT
      l.id,
      l."title",
      l."priceMkd",
      l."priceEur",
      l."city",
      ${hasQ ? `${rankExpr} AS rank, ${simExpr} AS sim` : `NULL::float AS rank, NULL::float AS sim`},
      v."make", v."model", v."year",
      COALESCE(
        (SELECT url FROM "Photo" p WHERE p."listingId" = l.id AND p."isPrimary" = true LIMIT 1),
        (SELECT url FROM "Photo" p2 WHERE p2."listingId" = l.id ORDER BY p2."sortOrder" ASC, p2."createdAt" ASC LIMIT 1)
      ) AS "primaryPhotoUrl"
    FROM "Listing" l
    JOIN "Vehicle" v ON v.id = l."vehicleId"
    ${whereSql}
    ORDER BY
      ${hasQ ? `rank DESC NULLS LAST, sim DESC NULLS LAST,` : ``}
      l."createdAt" DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2};
  `;

  // Count for pagination (approx; we won’t compute rank/sim here)
  const countSql = `
    SELECT COUNT(*)::int AS count
    FROM "Listing" l
    JOIN "Vehicle" v ON v.id = l."vehicleId"
    ${whereSql};
  `;

  try {
    const rows = await prisma.$queryRawUnsafe(sql, ...params, filters.take, offset);
    const [{ count }] = (await prisma.$queryRawUnsafe(countSql, ...params)) as any[];
    return NextResponse.json({
      ok: true,
      page: filters.page,
      take: filters.take,
      total: count,
      items: rows,
    });
  } catch (e) {
    console.error("Search error:", e);
    return NextResponse.json({ ok: false, error: "Search failed" }, { status: 500 });
  }
}
