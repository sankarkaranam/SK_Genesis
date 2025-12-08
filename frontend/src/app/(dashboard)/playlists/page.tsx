'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, ListVideo, Trash2, Edit2, Check, X, PlaySquare } from 'lucide-react';

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [contentList, setContentList] = useState<any[]>([]);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // State for Create/Edit
    const [editingPlaylist, setEditingPlaylist] = useState<any>(null);
    const [playlistName, setPlaylistName] = useState('');
    const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);

    useEffect(() => {
        fetchPlaylists();
        fetchContent();
    }, []);

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

    const fetchContent = async () => {
        try {
            const res = await axios.get('/api/content');
            const apiContent = res.data;
            const localContent = JSON.parse(localStorage.getItem('sk_demo_content') || '[]');
            const merged = [...apiContent, ...localContent.filter((l: any) => !apiContent.find((a: any) => a._id === l._id))];
            setContentList(merged);
        } catch (err) {
            console.error(err);
            setContentList(JSON.parse(localStorage.getItem('sk_demo_content') || '[]'));
        }
    };

    const handleCreate = async () => {
        if (!playlistName) return alert('Please enter a playlist name');
        try {
            const items = selectedContentIds.map(id => ({ contentId: id, duration: 10 }));
            const payload = { name: playlistName, items };

            const res = await axios.post('/api/playlists', payload);

            // Save to LocalStorage
            const currentLocal = JSON.parse(localStorage.getItem('sk_demo_playlists') || '[]');
            currentLocal.push(res.data);
            localStorage.setItem('sk_demo_playlists', JSON.stringify(currentLocal));

            closeModals();
            fetchPlaylists();
        } catch (err) {
            alert('Failed to create playlist');
        }
    };

    const handleUpdate = async () => {
        if (!editingPlaylist || !playlistName) return;
        try {
            const items = selectedContentIds.map(id => ({ contentId: id, duration: 10 }));
            const updatedPlaylist = { ...editingPlaylist, name: playlistName, items };

            // In a real app: await axios.put(`/api/playlists/${editingPlaylist._id}`, updatedPlaylist);
            // For demo: Update local state and localStorage
            const updatedList = playlists.map(p => p._id === editingPlaylist._id ? updatedPlaylist : p);
            setPlaylists(updatedList);
            localStorage.setItem('sk_demo_playlists', JSON.stringify(updatedList));

            closeModals();
        } catch (err) {
            alert('Failed to update playlist');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this playlist?')) return;
        try {
            // In a real app: await axios.delete(`/api/playlists/${id}`);
            const updatedList = playlists.filter(p => p._id !== id);
            setPlaylists(updatedList);
            localStorage.setItem('sk_demo_playlists', JSON.stringify(updatedList));
        } catch (err) {
            alert('Failed to delete playlist');
        }
    };

    const openCreateModal = () => {
        setPlaylistName('');
        setSelectedContentIds([]);
        setEditingPlaylist(null);
        setShowCreateModal(true);
    };

    const openEditModal = (playlist: any) => {
        setEditingPlaylist(playlist);
        setPlaylistName(playlist.name);
        setSelectedContentIds(playlist.items.map((i: any) => i.contentId));
        setShowEditModal(true);
    };

    const closeModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingPlaylist(null);
        setPlaylistName('');
        setSelectedContentIds([]);
    };

    const toggleContentSelection = (id: string) => {
        if (selectedContentIds.includes(id)) {
            setSelectedContentIds(selectedContentIds.filter(item => item !== id));
        } else {
            setSelectedContentIds([...selectedContentIds, id]);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Playlists</h1>
                    <p className="text-gray-500 mt-1">Organize your content into sequences</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Create Playlist</span>
                </button>
            </div>

            {playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-dashed border-gray-300">
                    <div className="bg-purple-50 p-4 rounded-full mb-4">
                        <ListVideo size={40} className="text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">No playlists yet</h3>
                    <p className="text-gray-500 mb-6">Create your first playlist to start showing content.</p>
                    <button
                        onClick={openCreateModal}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Create Now
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playlists.map((playlist: any) => (
                        <div key={playlist._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                        <ListVideo size={24} />
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => openEditModal(playlist)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(playlist._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-xl text-gray-900 mb-1">{playlist.name}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <PlaySquare size={14} className="mr-1" />
                                        {playlist.items?.length || 0} items
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Mini Preview of items */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex -space-x-2 overflow-hidden">
                                {playlist.items?.slice(0, 5).map((item: any, i: number) => {
                                    // Find content details
                                    const content = contentList.find(c => c._id === item.contentId);
                                    if (!content) return null;
                                    return (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden" title={content.title}>
                                            {content.type === 'image' ? (
                                                <img src={content.url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-800" />
                                            )}
                                        </div>
                                    );
                                })}
                                {(playlist.items?.length || 0) > 5 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium">
                                        +{playlist.items.length - 5}
                                    </div>
                                )}
                                {(playlist.items?.length || 0) === 0 && (
                                    <span className="text-xs text-gray-400 italic">Empty playlist</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                {showEditModal ? 'Edit Playlist' : 'New Playlist'}
                            </h2>
                            <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Playlist Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Morning Menu"
                                    className="w-full border border-gray-200 p-3 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={playlistName}
                                    onChange={(e) => setPlaylistName(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-sm font-medium text-gray-700">Select Content</label>
                                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                                        {selectedContentIds.length} selected
                                    </span>
                                </div>

                                {contentList.length === 0 ? (
                                    <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 mb-2">No media available.</p>
                                        <a href="/content" className="text-blue-600 font-medium hover:underline">Upload some content first</a>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {contentList.map((item: any) => {
                                            const isSelected = selectedContentIds.includes(item._id);
                                            return (
                                                <div
                                                    key={item._id}
                                                    onClick={() => toggleContentSelection(item._id)}
                                                    className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${isSelected ? 'border-blue-500 ring-4 ring-blue-50' : 'border-transparent hover:border-gray-200'}`}
                                                >
                                                    <div className="aspect-video bg-gray-100 relative">
                                                        {item.type === 'image' ? (
                                                            <img src={item.url} className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                                <span className="text-xs text-white font-bold tracking-widest">VIDEO</span>
                                                            </div>
                                                        )}

                                                        {isSelected && (
                                                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                                <div className="bg-blue-500 text-white p-1 rounded-full shadow-sm">
                                                                    <Check size={16} strokeWidth={3} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-2 bg-white">
                                                        <p className={`text-xs font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{item.title}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
                            <button
                                onClick={closeModals}
                                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showEditModal ? handleUpdate : handleCreate}
                                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                            >
                                {showEditModal ? 'Save Changes' : 'Create Playlist'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
