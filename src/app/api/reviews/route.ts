import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data: reviews, error, count } = await supabase
    .from('reviews')
    .select('*, ai_suggestions(*)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { reviews: reviews ?? [], count: count ?? 0 },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
