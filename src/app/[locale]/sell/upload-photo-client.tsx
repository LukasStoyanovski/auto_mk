// file: src/app/[locale]/sell/upload-photo-client.tsx
'use client';
import {useEffect, useState} from 'react';

type Photo = {id: string; url: string; key: string; isPrimary: boolean};

export default function UploadPhotoClient({listingId}: {listingId: string}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchPhotos() {
    const res = await fetch(`/api/sell/photos?listingId=${listingId}`);
    const data = await res.json();
    if (res.ok) setPhotos(data.photos as Photo[]);
  }

  useEffect(() => {
    fetchPhotos();
  }, [listingId]);

  async function upload(files: FileList) {
    if (!files?.length) return;
    setError(null);
    setStatus('Uploading…');
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('listingId', listingId);
      const res = await fetch('/api/upload/image', {method: 'POST', body: fd});
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Upload failed');
        setStatus(null);
        return;
      }
    }
    setStatus('Uploaded ✅');
    await fetchPhotos();
  }

  async function setPrimary(photoId: string) {
    setStatus('Updating…');
    setError(null);
    const res = await fetch('/api/sell/photo/primary', {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({photoId}),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Failed to update');
      setStatus(null);
      return;
    }
    setStatus('Updated ✅');
    await fetchPhotos();
  }

  async function remove(id: string) {
    setStatus('Deleting…');
    setError(null);
    const res = await fetch(`/api/sell/photos?id=${id}`, {method: 'DELETE'});
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Delete failed');
      setStatus(null);
      return;
    }
    setStatus('Deleted ✅');
    await fetchPhotos();
  }

  return (
    <div className="rounded border p-4 space-y-3 bg-white">
      <h3 className="text-md font-semibold">Step 2: Photos</h3>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && upload(e.target.files)}
      />
      {status && <p className="text-sm text-green-700">{status}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!!photos.length && (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {photos.map((p) => (
            <li key={p.id} className="border rounded p-2 bg-gray-50">
              <img src={p.url} alt="" className="w-full h-40 object-cover rounded" />
              <div className="mt-2 flex items-center justify-between text-sm">
                <button
                  onClick={() => setPrimary(p.id)}
                  className={`underline ${p.isPrimary ? 'font-semibold' : ''}`}
                  disabled={p.isPrimary}
                >
                  {p.isPrimary ? 'Primary' : 'Set primary'}
                </button>
                <button onClick={() => remove(p.id)} className="text-red-600 underline">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
