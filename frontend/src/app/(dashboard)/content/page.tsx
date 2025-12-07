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

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    className="hidden"
                                    id="file-upload"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setNewContent({
                                                    ...newContent,
                                                    url: reader.result as string,
                                                    type: file.type.startsWith('video') ? 'video' : 'image',
                                                    title: newContent.title || file.name
                                                });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                    <Upload size={32} className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">Click to upload file</span>
                                    <span className="text-xs text-gray-400 mt-1">(Max 5MB for demo)</span>
                                </label>
                            </div>

                            {newContent.url && (
                                <div className="mt-2">
                                    <p className="text-xs text-green-600 font-medium">File selected!</p>
                                    {newContent.type === 'image' && (
                                        <img src={newContent.url} alt="Preview" className="h-20 w-auto mt-2 rounded border" />
                                    )}
                                </div>
                            )}

                            <select
                                className="w-full border p-2 rounded text-gray-800"
                                value={newContent.type}
                                onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                                disabled
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
