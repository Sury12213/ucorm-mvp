'use client';

import { useState } from 'react';
import type { AISuggestion, Review } from '@/types';
import { StatusBadge } from './StatusBadge';
import { SuggestionCard } from './SuggestionCard';

type ReviewCardProps = {
  review: Review;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(review.ai_suggestions ?? []);
  const [status, setStatus] = useState(review.status);
  const [approvedReply, setApprovedReply] = useState(review.approved_reply);
  const [loading, setLoading] = useState(false);

  async function generateSuggestions() {
    setLoading(true);
    const response = await fetch(`/api/reviews/${review.id}/generate`, { method: 'POST' });
    setLoading(false);

    if (!response.ok) return;

    const data = await response.json();
    setSuggestions(data.suggestions ?? []);
  }

  async function approveSuggestion(suggestion: AISuggestion) {
    const response = await fetch(`/api/reviews/${review.id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chosenSuggestionId: suggestion.id, content: suggestion.content }),
    });

    if (!response.ok) return;

    setApprovedReply(suggestion.content);
    setStatus('Resolved');
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900">{review.author_name ?? 'Anonymous guest'}</h3>
          <p className="text-sm text-amber-500">{'★'.repeat(review.rating ?? 0)}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <p className="text-sm leading-6 text-slate-700">{review.text}</p>

      <button
        type="button"
        onClick={generateSuggestions}
        disabled={loading}
        className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate AI'}
      </button>

      {suggestions.length > 0 && (
        <div className="mt-4 grid gap-3">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              approved={approvedReply === suggestion.content}
              onApprove={approveSuggestion}
            />
          ))}
        </div>
      )}
    </article>
  );
}
