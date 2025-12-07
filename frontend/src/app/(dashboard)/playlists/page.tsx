'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, ListVideo, Trash2 } from 'lucide-react';

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState([]);
    const [contentList, setContentList] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylist, setNewPlaylist] = useState({ name: '', items: [] });
    const [selectedContent, setSelectedContent] = useState<string[]>([]);

    useEffect(() => {
        fetchPlaylists();
        fetchContent();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const res = await axios.get('/api/playlists');
            setPlaylists(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchContent = async () => {
        try {
            const res = await axios.get('/api/content');
            setContentList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async () => {
        try {
            const items = selectedContent.map(id => ({ contentId: id, duration: 10 }));
            await axios.post('/api/playlists', { ...newPlaylist, items });
            setShowCreateModal(false);
            setNewPlaylist({ name: '', items: [] });
            setSelectedContent([]);
            fetchPlaylists();
        } catch (err) {
            alert('Failed to create playlist');
        }
    };

    const toggleContentSelection = (id: string) => {
        if (selectedContent.includes(id)) {
            setSelectedContent(selectedContent.filter(item => item !== id));
        } else {
            setSelectedContent([...selectedContent, id]);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Playlists</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
                >
                    <Plus size={20} />
                    <span>Create Playlist</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {playlists.map((playlist: any) => (
                    <div key={playlist._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <ListVideo size={24} />
                            </div>
                            <span className="text-sm text-gray-500">{playlist.items.length} items</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{playlist.name}</h3>
                        <p className="text-xs text-gray-400 mt-2">Created: {new Date(playlist.createdAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">New Playlist</h2>
                        <input
                            type="text"
                            placeholder="Playlist Name"
                            className="w-full border p-2 rounded mb-4 text-gray-800"
                            value={newPlaylist.name}
                            onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                        />

                        <h3 className="font-medium text-gray-700 mb-2">Select Content</h3>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {contentList.map((item: any) => (
                                <div
                                    key={item._id}
                                    onClick={() => toggleContentSelection(item._id)}
                                    className={`border rounded-lg p-2 cursor-pointer relative ${selectedContent.includes(item._id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                                >
                                    <div className="h-20 bg-gray-100 mb-2 flex items-center justify-center overflow-hidden rounded">
                                        {item.type === 'image' ? (
                                            <img src={item.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs text-gray-400">VIDEO</span>
                                        )}
                                    </div>
                                    <p className="text-xs truncate font-medium text-gray-700">{item.title}</p>
                                    {selectedContent.includes(item._id) && (
                                        <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
