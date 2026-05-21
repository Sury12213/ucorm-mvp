import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { createSessionToken, authCookieName } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ message: 'Thông tin đăng nhập không đúng' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: admin, error } = await supabase
    .from('admins')
    .select('id, username, password_hash')
    .eq('username', username.trim())
    .single();

  if (error || !admin) {
    return NextResponse.json({ message: 'Thông tin đăng nhập không đúng' }, { status: 401 });
  }

  const passwordValid = await bcrypt.compare(password, admin.password_hash);

  if (!passwordValid) {
    return NextResponse.json({ message: 'Thông tin đăng nhập không đúng' }, { status: 401 });
  }

  const token = await createSessionToken({ adminId: admin.id, username: admin.username });
  const response = NextResponse.json({ ok: true });

  response.cookies.set(authCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8,
    path: '/',
  });

  return response;
}
