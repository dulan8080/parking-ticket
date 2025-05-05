import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAuthRoute = nextUrl.pathname.startsWith('/login') || 
                      nextUrl.pathname.startsWith('/api/auth');
  
  // Allow API routes
  if (nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // If user is not logged in and trying to access a protected route, redirect to login
  if (!isLoggedIn && !isAuthRoute && nextUrl.pathname !== '/register') {
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and trying to access login page, redirect to home
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', nextUrl.origin));
  }

  // Check if the history page is being accessed
  if (isLoggedIn && nextUrl.pathname.startsWith('/history')) {
    // If user has ADMIN role, allow access
    const isAdmin = session?.user?.roles?.includes('ADMIN');
    
    // If user is not an admin, modify the URL to include their user ID as a filter
    if (!isAdmin && !nextUrl.searchParams.has('userId')) {
      const filteredUrl = new URL(nextUrl.href);
      filteredUrl.searchParams.set('userId', session?.user?.id || '');
      return NextResponse.redirect(filteredUrl);
    }
  }

  return NextResponse.next();
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|images).*)'],
} 