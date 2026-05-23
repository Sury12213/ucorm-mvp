"use client";

import { useState } from "react";
import type { AISuggestion, Review } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { SuggestionCard } from "./SuggestionCard";

type ReviewCardProps = {
  review: Review;
  highlighted?: boolean;
  onApproved?: () => void;
};

function formatDate(value: string | null) {
  if (!value) return "Chưa có thời gian";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function ReviewCard({
  review,
  highlighted = false,
  onApproved,
}: ReviewCardProps) {
  const placeName = review.places?.name ?? review.place_id;
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(
    review.ai_suggestions ?? [],
  );
  const [status, setStatus] = useState(review.status);
  const [approvedReply, setApprovedReply] = useState(review.approved_reply);
  const [approvedSuggestionId, setApprovedSuggestionId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [approvingSuggestionId, setApprovingSuggestionId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const resolved = status === "Resolved";

  async function generateSuggestions() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${review.id}/generate`, {
        method: "POST",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message ?? "Không thể tạo gợi ý phản hồi");
        return;
      }

      setSuggestions(data?.suggestions ?? []);
    } catch {
      setError("Mất kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function approveSuggestion(suggestion: AISuggestion, content: string) {
    setError(null);
    setApprovingSuggestionId(suggestion.id);

    try {
      const response = await fetch(`/api/reviews/${review.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chosenSuggestionId: suggestion.id, content }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message ?? "Không thể duyệt phản hồi");
        return;
      }

      setApprovedReply(content.trim());
      setApprovedSuggestionId(suggestion.id);
      setStatus("Resolved");
      onApproved?.();
    } catch {
      setError("Mất kết nối. Vui lòng thử lại.");
    } finally {
      setApprovingSuggestionId(null);
    }
  }

  return (
    <article
      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition-all hover:shadow-md ${
        highlighted
          ? "border-primary ring-2 ring-primary/15"
          : "border-outline-variant"
      }`}
    >
      <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
        <div className="border-b border-outline-variant bg-surface-container-low p-5 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-start justify-between gap-3">
            <span className="inline-flex min-w-0 flex-1 items-center gap-1 text-xs font-semibold text-primary">
              <span className="material-symbols-outlined shrink-0 text-[14px]">
                location_on
              </span>
              <span className="truncate">{placeName}</span>
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {highlighted && (
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-on-primary">
                  Vừa lấy
                </span>
              )}
              <StatusBadge status={status} />
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white font-headline text-lg font-bold text-primary ring-1 ring-outline-variant">
              {(review.author_name?.charAt(0) || "K").toUpperCase()}
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">
                {review.author_name ?? "Khách hàng ẩn danh"}
              </h3>
              <p className="mt-1 text-xs text-on-surface-variant">
                {formatDate(review.review_time)}
              </p>
            </div>
          </div>

          <div
            className="mb-4 flex items-center gap-1 text-amber-500"
            aria-label={`${review.rating ?? 0} sao`}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={`material-symbols-outlined text-xl ${index < (review.rating ?? 0) ? "" : "text-outline-variant"}`}
                style={
                  index < (review.rating ?? 0)
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                star
              </span>
            ))}
          </div>

          <p className="text-sm leading-6 text-on-surface-variant">
            {review.text ?? "Không có nội dung đánh giá."}
          </p>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-xs uppercase tracking-[0.2em] text-primary">
                {resolved ? "Phản hồi đã duyệt" : "Gợi ý phản hồi"}
              </p>
              <h4 className="mt-1 font-headline text-lg font-bold text-on-surface">
                {resolved
                  ? "Nội dung đã gửi vào hệ thống"
                  : "AI tạo 3 lựa chọn phản hồi"}
              </h4>
            </div>
            {!resolved && (
              <button
                type="button"
                onClick={generateSuggestions}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface transition-all hover:border-primary hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className={`material-symbols-outlined text-lg ${loading ? "animate-spin" : ""}`}
                >
                  {loading ? "progress_activity" : "auto_awesome"}
                </span>
                {loading
                  ? "Đang tạo gợi ý..."
                  : suggestions.length > 0
                    ? "Tạo lại bằng AI"
                    : "Tạo phản hồi AI"}
              </button>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
              {error}
            </p>
          )}

          {approvedReply && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Phản hồi đã duyệt
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                {approvedReply}
              </p>
            </div>
          )}

          {!resolved &&
            (suggestions.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-sm leading-6 text-on-surface-variant">
                Chưa có gợi ý. Bấm “Tạo phản hồi AI” để sinh 3 câu trả lời: Tiêu
                chuẩn, Thân thiện, Khắc phục lỗi.
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    approved={
                      approvedSuggestionId === suggestion.id ||
                      approvedReply === suggestion.content
                    }
                    approving={approvingSuggestionId === suggestion.id}
                    disabled={approvingSuggestionId !== null}
                    onApprove={approveSuggestion}
                  />
                ))}
              </div>
            ))}
        </div>
      </div>
    </article>
  );
}
