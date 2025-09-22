// file: src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { baseUrl } from "@/lib/url";

// Include latest published listings + static locale roots
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = baseUrl();

  // Locale roots
  const locales = ["mk", "sq", "en"];
  const staticEntries = locales.map<MetadataRoute.Sitemap[number]>((l) => ({
    url: `${host}/${l}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Latest published listings (limit 1k to keep light)
  const listings = await prisma.listing.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    select: { id: true, updatedAt: true },
    take: 1000,
  });

  const listingEntries: MetadataRoute.Sitemap = listings.flatMap((row) =>
    locales.map((l) => ({
      url: `${host}/${l}/listing/${row.id}`,
      lastModified: row.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
  );

  return [...staticEntries, ...listingEntries];
}
