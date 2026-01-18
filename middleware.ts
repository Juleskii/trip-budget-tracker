import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/trips'];

// Routes only for unauthenticated users
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
    const { supabaseResponse, user } = await updateSession(request);
    const path = request.nextUrl.pathname;

    // Check if trying to access protected route without auth
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

    if (isProtectedRoute && !user) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users away from auth pages
    const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
