'use client';

import { FormEvent, useState } from 'react';

import type { Review } from '@/types';

type FetchResult = {
  insertedCount: number;
  skippedCount: number;
};

type PlaceFetcherProps = {
  onFetched?: (reviews?: Review[]) => void;
};

export function PlaceFetcher({ onFetched }: PlaceFetcherProps) {
  const [placeId, setPlaceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FetchResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const normalizedPlaceId = placeId.trim();

    const response = await fetch('/api/reviews/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeId: normalizedPlaceId }),
    });

    setLoading(false);

    const data = await response.json();

    if (!response.ok) {
      setError(data.message ?? 'Không thể lấy đánh giá');
      return;
    }

    setResult({
      insertedCount: data.insertedCount ?? 0,
      skippedCount: data.skippedCount ?? 0,
    });
    setPlaceId('');
    onFetched?.(data.reviews);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            value={placeId}
            onChange={(event) => setPlaceId(event.target.value)}
            placeholder="Nhập Google Place ID..."
            className="min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={!placeId || loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">cloud_download</span>
          {loading ? 'Đang lấy...' : 'Lấy đánh giá'}
        </button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      {result && (
        <p className="text-sm text-on-surface-variant">
          Đã thêm {result.insertedCount} đánh giá mới, bỏ qua {result.skippedCount} đánh giá đã tồn tại.
        </p>
      )}
    </form>
  );
}
