import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
    return NextResponse.json(db.content.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}

export async function POST(request: Request) {
    const body = await request.json();
    const { addToDeviceId, ...contentData } = body;

    const content = {
        _id: randomUUID(),
        ...contentData,
        createdAt: new Date()
    };
    db.content.push(content);

    // Direct Publish Logic
    if (addToDeviceId) {
        const device = db.devices.find(d => d._id === addToDeviceId);
        if (device) {
            let playlist;
            if (device.assignedPlaylist) {
                playlist = db.playlists.find(p => p._id === device.assignedPlaylist);
            }

            if (!playlist) {
                playlist = {
                    _id: randomUUID(),
                    name: `Playlist for ${device.name}`,
                    items: [],
                    createdAt: new Date()
                };
                db.playlists.push(playlist);
                device.assignedPlaylist = playlist._id;
            }

            playlist.items.push({
                contentId: content._id,
                duration: 10,
                order: playlist.items.length
            });
        }
    }

    return NextResponse.json(content);
}
