import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get('auth_token');
    const { pathname } = request.nextUrl;

    // Allow public access to login, player, and api routes
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/player') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // static files
    ) {
        return NextResponse.next();
    }

    // Protect dashboard routes
    if (!authToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
