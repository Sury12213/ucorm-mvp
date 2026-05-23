import { NextRequest, NextResponse } from 'next/server';
import { authCookieName, verifySessionToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(authCookieName)?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!token) {
    if (isLoginPage) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await verifySessionToken(token).catch(() => null);

  if (!session) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(authCookieName);
    return response;
  }

  if (isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login'],
};
