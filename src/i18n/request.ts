// file: src/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';

type Locales = 'mk' | 'sq' | 'en';
const ALL: readonly Locales[] = ['mk', 'sq', 'en'];

export default getRequestConfig(async ({ locale }: { locale?: string }) => {
  const safe: Locales = (ALL as readonly string[]).includes(locale || '')
    ? (locale as Locales)
    : 'mk';

  // Use RELATIVE path to avoid alias issues
  const messages = (await import(`../messages/${safe}.json`)).default;
  return { messages, locale: safe };
});
