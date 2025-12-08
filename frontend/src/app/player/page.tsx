'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PlayerPage() {
    const [pairingCode, setPairingCode] = useState('');
    const [isPaired, setIsPaired] = useState(false);
    const [deviceName, setDeviceName] = useState('');

    useEffect(() => {
        let currentPairingCode = '';
        // Try to recover state from localStorage
        const savedCode = localStorage.getItem('sk_pairing_code');
        if (savedCode) {
            currentPairingCode = savedCode;
            setPairingCode(savedCode);
            // We assume it's paired if we have a code, but we should verify with backend ideally.
            // For now, let's just set it and let the heartbeat/fetch logic run.
            setIsPaired(true);
        } else {
            // Generate new code
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            currentPairingCode = newCode;
            setPairingCode(newCode);
            localStorage.setItem('sk_pairing_code', newCode);
        }

        const interval = setInterval(async () => {
            if (!currentPairingCode) return; // Ensure code is set before polling
            try {
                const res = await axios.get('/api/devices');
                const device = res.data.find((d: any) => d.pairingCode === currentPairingCode);

                if (device && device.isPaired) {
                    setIsPaired(true);
                    setDeviceName(device.name);
                    clearInterval(interval);
                }
            } catch (err) {
                console.error(err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const [content, setContent] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isPaired && pairingCode) {
            // 1. Load from Cache immediately (Instant Playback)
            const cached = localStorage.getItem(`sk_player_content_${pairingCode}`);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed.length > 0) setContent(parsed);
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            const fetchContent = async () => {
                try {
                    // Fetch content specifically for this device
                    const res = await axios.get(`/api/sync?code=${pairingCode}`);
                    const { status, items } = res.data;

                    // "Never-Black" Logic:
                    // If server lost memory (status='not_found' or 'playlist_not_found'), 
                    // IGNORE the empty response and keep playing from cache.
                    if (status === 'not_found' || status === 'playlist_not_found') {
                        console.warn("Server cold start detected. Keeping local content.");
                        return;
                    }

                    // If we have valid items, update cache and state
                    if (items) {
                        const validItems = items
                            .filter((i: any) => i.content)
                            .map((i: any) => ({
                                ...i.content,
                                duration: i.duration || 10
                            }));

                        // Only update if different to avoid re-renders/flickers
                        if (JSON.stringify(validItems) !== JSON.stringify(content)) {
                            setContent(validItems);
                            localStorage.setItem(`sk_player_content_${pairingCode}`, JSON.stringify(validItems));
                        }
                    }
                } catch (err) {
                    console.error("Network failed, playing from cache", err);
                    // Network error? Do nothing, just keep playing current content.
                }
            };

            fetchContent();
            // Poll for new content every 10 seconds
            const interval = setInterval(fetchContent, 10000);
            return () => clearInterval(interval);
        }
    }, [isPaired, pairingCode, content]);

    // Heartbeat Loop (Runs always, even if no content)
    useEffect(() => {
        if (!isPaired || !pairingCode) return;

        const sendHeartbeat = async () => {
            try {
                const currentItem = content.length > 0 ? content[currentIndex] : null;
                await axios.post(`/api/devices/heartbeat/${pairingCode}`, {
                    currentContent: currentItem
                });
            } catch (err) {
                console.error("Heartbeat failed", err);
            }
        };

        // Send immediately
        sendHeartbeat();

        // Then every 10 seconds
        const interval = setInterval(sendHeartbeat, 10000);
        return () => clearInterval(interval);
    }, [isPaired, pairingCode, content, currentIndex]);

    // Content Rotation Loop
    useEffect(() => {
        if (content.length > 0) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % content.length);
            }, 5000); // Rotate every 5 seconds

            return () => clearInterval(timer);
        }
    }, [content]);

    if (isPaired) {
        return (
            <div className="h-screen bg-black text-white flex items-center justify-center overflow-hidden">
                {content.length > 0 ? (
                    <div className="w-full h-full relative">
                        {content[currentIndex].type === 'image' ? (
                            <img
                                src={content[currentIndex].url}
                                alt={content[currentIndex].title}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <video
                                src={content[currentIndex].url}
                                className="w-full h-full object-contain"
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        )}
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 px-4 py-2 rounded text-sm">
                            {content[currentIndex].title}
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mb-6">
                            <span className="text-blue-500 font-bold text-2xl tracking-widest border-2 border-blue-500 px-4 py-1 rounded">SK GROUPS</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Ready to Play</h1>
                        <p className="text-xl text-gray-400">Device: {deviceName}</p>
                        <p className="mt-4 text-yellow-500">No content scheduled. Upload media in CMS.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-screen bg-blue-900 text-white flex flex-col items-center justify-center relative">
            <div className="absolute top-10 left-10">
                <span className="font-bold text-2xl tracking-widest border-2 border-white px-4 py-1 rounded opacity-80">SK GROUPS</span>
            </div>

            <h1 className="text-5xl font-bold mb-8">Register This Screen</h1>
            <div className="bg-white text-blue-900 px-12 py-6 rounded-2xl text-6xl font-mono font-bold tracking-widest shadow-lg">
                {pairingCode}
            </div>
            <p className="mt-8 text-xl opacity-80">Enter this code in your CMS Dashboard</p>
        </div>
    );
}
