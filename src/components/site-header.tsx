// file: src/components/site-header.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useSession, signOut } from "next-auth/react";

export default function SiteHeader() {
  const pathname = usePathname() || "/mk";
  const parts = pathname.split("/");
  const locale = parts[1] || "mk";
  const { data: session } = useSession();

  const nav = [
    { href: `/${locale}`, label: "Home" },
    { href: `/${locale}/search`, label: "Search" },
  ];

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href={`/${locale}`} className="font-semibold">
          Auto.mk
        </Link>
        <nav className="flex items-center gap-4">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm hover:underline">
              {n.label}
            </Link>
          ))}
          <LocaleSwitcher />
          <div className="w-px h-5 bg-gray-300 mx-1" />
          {session?.user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{session.user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm underline"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/signin" className="text-sm underline">
                Sign in
              </Link>
              <Link href="/signup" className="text-sm underline">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
