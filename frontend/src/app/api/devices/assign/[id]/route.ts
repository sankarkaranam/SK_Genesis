import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { playlistId, playlistData, deviceData } = await request.json();
    let device = db.devices.find(d => d._id === id);

    // SELF-HEALING: If device is missing (server restart) but we have the data, restore it
    if (!device && deviceData) {
        device = deviceData;
        db.devices.push(device);
    }

    if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 });

    // DEMO FIX: If we receive full playlist data, ensure it exists in memory
    if (playlistData) {
        // 1. Ensure playlist exists
        const existingPlaylist = db.playlists.find(p => p._id === playlistData._id);
        if (!existingPlaylist) {
            db.playlists.push(playlistData);
        }

        // 2. Ensure content exists (for the player to fetch details)
        if (playlistData.items) {
            playlistData.items.forEach((item: any) => {
                // The item might contain the full content object in a 'content' field or we might need to look it up
                // In our frontend logic, we'll pass the full content details if possible
                if (item.contentDetails) {
                    const existingContent = db.content.find(c => c._id === item.contentDetails._id);
                    if (!existingContent) {
                        db.content.push(item.contentDetails);
                    }
                }
            });
        }
    }

    device.assignedPlaylist = playlistId;
    return NextResponse.json(device);
}
