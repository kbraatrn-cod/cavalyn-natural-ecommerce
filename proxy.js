import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== 'admin') return NextResponse.redirect(new URL('/', request.url));
  }

  if (['/profile', '/checkout'].some((path) => pathname.startsWith(path))) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/api/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/checkout', '/api/admin/:path*'],
};

