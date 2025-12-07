import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const { currentContent } = await request.json();
    const device = db.devices.find(d => d.pairingCode === code);

    if (device) {
        device.lastSeen = new Date();
        device.status = 'online';
        if (currentContent) {
            device.currentContent = currentContent;
        }
        return NextResponse.json({ status: 'ok' });
    } else {
        return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
}
