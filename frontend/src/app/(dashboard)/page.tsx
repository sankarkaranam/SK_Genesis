export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Screens</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">12</p>
          <div className="mt-4 flex items-center text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-green-600 font-medium">8 Online</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Active Playlists</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">4</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Content</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">156</p>
        </div>
      </div>
    </div>
  );
}
