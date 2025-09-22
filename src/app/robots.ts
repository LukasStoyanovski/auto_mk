// file: src/app/robots.ts
import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  const host = baseUrl();
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: [`${host}/sitemap.xml`],
    host,
  };
}
