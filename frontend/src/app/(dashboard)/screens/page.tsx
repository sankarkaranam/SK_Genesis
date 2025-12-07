'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Monitor } from 'lucide-react';

export default function ScreensPage() {
    const [devices, setDevices] = useState([]);
    const [showPairModal, setShowPairModal] = useState(false);
    const [pairCode, setPairCode] = useState('');

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<any>(null);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');

    useEffect(() => {
        fetchDevices();
        fetchPlaylists();
    }, []);

    const fetchDevices = async () => {
        try {
            const res = await axios.get('/api/devices');
            setDevices(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPlaylists = async () => {
        try {
            const res = await axios.get('/api/playlists');
            setPlaylists(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePair = async () => {
        try {
            await axios.post('/api/devices/pair', { code: pairCode });
            setShowPairModal(false);
            setPairCode('');
            fetchDevices();
        } catch (err) {
            alert('Pairing failed');
        }
    };

    const openAssignModal = (device: any) => {
        setSelectedDevice(device);
        setSelectedPlaylistId(device.assignedPlaylist || '');
        setShowAssignModal(true);
    };

    const handleAssign = async () => {
        try {
            await axios.post(`/api/devices/assign/${selectedDevice._id}`, { playlistId: selectedPlaylistId });
            setShowAssignModal(false);
            fetchDevices();
        } catch (err) {
            alert('Assignment failed');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Screens</h1>
                <button
                    onClick={() => setShowPairModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                >
                    <Plus size={20} />
                    <span>Add Screen</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {devices.map((device: any) => (
                    <div key={device._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Monitor size={24} />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {device.status}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{device.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">ID: {device.pairingCode}</p>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400 mb-2">Current Playlist</p>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-gray-700">
                                    {(playlists.find((p: any) => p._id === device.assignedPlaylist) as any)?.name || 'None Assigned'}
                                </span>
                                <button
                                    onClick={() => openAssignModal(device)}
                                    className="text-blue-600 text-xs font-medium hover:underline"
                                >
                                    Change
                                </button>
                            </div>

                            {device.currentContent && (
                                <div className="bg-gray-50 rounded p-2 flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                                        {device.currentContent.type === 'image' && (
                                            <img src={device.currentContent.url} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-700 truncate">Now Playing</p>
                                        <p className="text-xs text-gray-500 truncate">{device.currentContent.title}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showPairModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Pair New Screen</h2>
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            className="w-full border p-2 rounded mb-4 text-gray-800"
                            value={pairCode}
                            onChange={(e) => setPairCode(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowPairModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handlePair} className="px-4 py-2 bg-blue-600 text-white rounded">Pair</button>
                        </div>
                    </div>
                </div>
            )}

            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Assign Playlist</h2>
                        <p className="text-sm text-gray-500 mb-4">Select content for <b>{selectedDevice?.name}</b></p>

                        <select
                            className="w-full border p-2 rounded mb-6 text-gray-800"
                            value={selectedPlaylistId}
                            onChange={(e) => setSelectedPlaylistId(e.target.value)}
                        >
                            <option value="">Select a Playlist...</option>
                            {playlists.map((p: any) => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>

                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handleAssign} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
