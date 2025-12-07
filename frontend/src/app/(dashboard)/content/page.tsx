'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Image as ImageIcon, Film } from 'lucide-react';

export default function ContentPage() {
    const [contentList, setContentList] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newContent, setNewContent] = useState({ title: '', url: '', type: 'image' });

    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');

    useEffect(() => {
        fetchContent();
        fetchDevices();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await axios.get('/api/content');
            setContentList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDevices = async () => {
        try {
            const res = await axios.get('/api/devices');
            setDevices(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async () => {
        try {
            await axios.post('/api/content', { ...newContent, addToDeviceId: selectedDeviceId });
            setShowUploadModal(false);
            setNewContent({ title: '', url: '', type: 'image' });
            setSelectedDeviceId('');
            fetchContent();
        } catch (err) {
            alert('Upload failed');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Media Library</h1>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                >
                    <Upload size={20} />
                    <span>Upload Media</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {contentList.map((item: any) => (
                    <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                            {item.type === 'image' ? (
                                <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <Film size={40} />
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                            <p className="text-xs text-gray-500 mt-1 uppercase">{item.type}</p>
                        </div>
                    </div>
                ))}
            </div>

            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Upload Media</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Title"
                                className="w-full border p-2 rounded text-gray-800"
                                value={newContent.title}
                                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Image/Video URL"
                                className="w-full border p-2 rounded text-gray-800"
                                value={newContent.url}
                                onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                            />
                            <select
                                className="w-full border p-2 rounded text-gray-800"
                                value={newContent.type}
                                onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>

                            <div className="pt-2 border-t border-gray-100">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Play immediately on (optional):</label>
                                <select
                                    className="w-full border p-2 rounded text-gray-800"
                                    value={selectedDeviceId}
                                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                                >
                                    <option value="">-- Don't play yet --</option>
                                    {devices.map((d: any) => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handleUpload} className="px-4 py-2 bg-blue-600 text-white rounded">Save & Publish</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
