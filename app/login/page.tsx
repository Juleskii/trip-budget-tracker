'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push(redirectTo);
        router.refresh();
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-50 
  px-4"
        >
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
                    <p className="mt-2 text-gray-600">Sign in to your Trip Budget Tracker</p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    {error && (
                        <div
                            className="bg-red-50 border border-red-200 text-red-700 px-4
   py-3 rounded-lg"
                        >
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium    
  text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium 
  text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border         
  border-transparent rounded-lg shadow-sm text-sm font-medium text-white       
  bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2                
  focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50                  
  disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                        href="/signup"
                        className="font-medium text-blue-600          
  hover:text-blue-500"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
