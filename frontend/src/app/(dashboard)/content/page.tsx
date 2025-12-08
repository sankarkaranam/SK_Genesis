'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Play, Trash2, Edit2, MoreVertical, Image as ImageIcon, Film, X } from 'lucide-react';

export default function ContentPage() {
    const [contentList, setContentList] = useState<any[]>([]);
    const [devices, setDevices] = useState<any[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingContent, setEditingContent] = useState<any>(null);

    const [newContent, setNewContent] = useState({ title: '', url: '', type: 'image' });
    const [selectedDeviceId, setSelectedDeviceId] = useState('');

    useEffect(() => {
        fetchContent();
        fetchDevices();
    }, []);

    const fetchContent = async () => {
        try {
            // Hybrid: Try to get from API, fallback/merge with LocalStorage for demo stability
            const res = await axios.get('/api/content');
            const apiContent = res.data;

            const localContent = JSON.parse(localStorage.getItem('sk_demo_content') || '[]');

            // Merge unique items by ID
            const merged = [...apiContent, ...localContent.filter((l: any) => !apiContent.find((a: any) => a._id === l._id))];
            setContentList(merged);
        } catch (err) {
            console.error(err);
            // Fallback to local only
            setContentList(JSON.parse(localStorage.getItem('sk_demo_content') || '[]'));
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
            const payload = { ...newContent, addToDeviceId: selectedDeviceId };

            // 1. Save to API
            const res = await axios.post('/api/content', payload);

            // 2. Save to LocalStorage (Backup for Vercel Demo)
            const currentLocal = JSON.parse(localStorage.getItem('sk_demo_content') || '[]');
            currentLocal.push(res.data);
            localStorage.setItem('sk_demo_content', JSON.stringify(currentLocal));

            setShowUploadModal(false);
            setNewContent({ title: '', url: '', type: 'image' });
            setSelectedDeviceId('');
            fetchContent();
        } catch (err) {
            console.error(err);
            alert('Upload failed. Please try again.');
        }
    };

    const handleEdit = async () => {
        if (!editingContent) return;
        try {
            // In a real app, PUT /api/content/:id
            // For demo, we update local state and localStorage
            const updatedList = contentList.map(item =>
                item._id === editingContent._id ? editingContent : item
            );
            setContentList(updatedList);
            localStorage.setItem('sk_demo_content', JSON.stringify(updatedList));

            setShowEditModal(false);
            setEditingContent(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this media?')) return;
        try {
            // In a real app, DELETE /api/content/:id
            const updatedList = contentList.filter(item => item._id !== id);
            setContentList(updatedList);
            localStorage.setItem('sk_demo_content', JSON.stringify(updatedList));
        } catch (err) {
            console.error(err);
        }
    };

    const openEditModal = (item: any) => {
        setEditingContent({ ...item });
        setShowEditModal(true);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Media Library</h1>
                    <p className="text-gray-500 mt-1">Manage your images and videos</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all flex items-center space-x-2"
                >
                    <Upload size={20} />
                    <span>Upload Media</span>
                </button>
            </div>

            {contentList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-dashed border-gray-300">
                    <div className="bg-blue-50 p-4 rounded-full mb-4">
                        <ImageIcon size={40} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">No media yet</h3>
                    <p className="text-gray-500 mb-6">Upload your first image or video to get started.</p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Upload Now
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {contentList.map((item) => (
                        <div key={item._id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                            {/* Image Thumbnail */}
                            <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                                {item.type === 'image' ? (
                                    <img src={item.url} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        <video src={item.url} className="w-full h-full object-cover opacity-60" />
                                        <Play size={40} className="text-white absolute z-10" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                                    {item.type}
                                </div>
                            </div>

                            {/* Content Info */}
                            <div className="p-5">
                                <h3 className="font-bold text-gray-800 truncate mb-1">{item.title}</h3>
                                <p className="text-xs text-gray-400">Added just now</p>

                                {/* Actions */}
                                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
                                    >
                                        <Edit2 size={16} />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Upload Media</h2>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Summer Campaign"
                                    className="w-full border border-gray-200 p-3 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={newContent.title}
                                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Media File</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group">
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
                                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full">
                                        <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-white transition-colors">
                                            <Upload size={24} className="text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Click to upload</span>
                                        <span className="text-xs text-gray-400 mt-1">JPG, PNG, MP4 (Max 5MB)</span>
                                    </label>
                                </div>
                            </div>

                            {newContent.url && (
                                <div className="bg-gray-50 p-3 rounded-lg flex items-center space-x-3">
                                    <div className="h-12 w-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                        {newContent.type === 'image' ? (
                                            <img src={newContent.url} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gray-800"><Film size={16} className="text-white" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">Ready to upload</p>
                                        <p className="text-xs text-gray-500 uppercase">{newContent.type}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Play immediately on (Optional)</label>
                                <select
                                    className="w-full border border-gray-200 p-3 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={selectedDeviceId}
                                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                                >
                                    <option value="">-- Don't play yet --</option>
                                    {devices.map(d => (
                                        <option key={d._id} value={d._id}>{d.name} ({d.status})</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!newContent.url}
                                className="w-full bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                Save & Publish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingContent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Edit Media</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 p-3 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editingContent.title}
                                    onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleEdit}
                                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
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
