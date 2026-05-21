import type { Review } from '@/types';
import { StatusBadge } from './StatusBadge';

type ReviewListItemProps = {
  review: Review;
  isSelected: boolean;
  onSelect: () => void;
};

function formatReviewTime(value: string | null) {
  if (!value) return 'Không rõ thời gian';

  const diffMs = Date.now() - new Date(value).getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / 36e5));

  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.floor(diffHours / 24)} ngày trước`;
}

function getInitial(name: string | null) {
  return (name?.trim().charAt(0) || 'K').toUpperCase();
}

export function ReviewListItem({ review, isSelected, onSelect }: ReviewListItemProps) {
  const stars = Math.max(0, Math.min(5, review.rating ?? 0));

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full cursor-pointer rounded-2xl bg-surface-container-lowest p-4 text-left shadow-sm transition-all hover:shadow ${
        isSelected
          ? 'border-y border-r border-outline-variant border-l-4 border-l-primary'
          : 'border border-outline-variant hover:border-outline'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-bold text-on-surface-variant">
            {getInitial(review.author_name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-on-surface">{review.author_name ?? 'Khách hàng ẩn danh'}</h3>
            <p className="text-xs text-on-surface-variant">{formatReviewTime(review.review_time)}</p>
          </div>
        </div>
        <StatusBadge status={review.status} />
      </div>

      <div className="mb-2 flex text-sm text-amber-500" aria-label={`${stars} sao`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className={index < stars ? 'material-symbols-outlined' : 'material-symbols-outlined text-outline-variant'} style={index < stars ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            star
          </span>
        ))}
      </div>

      <p className="line-clamp-3 text-sm leading-6 text-on-surface-variant">{review.text ?? 'Không có nội dung đánh giá.'}</p>
    </button>
  );
}
