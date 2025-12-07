import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
    return NextResponse.json(db.playlists);
}

export async function POST(request: Request) {
    const body = await request.json();
    const playlist = {
        _id: randomUUID(),
        ...body,
        createdAt: new Date()
    };
    db.playlists.push(playlist);
    return NextResponse.json(playlist);
}
