// file: src/components/price.tsx
export function formatMkd(n?: number | null) {
    if (n == null) return "—";
    return `${n.toLocaleString("mk-MK")} MKD`;
  }
  export function formatEur(n?: number | null) {
    if (!n) return "—";
    return `€ ${n.toLocaleString("mk-MK")}`;
  }
  export default function Price({ mkd, eur }: { mkd?: number | null; eur?: number | null }) {
    return (
      <div className="flex gap-2 items-baseline">
        <div className="text-2xl font-semibold">{eur ? formatEur(eur) : formatMkd(mkd)}</div>
        {eur && <div className="text-sm text-gray-500">{formatMkd(mkd)}</div>}
      </div>
    );
  }
  