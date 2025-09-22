// file: middleware.ts   (repo root)
import createMiddleware from 'next-intl/middleware';
import i18n from './next-intl.config';

export default createMiddleware({
  ...i18n,
  localePrefix: 'always',
  defaultLocale: 'mk'
});

// Run middleware for ALL paths except assets, API and Next internals
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
