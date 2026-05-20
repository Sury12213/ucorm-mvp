import type { Review } from '@/types';
import { LogoutButton } from '@/components/LogoutButton';
import { PlaceFetcher } from '@/components/PlaceFetcher';
import { ReviewCard } from '@/components/ReviewCard';

const reviews: Review[] = [];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">AI-Powered ORM</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Bảng quản trị phản hồi đánh giá khách hàng</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Thu thập đánh giá Google, tạo gợi ý phản hồi bằng AI, duyệt phản hồi cuối cùng.
              </p>
            </div>
            <LogoutButton />
          </div>
          <div className="mt-6">
            <PlaceFetcher />
          </div>
        </header>

        <section className="grid gap-4">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
Chưa có đánh giá. Nhập Google Place ID để bắt đầu.
            </div>
          ) : (
            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </section>
      </section>
    </main>
  );
}
