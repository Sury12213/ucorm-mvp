import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'TODO: fetch Google Places reviews and save to Supabase' }, { status: 501 });
}
