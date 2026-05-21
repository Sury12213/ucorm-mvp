import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId')?.trim();
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from('reviews')
    .select('*, ai_suggestions(*), places(name, place_id)', { count: 'exact' })
    .order('review_time', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (placeId) {
    query = query.eq('place_id', placeId);
  }

  const { data: reviews, error, count } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { reviews: reviews ?? [], count: count ?? 0 },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
