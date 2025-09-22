// file: src/i18n/config.ts   (for the Locale type)
export const locales = ['mk','sq','en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'mk';
