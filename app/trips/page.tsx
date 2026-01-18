import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/format';
import type { Trip } from '@/lib/types/database';

export default async function TripsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: trips, error } = await supabase
        .from('trips')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
                    <p className="text-gray-600 mt-1">Manage your travel budgets</p>
                </div>
                <Link
                    href="/trips/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600          
  text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                    + New Trip
                </Link>
            </div>

            {error && (
                <div
                    className="bg-red-50 border border-red-200 text-red-700 px-4    
  py-3 rounded-lg"
                >
                    Failed to load trips: {error.message}
                </div>
            )}

            {trips && trips.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-600 mb-4">You haven't created any trips yet.</p>
                    <Link
                        href="/trips/new"
                        className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                        Create your first trip
                    </Link>
                </div>
            )}

            {trips && trips.length > 0 && (
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3       
  gap-6"
                >
                    {(trips as Trip[]).map((trip) => (
                        <Link
                            key={trip.id}
                            href={`/trips/${trip.id}`}
                            className="block bg-white rounded-lg shadow hover:shadow-md    
  transition-shadow"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {trip.name}
                                </h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p>
                                        Budget: {trip.base_currency}
                                        {Number(trip.total_budget).toLocaleString()}
                                    </p>
                                    <p>
                                        {formatDate(trip.start_date)}
                                        {trip.end_date
                                            ? ` - ${formatDate(trip.end_date)}`
                                            : ' (Open-ended '}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
