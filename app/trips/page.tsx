import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/format';
import type { Trip, TripWithRole } from '@/lib/types/database';

export default async function TripsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Fetch trips created by the user (owned)
    const { data: ownedTrips, error } = await supabase
        .from('trips')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false });

    // Fetch trips shared with the user (via trip_users)
    const { data: sharedTripIds } = await supabase
        .from('trip_users')
        .select('trip_id')
        .eq('user_id', user!.id)
        .eq('role', 'member');

    let sharedTrips: Trip[] = [];
    if (sharedTripIds && sharedTripIds.length > 0) {
        const ids = sharedTripIds.map((t) => t.trip_id);
        const { data } = await supabase
            .from('trips')
            .select('*')
            .in('id', ids)
            .order('created_at', { ascending: false });
        sharedTrips = (data || []) as Trip[];
    }

    // Combine and mark trips with their role
    const allTrips: TripWithRole[] = [
        ...((ownedTrips || []) as Trip[]).map((t) => ({ ...t, role: 'owner' as const })),
        ...sharedTrips.map((t) => ({ ...t, role: 'member' as const })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const trips = allTrips;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
                    <p className="text-gray-600 mt-1">Manage your travel budgets</p>
                </div>
                <Link
                    href="/trips/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
                    <p className="text-gray-600 mb-4">You haven&apos;t created any trips yet.</p>
                    <Link
                        href="/trips/new"
                        className="text-blue-600 hover:text-blue-500 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded transition-colors"
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
                    {trips.map((trip) => (
                        <Link
                            key={trip.id}
                            href={`/trips/${trip.id}`}
                            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {trip.name}
                                    </h3>
                                    {trip.role === 'member' && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                            Shared
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p>
                                        Budget: {trip.base_currency}
                                        {Number(trip.total_budget).toLocaleString()}
                                    </p>
                                    <p>
                                        {formatDate(trip.start_date)}
                                        {trip.end_date
                                            ? ` - ${formatDate(trip.end_date)}`
                                            : ' (Open-ended)'}
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
