// file: src/app/[locale]/search/page.tsx
import SearchClient from "./search-client";
import type { Locale } from "@/i18n/config";

export default async function SearchPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">Search</h2>
      <SearchClient locale={locale} />
    </div>
  );
}
