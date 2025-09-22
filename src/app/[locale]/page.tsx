// file: src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { defaultLocale, locales, type Locale } from '@/i18n/config';

function toLocale(value: string): Locale {
  return (locales as readonly string[]).includes(value) ? (value as Locale) : defaultLocale;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = toLocale(locale);
  const t = await getTranslations({ locale: activeLocale });
  const featureCount = await prisma.featureTag.count();
  const rate = (await prisma.adminSettings.findUnique({ where: { id: 1 } }))?.eurMkdRate?.toString();

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">{t('hello')}</h1>
      <p className="text-sm text-gray-600">Feature tags in DB: {featureCount}</p>
      <p className="text-sm text-gray-600">EUR↔MKD rate: {rate ?? '—'}</p>
    </div>
  );
}
