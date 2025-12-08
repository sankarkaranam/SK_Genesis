import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Global In-Memory State (Best effort for Vercel Demo)
// We use the shared 'db' instance so all API routes see the same data.
const globalState = db;



export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, data } = body;

        if (action === 'sync_dashboard') {
            // Dashboard sends its full state to "hydrate" the server
            // This is the "Self-Healing" Master Sync
            if (data.devices) {
                // Merge devices
                data.devices.forEach((d: any) => {
                    const existing = globalState.devices.findIndex(ed => ed._id === d._id);
                    if (existing >= 0) globalState.devices[existing] = d;
                    else globalState.devices.push(d);
                });
            }
            if (data.playlists) {
                data.playlists.forEach((p: any) => {
                    const existing = globalState.playlists.findIndex(ep => ep._id === p._id);
                    if (existing >= 0) globalState.playlists[existing] = p;
                    else globalState.playlists.push(p);
                });
            }
            if (data.content) {
                data.content.forEach((c: any) => {
                    const existing = globalState.content.findIndex(ec => ec._id === c._id);
                    if (existing >= 0) globalState.content[existing] = c;
                    else globalState.content.push(c);
                });
            }
            return NextResponse.json({
                status: 'synced', count: {
                    devices: globalState.devices.length,
                    playlists: globalState.playlists.length,
                    content: globalState.content.length
                }
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    // Player Logic
    const device = globalState.devices.find(d => d.pairingCode === code);

    if (!device) {
        // If device not found in memory, it might be a cold start.
        // Return empty, but the Dashboard should have "healed" this by now.
        return NextResponse.json({ items: [], status: 'not_found' });
    }

    if (!device.assignedPlaylist) {
        return NextResponse.json({ items: [], status: 'no_playlist' });
    }

    const playlist = globalState.playlists.find(p => p._id === device.assignedPlaylist);
    if (!playlist) {
        return NextResponse.json({ items: [], status: 'playlist_not_found' });
    }

    // Populate Content
    const populatedItems = playlist.items.map((item: any) => {
        const content = globalState.content.find(c => c._id === item.contentId);
        return { ...item, content };
    }).filter((i: any) => i.content);

    return NextResponse.json({ ...playlist, items: populatedItems });
}
