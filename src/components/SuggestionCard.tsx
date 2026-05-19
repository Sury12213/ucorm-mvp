import type { AISuggestion } from '@/types';

type SuggestionCardProps = {
  suggestion: AISuggestion;
  approved?: boolean;
  onApprove?: (suggestion: AISuggestion) => void;
};

export function SuggestionCard({ suggestion, approved = false, onApprove }: SuggestionCardProps) {
  return (
    <article className={`rounded-xl border p-4 ${approved ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="font-semibold text-slate-900">{suggestion.tone}</h4>
        {approved && <span className="text-xs font-medium text-green-700">Approved</span>}
      </div>
      <p className="text-sm leading-6 text-slate-700">{suggestion.content}</p>
      {onApprove && !approved && (
        <button
          type="button"
          onClick={() => onApprove(suggestion)}
          className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Approve
        </button>
      )}
    </article>
  );
}
