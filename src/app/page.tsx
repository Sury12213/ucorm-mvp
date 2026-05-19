import type { Review } from '@/types';
import { PlaceFetcher } from '@/components/PlaceFetcher';
import { ReviewCard } from '@/components/ReviewCard';

const reviews: Review[] = [];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">AI-Powered ORM</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Hotel review response dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Fetch Google reviews, generate AI reply options, approve final response.
          </p>
          <div className="mt-6">
            <PlaceFetcher />
          </div>
        </header>

        <section className="grid gap-4">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No reviews yet. Fetch reviews by Place ID to start.
            </div>
          ) : (
            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </section>
      </section>
    </main>
  );
}
