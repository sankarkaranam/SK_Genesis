import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const device = db.devices.find(d => d.pairingCode === code);
    if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 });

    if (!device.assignedPlaylist) return NextResponse.json({ items: [] });

    const playlist = db.playlists.find(p => p._id === device.assignedPlaylist);
    if (!playlist) return NextResponse.json({ items: [] });

    const populatedItems = playlist.items.map((item: any) => {
        const content = db.content.find(c => c._id === item.contentId);
        return { ...item, content };
    }).filter((i: any) => i.content);

    return NextResponse.json({ ...playlist, items: populatedItems });
}
