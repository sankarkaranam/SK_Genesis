import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const now = new Date().getTime();
    const OFFLINE_THRESHOLD = 45 * 1000; // 45 seconds

    // Update status based on lastSeen
    db.devices.forEach(device => {
        if (device.lastSeen) {
            const lastSeenTime = new Date(device.lastSeen).getTime();
            if (now - lastSeenTime > OFFLINE_THRESHOLD) {
                device.status = 'offline';
            } else {
                device.status = 'online';
            }
        } else {
            device.status = 'offline';
        }
    });

    return NextResponse.json(db.devices);
}
