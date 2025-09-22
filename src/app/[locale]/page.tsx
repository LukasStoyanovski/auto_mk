// file: src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { type Locale } from '@/i18n/config';

export default async function HomePage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale });
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
