// file: src/app/[locale]/sell/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
// Import the client component for draft creation
import StartDraftClient from "./start-draft-client";

export default async function SellPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = (locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : defaultLocale;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/signin?callbackUrl=/${activeLocale}/sell`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sell your vehicle</h1>
      <p className="text-sm text-gray-600">
        Wizard steps (specs → photos → price → location → preview → submit) will appear here.
      </p>
      <StartDraftClient locale={activeLocale} />
    </div>
  );
}
