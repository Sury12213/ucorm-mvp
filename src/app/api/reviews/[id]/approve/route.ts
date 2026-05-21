import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { suggestionId, chosenSuggestionId, content } = await request.json();
  const selectedSuggestionId = suggestionId ?? chosenSuggestionId;

  if (typeof selectedSuggestionId !== 'string' || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ message: 'Cần có ID gợi ý và nội dung phản hồi' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: suggestion, error: suggestionError } = await supabase
    .from('ai_suggestions')
    .select('id, review_id, content')
    .eq('id', selectedSuggestionId)
    .eq('review_id', params.id)
    .single();

  if (suggestionError || !suggestion) {
    return NextResponse.json({ message: 'Không tìm thấy gợi ý' }, { status: 404 });
  }

  const { data: review, error: updateError } = await supabase
    .from('reviews')
    .update({ approved_reply: content.trim(), status: 'Resolved' })
    .eq('id', params.id)
    .select('*, ai_suggestions(*)')
    .single();

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ review });
}
