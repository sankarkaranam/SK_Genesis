'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarClock, Plus, Trash2, Save, X, Clock } from 'lucide-react';

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [slots, setSlots] = useState<{ startTime: string; endTime: string; playlistId: string }[]>([
        { startTime: '09:00', endTime: '12:00', playlistId: '' }
    ]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [schedRes, playRes] = await Promise.all([
                axios.get('/api/schedules').catch(() => ({ data: [] })), // Fallback if API doesn't exist yet
                axios.get('/api/playlists')
            ]);

            // Load from LocalStorage for Demo Persistence
            const localSchedules = JSON.parse(localStorage.getItem('sk_demo_schedules') || '[]');
            setSchedules(localSchedules);
            setPlaylists(playRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!name) return alert('Please enter a schedule name');

        const newSchedule = {
            _id: Math.random().toString(36).substr(2, 9),
            name,
            slots,
            createdAt: new Date()
        };

        // Save to LocalStorage
        const updated = [...schedules, newSchedule];
        setSchedules(updated);
        localStorage.setItem('sk_demo_schedules', JSON.stringify(updated));

        // Sync to Server
        await axios.post('/api/sync', {
            action: 'sync_dashboard',
            data: { schedules: updated }
        });

        setShowModal(false);
        setName('');
        setSlots([{ startTime: '09:00', endTime: '12:00', playlistId: '' }]);
    };

    const addSlot = () => {
        setSlots([...slots, { startTime: '12:00', endTime: '17:00', playlistId: '' }]);
    };

    const removeSlot = (index: number) => {
        const newSlots = [...slots];
        newSlots.splice(index, 1);
        setSlots(newSlots);
    };

    const updateSlot = (index: number, field: string, value: string) => {
        const newSlots = [...slots];
        (newSlots[index] as any)[field] = value;
        setSlots(newSlots);
    };

    const handleDelete = (id: string) => {
        if (!confirm('Delete this schedule?')) return;
        const updated = schedules.filter(s => s._id !== id);
        setSchedules(updated);
        localStorage.setItem('sk_demo_schedules', JSON.stringify(updated));

        axios.post('/api/sync', {
            action: 'sync_dashboard',
            data: { schedules: updated }
        });
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Schedules</h1>
                    <p className="text-gray-500 mt-1">Automate your content playback</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Create Schedule</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.map((schedule) => (
                    <div key={schedule._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <CalendarClock size={24} />
                            </div>
                            <button onClick={() => handleDelete(schedule._id)} className="text-gray-400 hover:text-red-500">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{schedule.name}</h3>
                        <div className="space-y-2">
                            {schedule.slots.map((slot: any, i: number) => (
                                <div key={i} className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                    <Clock size={14} className="mr-2 text-gray-400" />
                                    <span className="font-mono font-medium">{slot.startTime} - {slot.endTime}</span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span className="truncate flex-1">
                                        {playlists.find(p => p._id === slot.playlistId)?.name || 'Unknown Playlist'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">New Schedule</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g., Weekday Standard"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-gray-700">Time Slots</label>
                                    <button onClick={addSlot} className="text-blue-600 text-sm font-bold hover:underline">+ Add Slot</button>
                                </div>
                                {slots.map((slot, i) => (
                                    <div key={i} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <input
                                            type="time"
                                            className="bg-white border border-gray-200 rounded-lg p-2 text-sm"
                                            value={slot.startTime}
                                            onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="time"
                                            className="bg-white border border-gray-200 rounded-lg p-2 text-sm"
                                            value={slot.endTime}
                                            onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
                                        />
                                        <select
                                            className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-sm"
                                            value={slot.playlistId}
                                            onChange={(e) => updateSlot(i, 'playlistId', e.target.value)}
                                        >
                                            <option value="">Select Playlist...</option>
                                            {playlists.map(p => (
                                                <option key={p._id} value={p._id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => removeSlot(i)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex justify-center items-center space-x-2"
                            >
                                <Save size={20} />
                                <span>Save Schedule</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
