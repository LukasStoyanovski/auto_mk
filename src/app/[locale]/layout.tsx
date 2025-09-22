// file: src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "@/i18n/getMessages";
import { locales, type Locale, defaultLocale } from "@/i18n/config";
import SiteHeader from "@/components/site-header";
import Providers from "@/app/providers";

function toLocale(locale: string): Locale {
  return (locales as readonly string[]).includes(locale) ? (locale as Locale) : defaultLocale;
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = toLocale(locale);
  const messages = await getMessages(activeLocale);

  return (
    <>
      <Providers>
        <NextIntlClientProvider locale={activeLocale} messages={messages}>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </NextIntlClientProvider>
      </Providers>
    </>
  );
}
