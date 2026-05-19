import { NextResponse } from 'next/server';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json(
    { message: `TODO: generate AI suggestions for review ${params.id}` },
    { status: 501 },
  );
}
