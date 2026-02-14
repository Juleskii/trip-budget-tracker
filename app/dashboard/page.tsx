import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils/format';
import type { Trip, Expense } from '@/lib/types/database';

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0];

    // Fetch all trips
    const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

    const typedTrips = (trips || []) as Trip[];

    // Count active trips (started and not ended)
    const activeTrips = typedTrips.filter((trip) => {
        const started = trip.start_date <= today;
        const notEnded = !trip.end_date || trip.end_date >= today;
        return started && notEnded;
    });

    // Fetch all expenses
    const { data: expenses } = await supabase.from('expenses').select('*');

    const typedExpenses = (expenses || []) as Expense[];

    // Calculate total spent per currency
    const spentByCurrency: Record<string, number> = {};
    for (const trip of typedTrips) {
        const tripExpenses = typedExpenses.filter((e) => e.trip_id === trip.id);
        const tripTotal = tripExpenses.reduce((sum, e) => sum + Number(e.amount_base), 0);
        spentByCurrency[trip.base_currency] =
            (spentByCurrency[trip.base_currency] || 0) + tripTotal;
    }

    // Calculate this month's spending per currency
    const monthlyByCurrency: Record<string, number> = {};
    for (const trip of typedTrips) {
        const monthlyExpenses = typedExpenses.filter(
            (e) => e.trip_id === trip.id && e.date >= startOfMonth
        );
        const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount_base), 0);
        if (monthlyTotal > 0) {
            monthlyByCurrency[trip.base_currency] =
                (monthlyByCurrency[trip.base_currency] || 0) + monthlyTotal;
        }
    }

    // Format currency totals for display
    const formatTotals = (totals: Record<string, number>) => {
        const entries = Object.entries(totals).filter(([, amount]) => amount > 0);
        if (entries.length === 0) return null;
        return entries.map(([currency, amount]) => ({
            currency,
            amount,
            formatted: formatCurrency(amount, currency),
        }));
    };

    const totalSpentFormatted = formatTotals(spentByCurrency);
    const monthlyFormatted = formatTotals(monthlyByCurrency);

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
                    <p className="text-3xl font-bold text-gray-900 mt-2">{activeTrips.length}</p>
                    {typedTrips.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            {typedTrips.length} total trip{typedTrips.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Total Spent</h3>
                    {totalSpentFormatted ? (
                        <div className="mt-2">
                            {totalSpentFormatted.map(({ currency, formatted }) => (
                                <p key={currency} className="text-2xl font-bold text-gray-900">
                                    {formatted}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">This Month</h3>
                    {monthlyFormatted ? (
                        <div className="mt-2">
                            {monthlyFormatted.map(({ currency, formatted }) => (
                                <p key={currency} className="text-2xl font-bold text-gray-900">
                                    {formatted}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/trips/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        + New Trip
                    </Link>
                    {activeTrips.length > 0 && (
                        <Link
                            href={`/trips/${activeTrips[0].id}`}
                            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            View Active Trip
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
