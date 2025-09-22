// file: src/app/[locale]/dealer/import/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";

export default async function DealerImportPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/signin?callbackUrl=/${locale}/dealer/import`);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dealer CSV Import</h1>
      <p className="text-sm text-gray-600">
        Headers: <code>make, model, year, priceMkd, city, mileageKm, fuel, transmission</code>
      </p>

      <form className="rounded border bg-white p-4 space-y-3" id="import-form" encType="multipart/form-data">
        <input type="file" name="file" accept=".csv,text/csv" required />
        <div className="flex gap-2">
          <button data-action="validate" className="bg-gray-900 text-white px-4 py-2 rounded">Validate</button>
          <button data-action="commit" className="bg-green-600 text-white px-4 py-2 rounded">Validate & Import</button>
        </div>
      </form>

      <div id="report" />

      <script
        dangerouslySetInnerHTML={{
          __html: `
          const form = document.getElementById('import-form');
          const report = document.getElementById('report');
          form.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            e.preventDefault();
            const action = btn.getAttribute('data-action');
            const fd = new FormData(form);
            const url = action === 'commit' ? '/api/dealer/import/commit' : '/api/dealer/import';
            report.innerHTML = '<p class="text-sm text-gray-600">Processing…</p>';
            const res = await fetch(url, { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) {
              report.innerHTML = '<p class="text-red-600">Error: ' + (data.error || 'Request failed') + '</p>';
              return;
            }
            if (action === 'commit') {
              const { summary, report: rows } = data;
              report.innerHTML = \`
                <div class="rounded border p-3 bg-white">
                  <p class="text-sm">Imported: \${summary.created} / \${summary.total} (failed: \${summary.failed})</p>
                  <div class="mt-2 space-y-1">\${rows.map(r =>
                    r.ok
                      ? '<div class="text-xs text-green-700">Row ' + r.rowNumber + ': created listing ' + r.listingId + '</div>'
                      : '<div class="text-xs text-red-600">Row ' + r.rowNumber + ': ' + r.errors.join('; ') + '</div>'
                  ).join('')}</div>
                </div>\`;
            } else {
              const { summary, diagnostics, expectedHeaders } = data;
              report.innerHTML = \`
                <div class="rounded border p-3 bg-white">
                  <p class="text-sm">Total: \${summary.total} | Valid: \${summary.valid} | Invalid: \${summary.invalid}</p>
                  <p class="text-xs text-gray-500 mt-1">Expected headers: \${expectedHeaders.join(', ')}</p>
                  <div class="mt-2 space-y-1">\${diagnostics.map(d =>
                    d.ok
                      ? '<div class="text-xs text-green-700">Row ' + d.rowNumber + ': OK</div>'
                      : '<div class="text-xs text-red-600">Row ' + d.rowNumber + ': ' + d.errors.join('; ') + '</div>'
                  ).join('')}</div>
                </div>\`;
            }
          });
        `,
        }}
      />
    </div>
  );
}
