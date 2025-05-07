import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// This function can be marked `async` if using `await` inside
export default auth((req) => {
  const { nextUrl, auth: session } = req;
  
  // Ensure we're using HTTPS on Vercel
  if (process.env.VERCEL_URL && nextUrl.protocol === 'http:' && !nextUrl.hostname.includes('localhost')) {
    const secureUrl = nextUrl.clone();
    secureUrl.protocol = 'https:';
    return NextResponse.redirect(secureUrl);
  }

  const isLoggedIn = !!session;
  const isAuthRoute = nextUrl.pathname.startsWith('/login') || 
                      nextUrl.pathname.startsWith('/api/auth') ||
                      nextUrl.pathname === '/register';
  
  // Allow public API routes
  if (nextUrl.pathname.startsWith('/api/') && 
      !nextUrl.pathname.startsWith('/api/admin/') && 
      !nextUrl.pathname.startsWith('/api/user/')) {
    return NextResponse.next();
  }

  // If user is not logged in and trying to access a protected route, redirect to login
  if (!isLoggedIn && !isAuthRoute) {
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and trying to access login page, redirect to home
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', nextUrl.origin));
  }

  // User role-based access control
  if (isLoggedIn) {
    const userRoles = session?.user?.roles || [];
    const isAdmin = userRoles.includes('ADMIN');

    // Check if admin routes are being accessed
    if (nextUrl.pathname.startsWith('/settings') && !isAdmin) {
      // Redirect non-admin users to home page if trying to access admin routes
      return NextResponse.redirect(new URL('/', nextUrl.origin));
    }

    // Check if admin-only API routes are being accessed
    if (nextUrl.pathname.startsWith('/api/admin/') && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' }, 
        { status: 403 }
      );
    }

    // Check if the history page is being accessed
    if (nextUrl.pathname.startsWith('/history')) {
      // If user is not an admin, modify the URL to include their user ID as a filter
      if (!isAdmin && !nextUrl.searchParams.has('userId')) {
        const filteredUrl = new URL(nextUrl.href);
        filteredUrl.searchParams.set('userId', session?.user?.id || '');
        return NextResponse.redirect(filteredUrl);
      }
    }
  }

  return NextResponse.next();
})

// Exclude API routes and other static assets from middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (ALL API routes to avoid Edge runtime issues with bcryptjs)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icons (PWA icons)
     * - images (image assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|images).*)',
  ],
} 