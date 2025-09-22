// file: src/components/locale-switcher.tsx
'use client';
import {usePathname, useRouter} from 'next/navigation';
import {useLocale} from 'next-intl';

const locales = ['mk','sq','en'] as const;

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const current = useLocale();

  function changeLocale(next: string) {
    if (!pathname) return;
    const parts = pathname.split('/');
    parts[1] = next; // swap locale prefix
    router.push(parts.join('/'));
  }

  return (
    <div className="inline-flex gap-2">
      {locales.map(l => (
        <button
          key={l}
          onClick={() => changeLocale(l)}
          className={`px-3 py-1 border rounded ${current===l ? 'bg-black text-white' : ''}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
