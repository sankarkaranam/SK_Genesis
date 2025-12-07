import Link from 'next/link';
import { LayoutDashboard, Monitor, Image, ListVideo, Settings } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0">
            <div className="p-6 text-2xl font-bold text-blue-400">
                SK Genesis
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <Link href="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link href="/screens" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
                    <Monitor size={20} />
                    <span>Screens</span>
                </Link>
                <Link href="/content" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
                    <Image size={20} />
                    <span>Content</span>
                </Link>
                <Link href="/playlists" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
                    <ListVideo size={20} />
                    <span>Playlists</span>
                </Link>
            </nav>
            <div className="p-4 border-t border-gray-800">
                <Link href="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
                    <Settings size={20} />
                    <span>Settings</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
