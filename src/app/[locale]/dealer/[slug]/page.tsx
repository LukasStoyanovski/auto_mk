// file: src/app/[locale]/dealer/[slug]/page.tsx
type Props = { params: Promise<{ slug: string }> };

export default async function DealerPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div>
      <h2 className="text-2xl font-semibold">Dealer: {slug}</h2>
      <p className="text-sm text-gray-600">Dealer profile coming soon.</p>
    </div>
  );
}
