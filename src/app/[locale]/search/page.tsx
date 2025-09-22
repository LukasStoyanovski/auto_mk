// file: src/app/[locale]/search/page.tsx
import SearchClient from "./search-client";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

function toLocale(locale: string): Locale {
  return (locales as readonly string[]).includes(locale) ? (locale as Locale) : defaultLocale;
}

export default async function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = toLocale(locale);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">Search</h2>
      <SearchClient locale={activeLocale} />
    </div>
  );
}
