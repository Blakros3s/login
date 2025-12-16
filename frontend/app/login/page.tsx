'use client';
import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('login/', formData);
            localStorage.setItem('access', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);
            alert(`Welcome back, ${res.data.fullname || res.data.username}!`);
            // Redirect or update state
            router.push('/');
        } catch (err: any) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="glass-panel p-8 w-full max-w-md animate-fade-in-up">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Welcome Back</h2>
                {error && <p className="text-red-400 text-center mb-4 bg-red-500/10 p-2 rounded">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            className="input-field"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">
                        Sign In
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
