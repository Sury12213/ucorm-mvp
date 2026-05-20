import { NextResponse } from 'next/server';
import { fetchPlaceDetails } from '@/lib/google-places';
import { createSupabaseAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { placeId } = await request.json();

    if (typeof placeId !== 'string' || !placeId.trim()) {
      return NextResponse.json({ message: 'Cần nhập Place ID' }, { status: 400 });
    }

    const normalizedPlaceId = placeId.trim();
    const placeDetails = await fetchPlaceDetails(normalizedPlaceId);
    const supabase = createSupabaseAdminClient();
    const placeName = placeDetails.displayName?.text ?? null;

    const { data: place, error: placeError } = await supabase
      .from('places')
      .upsert({ place_id: normalizedPlaceId, name: placeName }, { onConflict: 'place_id' })
      .select()
      .single();

    if (placeError) {
      return NextResponse.json({ message: placeError.message }, { status: 500 });
    }

    const reviews = (placeDetails.reviews ?? []).slice(0, 5).map((review, index) => ({
      place_id: normalizedPlaceId,
      google_review_id: review.name ?? `${normalizedPlaceId}-${review.publishTime ?? index}`,
      author_name: review.authorAttribution?.displayName ?? null,
      rating: review.rating ?? null,
      text: review.text?.text ?? review.originalText?.text ?? null,
      review_time: review.publishTime ?? null,
      status: 'Pending' as const,
    }));

    if (reviews.length === 0) {
      return NextResponse.json({ place, insertedCount: 0, skippedCount: 0 });
    }

    const reviewIds = reviews.map((review) => review.google_review_id);
    const { data: existingReviews, error: existingError } = await supabase
      .from('reviews')
      .select('google_review_id')
      .in('google_review_id', reviewIds);

    if (existingError) {
      return NextResponse.json({ message: existingError.message }, { status: 500 });
    }

    const existingIds = new Set((existingReviews ?? []).map((review) => review.google_review_id));
    const newReviews = reviews.filter((review) => !existingIds.has(review.google_review_id));

    if (newReviews.length > 0) {
      const { error: reviewsError } = await supabase.from('reviews').insert(newReviews);

      if (reviewsError) {
        return NextResponse.json({ message: reviewsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      place,
      insertedCount: newReviews.length,
      skippedCount: reviews.length - newReviews.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lấy đánh giá';
    const status = message.includes('Google Places request failed: 404') ? 404 : 500;
    return NextResponse.json({ message }, { status });
  }
}
