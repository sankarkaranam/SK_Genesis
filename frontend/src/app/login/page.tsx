'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                setError('Invalid password');
            }
        } catch (err) {
            setError('Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">SK Genesis</h1>
                    <p className="text-sm text-gray-500">Enter password to access dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border p-3 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
