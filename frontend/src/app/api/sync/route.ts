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
            if (data.schedules) {
                data.schedules.forEach((s: any) => {
                    const existing = globalState.schedules.findIndex(es => es._id === s._id);
                    if (existing >= 0) globalState.schedules[existing] = s;
                    else globalState.schedules.push(s);
                });
            }
            return NextResponse.json({
                status: 'synced', count: {
                    devices: globalState.devices.length,
                    playlists: globalState.playlists.length,
                    content: globalState.content.length,
                    schedules: globalState.schedules.length
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
        return NextResponse.json({ items: [], status: 'not_found' });
    }

    let targetPlaylistId = device.assignedPlaylist;

    // SCHEDULE LOGIC: Override playlist if a schedule is active
    if (device.assignedSchedule) {
        const schedule = globalState.schedules.find(s => s._id === device.assignedSchedule);
        if (schedule) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes from midnight

            // Find active slot
            const activeSlot = schedule.slots.find((slot: any) => {
                const [startH, startM] = slot.startTime.split(':').map(Number);
                const [endH, endM] = slot.endTime.split(':').map(Number);
                const start = startH * 60 + startM;
                const end = endH * 60 + endM;
                return currentTime >= start && currentTime < end;
            });

            if (activeSlot) {
                targetPlaylistId = activeSlot.playlistId;
            } else {
                // No slot active right now? 
                // Option A: Show nothing (return empty)
                // Option B: Fallback to default playlist (if we had one)
                // For now, let's return empty/idle
                return NextResponse.json({ items: [], status: 'schedule_idle' });
            }
        }
    }

    if (!targetPlaylistId) {
        return NextResponse.json({ items: [], status: 'no_playlist' });
    }

    const playlist = globalState.playlists.find(p => p._id === targetPlaylistId);
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
