import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Active Trips</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Total Spent</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">$0.00</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">This Month</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">$0.00</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <a
                        href="/trips/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600        
  text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                        + New Trip
                    </a>
                </div>
            </div>
        </div>
    );
}
