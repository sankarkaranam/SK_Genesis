import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    const { code, name } = await request.json();

    let device = db.devices.find(d => d.pairingCode === code);

    if (device) {
        device.isPaired = true;
        device.name = name || device.name;
        device.status = 'online';
    } else {
        device = {
            _id: randomUUID(),
            pairingCode: code,
            name: name || 'New Device',
            isPaired: true,
            status: 'online',
            lastSeen: new Date()
        };
        db.devices.push(device);
    }

    return NextResponse.json(device);
}
