'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Review, ReviewStatus } from '@/types';
import { PlaceFetcher } from '@/components/PlaceFetcher';
import { ReviewCard } from '@/components/ReviewCard';
import { TopNav } from '@/components/TopNav';

type FilterStatus = 'all' | ReviewStatus;

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [highlightedReviewIds, setHighlightedReviewIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterStatus>('Pending');
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pendingCount = reviews.filter((review) => review.status === 'Pending').length;
  const resolvedCount = reviews.filter((review) => review.status === 'Resolved').length;
  const filteredReviews = reviews
    .filter((review) => filter === 'all' || review.status === filter)
    .sort((left, right) => {
      const leftHighlighted = highlightedReviewIds.has(left.id) ? 1 : 0;
      const rightHighlighted = highlightedReviewIds.has(right.id) ? 1 : 0;

      if (leftHighlighted !== rightHighlighted) return rightHighlighted - leftHighlighted;

      const leftPlaceName = (left.places?.name ?? left.place_id).toLocaleLowerCase('vi-VN');
      const rightPlaceName = (right.places?.name ?? right.place_id).toLocaleLowerCase('vi-VN');
      const placeCompare = leftPlaceName.localeCompare(rightPlaceName, 'vi-VN');

      if (placeCompare !== 0) return placeCompare;

      const leftTime = new Date(left.review_time ?? left.created_at).getTime();
      const rightTime = new Date(right.review_time ?? right.created_at).getTime();

      return rightTime - leftTime;
    });
  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    setError(null);

    const response = await fetch('/api/reviews', { cache: 'no-store' });
    setLoadingReviews(false);

    if (!response.ok) {
      setError('Không thể tải danh sách đánh giá');
      return;
    }

    const data = await response.json();
    setReviews(data.reviews ?? []);
  }, []);

  function handleFetched(nextReviews?: Review[]) {
    setFilter('Pending');
    setHighlightedReviewIds(new Set((nextReviews ?? []).map((review) => review.id)));
    loadReviews();
  }

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopNav title="Bảng điều khiển" />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <p className="font-semibold text-xs uppercase tracking-[0.24em] text-primary">Nền tảng quản trị đánh giá AI</p>
              <h1 className="mt-3 font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                Nhập Place ID, lấy đánh giá, sinh phản hồi AI, duyệt trạng thái.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-on-surface-variant">
                Một màn hình duy nhất để lấy đánh giá, tạo gợi ý phản hồi và duyệt trạng thái. Bản hiện tại không đẩy phản hồi ngược lên Google.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <MetricCard label="Tổng đánh giá" value={loadingReviews ? '...' : reviews.length.toString()} />
              <MetricCard label="Chưa phản hồi" value={loadingReviews ? '...' : pendingCount.toString()} />
              <MetricCard label="Đã phản hồi" value={loadingReviews ? '...' : resolvedCount.toString()} />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-xs uppercase tracking-[0.2em] text-primary">Nguồn dữ liệu</p>
              <h2 className="font-headline text-xl font-bold text-on-surface">Lấy đánh giá Google</h2>
            </div>
          </div>
          <PlaceFetcher onFetched={handleFetched} />
        </section>

        <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-semibold text-xs uppercase tracking-[0.2em] text-primary">Quản lý phản hồi</p>
              <h2 className="font-headline text-xl font-bold text-on-surface">Danh sách đánh giá</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Lọc đánh giá theo trạng thái phản hồi, tạo AI và duyệt trực tiếp trên từng đánh giá.</p>
            </div>
            <div className="flex flex-wrap gap-2 rounded-2xl bg-surface-container-low p-1">
              <FilterButton active={filter === 'all'} label="Tất cả" count={reviews.length} onClick={() => setFilter('all')} />
              <FilterButton active={filter === 'Pending'} label="Chưa phản hồi" count={pendingCount} onClick={() => setFilter('Pending')} />
              <FilterButton active={filter === 'Resolved'} label="Đã phản hồi" count={resolvedCount} onClick={() => setFilter('Resolved')} />
            </div>
          </div>

          {error && <div className="mb-4 rounded-xl bg-error-container p-4 text-sm text-on-error-container">{error}</div>}

          {loadingReviews ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-2xl border border-outline-variant bg-surface-container-low" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-primary">reviews</span>
              <h3 className="mt-4 font-headline text-xl font-bold text-on-surface">Chưa có đánh giá</h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">Nhập Place ID ở trên rồi bấm Lấy đánh giá để lấy 5 đánh giá mới nhất.</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-primary">filter_alt_off</span>
              <h3 className="mt-4 font-headline text-xl font-bold text-on-surface">Không có đánh giá phù hợp</h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">Đổi bộ lọc để xem nhóm đánh giá khác.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} highlighted={highlightedReviewIds.has(review.id)} onApproved={() => loadReviews()} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="mt-2 font-headline text-3xl font-bold text-on-surface">{value}</p>
    </div>
  );
}

function FilterButton({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
        active ? 'bg-white text-primary shadow-sm ring-1 ring-outline-variant' : 'text-on-surface-variant hover:bg-white/70 hover:text-on-surface'
      }`}
    >
      {label} <span className="ml-1 text-xs opacity-70">{count}</span>
    </button>
  );
}
