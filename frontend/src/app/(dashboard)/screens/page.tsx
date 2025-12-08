'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Monitor, Trash2, Edit2, X, Check, RefreshCw } from 'lucide-react';

export default function ScreensPage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [playlists, setPlaylists] = useState<any[]>([]);

    // Modals
    const [showPairModal, setShowPairModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // State
    const [pairCode, setPairCode] = useState('');
    const [selectedDevice, setSelectedDevice] = useState<any>(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchDevices();
        fetchPlaylists();
    }, []);

    const fetchDevices = async () => {
        try {
            const res = await axios.get('/api/devices');
            const apiDevices = res.data;
            const localDevices = JSON.parse(localStorage.getItem('sk_demo_devices') || '[]');

            // Merge unique devices by ID
            const merged = [...apiDevices, ...localDevices.filter((l: any) => !apiDevices.find((a: any) => a._id === l._id))];
            setDevices(merged);
        } catch (err) {
            console.error(err);
            setDevices(JSON.parse(localStorage.getItem('sk_demo_devices') || '[]'));
        }
    };

    const fetchPlaylists = async () => {
        try {
            const res = await axios.get('/api/playlists');
            const apiPlaylists = res.data;
            const localPlaylists = JSON.parse(localStorage.getItem('sk_demo_playlists') || '[]');
            const merged = [...apiPlaylists, ...localPlaylists.filter((l: any) => !apiPlaylists.find((a: any) => a._id === l._id))];
            setPlaylists(merged);
        } catch (err) {
            console.error(err);
            setPlaylists(JSON.parse(localStorage.getItem('sk_demo_playlists') || '[]'));
        }
    };

    const handlePair = async () => {
        if (!pairCode) return alert('Please enter a 6-digit code');
        try {
            const res = await axios.post('/api/devices/pair', { code: pairCode });

            // Save to LocalStorage
            const currentLocal = JSON.parse(localStorage.getItem('sk_demo_devices') || '[]');
            if (!currentLocal.find((d: any) => d._id === res.data._id)) {
                currentLocal.push(res.data);
                localStorage.setItem('sk_demo_devices', JSON.stringify(currentLocal));
            }

            setShowPairModal(false);
            setPairCode('');
            fetchDevices();
        } catch (err) {
            alert('Pairing failed. Please check the code.');
        }
    };

    const handleAssign = async () => {
        if (!selectedDevice) return;
        try {
            // Optimistic update
            const updatedDevices = devices.map((d: any) =>
                d._id === selectedDevice._id ? { ...d, assignedPlaylist: selectedPlaylistId } : d
            );
            setDevices(updatedDevices);
            localStorage.setItem('sk_demo_devices', JSON.stringify(updatedDevices));

            // Try API
            await axios.post(`/api/devices/assign/${selectedDevice._id}`, { playlistId: selectedPlaylistId });

            setShowAssignModal(false);
        } catch (err) {
            console.error('API Assignment failed, but saved locally');
            setShowAssignModal(false);
        }
    };

    const handleRename = async () => {
        if (!selectedDevice || !editName) return;
        try {
            // Optimistic update
            const updatedDevices = devices.map((d: any) =>
                d._id === selectedDevice._id ? { ...d, name: editName } : d
            );
            setDevices(updatedDevices);
            localStorage.setItem('sk_demo_devices', JSON.stringify(updatedDevices));

            // In real app: await axios.put(...)

            setShowEditModal(false);
        } catch (err) {
            alert('Rename failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this screen? It will need to be re-paired.')) return;
        try {
            const updatedDevices = devices.filter(d => d._id !== id);
            setDevices(updatedDevices);
            localStorage.setItem('sk_demo_devices', JSON.stringify(updatedDevices));
            // In real app: await axios.delete(...)
        } catch (err) {
            alert('Delete failed');
        }
    };

    const openAssignModal = (device: any) => {
        setSelectedDevice(device);
        setSelectedPlaylistId(device.assignedPlaylist || '');
        setShowAssignModal(true);
    };

    const openEditModal = (device: any) => {
        setSelectedDevice(device);
        setEditName(device.name);
        setShowEditModal(true);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Screens</h1>
                    <p className="text-gray-500 mt-1">Manage your connected displays</p>
                </div>
                <button
                    onClick={() => setShowPairModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add Screen</span>
                </button>
            </div>

            {devices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-dashed border-gray-300">
                    <div className="bg-blue-50 p-4 rounded-full mb-4">
                        <Monitor size={40} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">No screens connected</h3>
                    <p className="text-gray-500 mb-6">Pair a device to start managing content.</p>
                    <button
                        onClick={() => setShowPairModal(true)}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Pair Screen
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device: any) => (
                        <div key={device._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <Monitor size={24} />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {device.status}
                                        </span>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(device)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(device._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="font-bold text-xl text-gray-900 mb-1">{device.name}</h3>
                                <p className="text-sm text-gray-400 font-mono">Code: {device.pairingCode}</p>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Playlist</p>
                                        <button
                                            onClick={() => openAssignModal(device)}
                                            className="text-blue-600 text-xs font-bold hover:underline flex items-center"
                                        >
                                            <RefreshCw size={12} className="mr-1" />
                                            Change
                                        </button>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                                        <span className="text-sm font-medium text-gray-800 block truncate">
                                            {(playlists.find((p: any) => p._id === device.assignedPlaylist) as any)?.name || 'None Assigned'}
                                        </span>
                                    </div>

                                    {device.currentContent && (
                                        <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                                                {device.currentContent.type === 'image' && (
                                                    <img src={device.currentContent.url} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-0.5">Now Playing</p>
                                                <p className="text-xs text-gray-600 truncate font-medium">{device.currentContent.title}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pair Modal */}
            {showPairModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Pair New Screen</h2>
                            <button onClick={() => setShowPairModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pairing Code</label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                className="w-full border border-gray-200 p-3 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-widest font-mono uppercase"
                                value={pairCode}
                                onChange={(e) => setPairCode(e.target.value)}
                                maxLength={6}
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">Enter the code displayed on your TV/Display</p>

                            <button
                                onClick={handlePair}
                                className="w-full mt-6 bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                Pair Screen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Assign Playlist</h2>
                            <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 mb-4">Select content for <b className="text-gray-800">{selectedDevice?.name}</b></p>

                            <select
                                className="w-full border border-gray-200 p-3 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={selectedPlaylistId}
                                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                            >
                                <option value="">-- Select a Playlist --</option>
                                {playlists.map((p: any) => (
                                    <option key={p._id} value={p._id}>{p.name} ({p.items?.length || 0} items)</option>
                                ))}
                            </select>

                            <button
                                onClick={handleAssign}
                                className="w-full mt-6 bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                Save Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Rename Screen</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Screen Name</label>
                            <input
                                type="text"
                                className="w-full border border-gray-200 p-3 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />

                            <button
                                onClick={handleRename}
                                className="w-full mt-6 bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
