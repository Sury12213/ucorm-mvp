import type { ReviewStatus } from '@/types';

type StatusBadgeProps = {
  status: ReviewStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const className =
    status === 'Resolved'
      ? 'bg-green-100 text-green-700 ring-green-600/20'
      : 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
  const label = status === 'Resolved' ? 'Đã xử lý' : 'Chờ xử lý';

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}`}>
      {label}
    </span>
  );
}
