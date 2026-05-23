'use client';

import { useEffect, useState } from 'react';
import type { AISuggestion, Review } from '@/types';

type AIPanelProps = {
  review: Review | null;
  onReviewUpdated: (review: Review) => void;
};

const toneLabels: Record<AISuggestion['tone'], string> = {
  Standard: 'Phản hồi tiêu chuẩn',
  Friendly: 'Phản hồi thân thiện',
  Recovery: 'Phản hồi khôi phục',
};

export function AIPanel({ review, onReviewUpdated }: AIPanelProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSuggestions(review?.ai_suggestions ?? []);
    setSelectedSuggestionId(review?.ai_suggestions?.[0]?.id ?? null);
    setError(null);
  }, [review?.id, review?.ai_suggestions]);

  async function generateSuggestions() {
    if (!review) return;

    setLoading(true);
    setError(null);

    const response = await fetch(`/api/reviews/${review.id}/generate`, { method: 'POST' });
    setLoading(false);

    if (!response.ok) {
      setError('Không thể tạo phản hồi AI');
      return;
    }

    const data = await response.json();
    const nextSuggestions = data.suggestions ?? [];
    setSuggestions(nextSuggestions);
    setSelectedSuggestionId(nextSuggestions[0]?.id ?? null);
    onReviewUpdated({ ...review, ai_suggestions: nextSuggestions });
  }

  async function approveSuggestion() {
    if (!review || !selectedSuggestionId) return;

    const selectedSuggestion = suggestions.find((suggestion) => suggestion.id === selectedSuggestionId);
    if (!selectedSuggestion) return;

    setApproving(true);
    setError(null);

    const response = await fetch(`/api/reviews/${review.id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chosenSuggestionId: selectedSuggestion.id, content: selectedSuggestion.content }),
    });
    setApproving(false);

    if (!response.ok) {
      setError('Không thể duyệt phản hồi');
      return;
    }

    onReviewUpdated({
      ...review,
      status: 'Resolved',
      approved_reply: selectedSuggestion.content,
      ai_suggestions: suggestions,
    });
  }

  if (!review) {
    return (
      <section className="flex h-[calc(100vh-160px)] items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center shadow-sm">
        <div>
          <span className="material-symbols-outlined text-5xl text-primary">auto_awesome</span>
          <h2 className="mt-4 font-headline text-xl font-bold text-on-surface">Chọn đánh giá</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-on-surface-variant">Chọn một đánh giá bên trái để tạo, xem và duyệt phản hồi AI.</p>
        </div>
      </section>
    );
  }

  const selectedSuggestion = suggestions.find((suggestion) => suggestion.id === selectedSuggestionId);

  return (
    <section className="sticky top-24 flex h-[calc(100vh-160px)] flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-outline-variant/50 pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          <div className="min-w-0">
            <h2 className="font-headline text-lg font-bold text-on-surface">Phản hồi thông minh từ AI</h2>
            <p className="truncate text-xs text-on-surface-variant">{review.author_name ?? 'Khách hàng ẩn danh'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={generateSuggestions}
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>refresh</span>
          {loading ? 'Đang tạo' : suggestions.length > 0 ? 'Tạo lại' : 'Tạo AI'}
        </button>
      </div>

      <div className="thin-scrollbar flex-1 overflow-y-auto pr-2">
        <div className="mb-4 rounded-lg bg-surface-container-low p-4">
          <p className="text-sm leading-6 text-on-surface-variant">{review.text ?? 'Không có nội dung đánh giá.'}</p>
        </div>

        {suggestions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-outline-variant p-8 text-center text-sm text-on-surface-variant">
            Chưa có gợi ý. Bấm “Tạo AI” để tạo 3 phản hồi.
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              const selected = suggestion.id === selectedSuggestionId;
              const approved = review.approved_reply === suggestion.content;

              return (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => setSelectedSuggestionId(suggestion.id)}
                  className={`relative w-full rounded-lg p-4 text-left transition-colors ${
                    selected
                      ? 'border-2 border-primary bg-primary-fixed/60'
                      : 'border border-outline-variant bg-surface-container-lowest hover:border-outline'
                  }`}
                >
                  <div className={`absolute right-4 top-4 ${selected ? 'text-primary' : 'text-outline-variant'}`}>
                    <span className="material-symbols-outlined" style={selected ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      {selected ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <h4 className="mb-2 pr-10 text-sm font-semibold text-on-surface">{toneLabels[suggestion.tone]}</h4>
                  <p className="text-sm leading-6 text-on-surface-variant">{suggestion.content}</p>
                  {approved && <p className="mt-3 text-xs font-medium text-green-700">Đã duyệt</p>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      <div className="mt-4 flex justify-end gap-3 border-t border-outline-variant/50 pt-4">
        <button type="button" className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low">
          Chỉnh sửa thủ công
        </button>
        <button
          type="button"
          onClick={approveSuggestion}
          disabled={!selectedSuggestion || approving}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-lg">send</span>
          {approving ? 'Đang duyệt' : 'Duyệt phản hồi'}
        </button>
      </div>
    </section>
  );
}
