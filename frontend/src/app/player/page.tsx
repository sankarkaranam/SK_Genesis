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
            const fetchContent = async () => {
                try {
                    // Fetch content specifically for this device (based on assigned playlist)
                    const res = await axios.get(`/api/devices/playlist/${pairingCode}`);
                    setContent(res.data.items || []);
                } catch (err) {
                    console.error("Failed to fetch content", err);
                }
            };
            fetchContent();
            // Poll for new content every 10 seconds
            const interval = setInterval(fetchContent, 10000);
            return () => clearInterval(interval);
        }
    }, [isPaired, pairingCode]);

    useEffect(() => {
        if (content.length > 0) {
            // Send heartbeat immediately when content changes
            const sendHeartbeat = async () => {
                try {
                    await axios.post(`/api/devices/heartbeat/${pairingCode}`, {
                        currentContent: content[currentIndex]
                    });
                } catch (err) {
                    console.error("Heartbeat failed", err);
                }
            };
            sendHeartbeat();

            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % content.length);
            }, 5000); // Rotate every 5 seconds

            return () => clearInterval(timer);
        }
    }, [content, currentIndex, pairingCode]);

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
                        <h1 className="text-4xl font-bold mb-4">Ready to Play</h1>
                        <p className="text-xl text-gray-400">Device: {deviceName}</p>
                        <p className="mt-4 text-yellow-500">No content scheduled. Upload media in CMS.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-screen bg-blue-900 text-white flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold mb-8">Register This Screen</h1>
            <div className="bg-white text-blue-900 px-12 py-6 rounded-2xl text-6xl font-mono font-bold tracking-widest shadow-lg">
                {pairingCode}
            </div>
            <p className="mt-8 text-xl opacity-80">Enter this code in your CMS Dashboard</p>
        </div>
    );
}
