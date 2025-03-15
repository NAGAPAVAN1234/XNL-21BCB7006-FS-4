import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Skip auth for public routes and login/signup
  if (
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'
  ) {
    return NextResponse.next();
  }

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    // Let the API route handle token verification
    return NextResponse.next();
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export const config = {
  matcher: ['/api/:path*', '/protected/:path*'],
};
