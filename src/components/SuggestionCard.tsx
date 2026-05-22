"use client";

import { useState } from "react";
import type { AISuggestion } from "@/types";

type SuggestionCardProps = {
  suggestion: AISuggestion;
  approved?: boolean;
  approving?: boolean;
  disabled?: boolean;
  onApprove?: (suggestion: AISuggestion, content: string) => void;
};

const toneLabels: Record<AISuggestion["tone"], string> = {
  Standard: "Tiêu chuẩn",
  Friendly: "Thân thiện",
  Recovery: "Khắc phục lỗi",
};

const toneDescriptions: Record<AISuggestion["tone"], string> = {
  Standard: "Chuyên nghiệp, lịch sự, phù hợp đa số tình huống.",
  Friendly: "Ấm áp, gần gũi, tạo thiện cảm với khách hàng.",
  Recovery: "Đồng cảm, nhận trách nhiệm, đưa hướng xử lý rõ ràng.",
};

export function SuggestionCard({
  suggestion,
  approved = false,
  approving = false,
  disabled = false,
  onApprove,
}: SuggestionCardProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(suggestion.content);

  return (
    <article
      className={`rounded-2xl border p-4 transition-all ${
        approved
          ? "border-emerald-300 bg-emerald-50 shadow-sm"
          : "border-outline-variant bg-white hover:border-primary/50 hover:shadow-sm"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-headline text-base font-bold text-on-surface">
            {toneLabels[suggestion.tone]}
          </h4>
          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
            {toneDescriptions[suggestion.tone]}
          </p>
        </div>
        {approved && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            Đã duyệt
          </span>
        )}
      </div>

      {editing ? (
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={5}
          className="w-full resize-y rounded-xl border border-outline-variant bg-surface-container-low p-4 text-sm leading-6 text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
        />
      ) : (
        <p className="rounded-xl bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
          {content}
        </p>
      )}

      {onApprove && !approved && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing((current) => !current)}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface transition-all hover:border-primary hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            {editing ? "Xong chỉnh sửa" : "Chỉnh sửa"}
          </button>
          <button
            type="button"
            onClick={() => onApprove(suggestion, content)}
            disabled={!content.trim() || disabled}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              className={`material-symbols-outlined text-lg ${approving ? "animate-spin" : ""}`}
            >
              {approving ? "progress_activity" : "done"}
            </span>
            {approving ? "Đang duyệt..." : "Duyệt phản hồi này"}
          </button>
        </div>
      )}
    </article>
  );
}
