'use client';

import { FormEvent, useState } from 'react';

type PlaceFetcherProps = {
  onFetched?: () => void;
};

export function PlaceFetcher({ onFetched }: PlaceFetcherProps) {
  const [placeId, setPlaceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch('/api/reviews/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeId }),
    });

    setLoading(false);

    if (!response.ok) {
      setError('Không thể lấy đánh giá');
      return;
    }

    setPlaceId('');
    onFetched?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <input
        value={placeId}
        onChange={(event) => setPlaceId(event.target.value)}
        placeholder="Nhập Google Place ID"
        className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
      />
      <button
        type="submit"
        disabled={!placeId || loading}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Đang lấy...' : 'Lấy đánh giá'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
