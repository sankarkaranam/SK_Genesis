import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { playlistId } = await request.json();
    const device = db.devices.find(d => d._id === id);

    if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 });

    device.assignedPlaylist = playlistId;
    return NextResponse.json(device);
}
