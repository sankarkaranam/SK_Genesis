import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const { password } = await request.json();

    // Simple hardcoded password check
    // In production, use an environment variable: process.env.ADMIN_PASSWORD
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === ADMIN_PASSWORD) {
        // Set a session cookie
        const cookieStore = await cookies();
        cookieStore.set('auth_token', 'valid_session', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
