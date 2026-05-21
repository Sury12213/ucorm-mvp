import type { ReviewStatus } from '@/types';

type StatusBadgeProps = {
  status: ReviewStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const className =
    status === 'Resolved'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
      : 'bg-amber-50 text-amber-700 ring-amber-600/20';
  const icon = status === 'Resolved' ? 'check_circle' : 'schedule';
  const label = status === 'Resolved' ? 'Đã xử lý' : 'Đang chờ';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}>
      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      {label}
    </span>
  );
}
