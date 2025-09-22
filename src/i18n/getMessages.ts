// file: src/i18n/getMessages.ts   (ensure it exists and matches this)
import type { Locale } from './config';

export async function getMessages(locale: Locale) {
  switch (locale) {
    case 'mk':
      return (await import('@/messages/mk.json')).default;
    case 'sq':
      return (await import('@/messages/sq.json')).default;
    default:
      return (await import('@/messages/en.json')).default;
  }
}
