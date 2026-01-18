'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function DashboardNav({ user }: { user: User }) {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center space-x-8">
                        <Link
                            href="/dashboard"
                            className="text-xl font-bold             
  text-gray-900"
                        >
                            Trip Budget
                        </Link>
                        <div className="hidden sm:flex space-x-4">
                            <Link
                                href="/dashboard"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2       
  text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/trips"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2       
  text-sm font-medium"
                            >
                                My Trips
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-600 hover:text-gray-900           
  font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
