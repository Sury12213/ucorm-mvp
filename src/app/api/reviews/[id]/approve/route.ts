import { NextResponse } from 'next/server';

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json(
    { message: `TODO: approve suggestion for review ${params.id}` },
    { status: 501 },
  );
}
