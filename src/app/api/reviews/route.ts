import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'TODO: list reviews with suggestions and status' }, { status: 501 });
}
