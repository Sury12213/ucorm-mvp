import { NextResponse } from 'next/server';
import { openrouter, replyModel } from '@/lib/openrouter';
import { createSupabaseAdminClient } from '@/lib/supabase';
import type { AISuggestion, SuggestionTone } from '@/types';

export const dynamic = 'force-dynamic';

type GeneratedSuggestion = {
  tone: SuggestionTone;
  content: string;
};

const expectedTones: SuggestionTone[] = ['Standard', 'Friendly', 'Recovery'];

function normalizeSuggestions(value: unknown): GeneratedSuggestion[] | null {
  if (!value || typeof value !== 'object' || !('suggestions' in value)) {
    return null;
  }

  const suggestions = (value as { suggestions?: unknown }).suggestions;

  if (!Array.isArray(suggestions) || suggestions.length !== 3) {
    return null;
  }

  const normalized = suggestions.map((suggestion) => {
    if (!suggestion || typeof suggestion !== 'object') {
      return null;
    }

    const tone = (suggestion as { tone?: unknown }).tone;
    const content = (suggestion as { content?: unknown }).content;

    if (!expectedTones.includes(tone as SuggestionTone) || typeof content !== 'string' || !content.trim()) {
      return null;
    }

    return { tone: tone as SuggestionTone, content: content.trim() };
  });

  if (normalized.some((suggestion) => suggestion === null)) {
    return null;
  }

  return normalized as GeneratedSuggestion[];
}

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient();
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .select('id, rating, text')
    .eq('id', params.id)
    .single();

  if (reviewError || !review) {
    return NextResponse.json({ message: 'Không tìm thấy đánh giá' }, { status: 404 });
  }

  if (!review.text) {
    return NextResponse.json({ message: 'Đánh giá không có nội dung' }, { status: 400 });
  }

  const completion = await openrouter.chat.completions.create({
    model: replyModel,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'Bạn là chuyên gia quản trị danh tiếng khách hàng. Chỉ trả lời bằng JSON hợp lệ. Tất cả nội dung phản hồi trong field content phải viết bằng tiếng Việt tự nhiên, chuyên nghiệp.',
      },
      {
        role: 'user',
        content: `Một khách hàng để lại đánh giá này (Điểm: ${review.rating ?? 'Không rõ'}/5):\n"${review.text}"\n\nTạo đúng 3 gợi ý phản hồi bằng tiếng Việt:\n1. "Standard" - Giọng văn chuyên nghiệp, lịch sự.\n2. "Friendly" - Giọng văn thân thiện, gần gũi, tích cực.\n3. "Recovery" - Giọng văn đồng cảm, nhận trách nhiệm, đưa hướng xử lý phù hợp.\n\nTrả về JSON:\n{\n  "suggestions": [\n    { "tone": "Standard", "content": "..." },\n    { "tone": "Friendly", "content": "..." },\n    { "tone": "Recovery", "content": "..." }\n  ]\n}`,
      },
    ],
    max_tokens: 500,
  });

  const rawContent = completion.choices[0]?.message.content;

  if (!rawContent) {
    return NextResponse.json({ message: 'AI không trả về nội dung' }, { status: 502 });
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawContent);
  } catch {
    return NextResponse.json({ message: 'AI trả về JSON không hợp lệ' }, { status: 502 });
  }

  const parsed = normalizeSuggestions(parsedJson);

  if (!parsed) {
    return NextResponse.json({ message: 'Định dạng phản hồi AI không hợp lệ' }, { status: 502 });
  }

  const rows = parsed.map((suggestion) => ({
    review_id: params.id,
    tone: suggestion.tone,
    content: suggestion.content,
  }));

  const { data: suggestions, error: insertError } = await supabase
    .from('ai_suggestions')
    .insert(rows)
    .select()
    .returns<AISuggestion[]>();

  if (insertError) {
    return NextResponse.json({ message: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ suggestions: suggestions ?? [] });
}
