// file: src/app/[locale]/sell/start-draft-client.tsx
"use client";

import { useEffect, useState } from "react";
import SpecsFormClient from "./specs-form-client";
import UploadPhotoClient from "./upload-photo-client";
import LocationClient from "./location-client";

export default function StartDraftClient({ locale }: { locale: string }) {
  const [loading, setLoading] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Auto-resume the most recent draft on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/sell/draft/current", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && res.ok && data?.listingId) {
          setListingId(data.listingId);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function createDraft() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sell/draft", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to create draft");
      } else {
        setListingId(data.listingId);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function submitForReview() {
    if (!listingId) return;
    setStatusMsg("Submitting…");
    const res = await fetch("/api/sell/submit", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const data = await res.json();
    if (!res.ok) setStatusMsg(data?.error || "Failed");
    else setStatusMsg("Submitted for review ✅");
  }

  return (
    <div className="rounded border p-4 space-y-4 bg-white">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Step 0: Start or resume draft</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={createDraft}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Creating…" : (listingId ? "Create new draft" : "Create Draft")}
          </button>
          {listingId && (
            <span className="text-sm text-green-700">
              Current draft: <code>{listingId}</code>
            </span>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {listingId && (
        <>
          <div className="pt-4 border-t">
            <h3 className="text-md font-semibold mb-2">Step 1: Vehicle Specs</h3>
            <SpecsFormClient locale={locale} listingId={listingId} />
          </div>

          <div className="pt-4 border-t">
            <UploadPhotoClient listingId={listingId} />
          </div>

          <div className="pt-4 border-t">
            <LocationClient listingId={listingId} />
          </div>

          <div className="pt-4 border-t space-y-2">
            <h3 className="text-md font-semibold">Step 5: Submit</h3>
            <button
              onClick={submitForReview}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Submit for review
            </button>
            {statusMsg && <p className="text-sm text-gray-700">{statusMsg}</p>}
          </div>
        </>
      )}
    </div>
  );
}
