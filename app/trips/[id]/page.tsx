import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { DeleteTripButton } from './components/delete-trip-button';
import { ExpenseList } from './components/expense-list';
import { TripMembers } from './components/trip-members';
import type { Trip, Expense, TripUser } from '@/lib/types/database';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function TripDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

    if (tripError || !trip) {
        notFound();
    }

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Fetch trip members with their profile emails
    const { data: tripUsers } = await supabase
        .from('trip_users')
        .select('user_id, role, profiles(email)')
        .eq('trip_id', id);

    const members = (tripUsers || []).map((tu) => {
        const profile = tu.profiles as { email: string } | { email: string }[] | null;
        const email = Array.isArray(profile) ? profile[0]?.email : profile?.email;
        return {
            user_id: tu.user_id,
            role: tu.role as 'owner' | 'member',
            email,
        };
    });
    const isOwner = user?.id === trip.created_by;
    const currentUserId = user?.id || '';

    const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', id)
        .order('date', { ascending: false });

    const typedTrip = trip as Trip;
    const typedExpenses = (expenses || []) as Expense[];

    const totalSpent = typedExpenses.reduce((sum, expense) => sum + Number(expense.amount_base), 0);
    const remaining = Number(typedTrip.total_budget) - totalSpent;
    const percentSpent =
        typedTrip.total_budget > 0
            ? Math.round((totalSpent / Number(typedTrip.total_budget)) * 100)
            : 0;

    // Runway calculations
    const today = new Date();
    const startDate = new Date(typedTrip.start_date);
    const endDate = typedTrip.end_date ? new Date(typedTrip.end_date) : null;

    // Calculate days elapsed (at least 1 to avoid division by zero)
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysElapsed = Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / msPerDay));

    // Daily burn rate
    const dailyBurnRate = totalSpent / daysElapsed;

    // Days remaining at current burn rate
    const daysRemaining = dailyBurnRate > 0 ? Math.floor(remaining / dailyBurnRate) : null;

    // Projected end date (when budget runs out)
    const projectedEndDate =
        daysRemaining !== null && daysRemaining > 0
            ? new Date(today.getTime() + daysRemaining * msPerDay)
            : null;

    // Determine if trip has started
    const tripStarted = today >= startDate;

    // On-track calculation (only if trip has an end date)
    let runwayStatus: 'on-track' | 'at-risk' | 'over-budget' | 'no-spending' = 'no-spending';
    if (totalSpent > 0 && tripStarted) {
        if (remaining <= 0) {
            runwayStatus = 'over-budget';
        } else if (endDate && projectedEndDate) {
            runwayStatus = projectedEndDate >= endDate ? 'on-track' : 'at-risk';
        } else if (daysRemaining !== null && daysRemaining > 0) {
            runwayStatus = 'on-track';
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/trips" className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors">
                        ← Back to trips
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">{typedTrip.name}</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <Link
                        href={`/trips/${id}/edit`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        Edit
                    </Link>
                    <DeleteTripButton tripId={id} tripName={typedTrip.name} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-400 text-xl">💰</span>
                        <h3 className="text-sm font-medium text-gray-600">Total Budget</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(Number(typedTrip.total_budget), typedTrip.base_currency)}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-400 text-xl">📊</span>
                        <h3 className="text-sm font-medium text-gray-600">Spent</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(totalSpent, typedTrip.base_currency)}
                    </p>
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">{percentSpent}% of budget</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    percentSpent >= 90
                                        ? 'bg-red-500'
                                        : percentSpent >= 75
                                          ? 'bg-amber-500'
                                          : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(percentSpent, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-400 text-xl">
                            {remaining >= 0 ? '✅' : '⚠️'}
                        </span>
                        <h3 className="text-sm font-medium text-gray-600">Remaining</h3>
                    </div>
                    <p
                        className={`text-3xl font-bold ${
                            remaining >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {formatCurrency(remaining, typedTrip.base_currency)}
                    </p>
                </div>
            </div>

            {/* Runway Projections */}
            {tripStarted && (
                <div
                    className={`rounded-lg shadow p-6 ${
                        runwayStatus === 'over-budget'
                            ? 'bg-red-50 border border-red-200'
                            : runwayStatus === 'at-risk'
                              ? 'bg-amber-50 border border-amber-200'
                              : runwayStatus === 'on-track'
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-white'
                    }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Budget Runway</h2>
                        {runwayStatus !== 'no-spending' && (
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    runwayStatus === 'over-budget'
                                        ? 'bg-red-100 text-red-800'
                                        : runwayStatus === 'at-risk'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-green-100 text-green-800'
                                }`}
                            >
                                {runwayStatus === 'over-budget'
                                    ? 'Over Budget'
                                    : runwayStatus === 'at-risk'
                                      ? 'At Risk'
                                      : 'On Track'}
                            </span>
                        )}
                    </div>

                    {totalSpent === 0 ? (
                        <p className="text-gray-600">
                            Add expenses to see your budget runway projections.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-600">Daily Burn Rate</dt>
                                <dd className="text-xl font-semibold text-gray-900 mt-1">
                                    {formatCurrency(dailyBurnRate, typedTrip.base_currency)}
                                    <span className="text-sm font-normal text-gray-500">/day</span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-600">Days Remaining</dt>
                                <dd
                                    className={`text-xl font-semibold mt-1 ${
                                        daysRemaining === null || daysRemaining <= 0
                                            ? 'text-red-600'
                                            : daysRemaining <= 7
                                              ? 'text-amber-600'
                                              : 'text-gray-900'
                                    }`}
                                >
                                    {daysRemaining === null || daysRemaining <= 0
                                        ? '0 days'
                                        : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-600">
                                    Budget Lasts Until
                                </dt>
                                <dd className="text-xl font-semibold text-gray-900 mt-1">
                                    {projectedEndDate
                                        ? formatDate(projectedEndDate.toISOString())
                                        : 'Budget depleted'}
                                </dd>
                            </div>
                        </div>
                    )}

                    {endDate && totalSpent > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                {runwayStatus === 'on-track' ? (
                                    <>
                                        At your current pace, your budget will last{' '}
                                        <strong>
                                            {projectedEndDate &&
                                                Math.ceil(
                                                    (projectedEndDate.getTime() - endDate.getTime()) /
                                                        msPerDay
                                                )}{' '}
                                            days past
                                        </strong>{' '}
                                        your trip end date.
                                    </>
                                ) : runwayStatus === 'at-risk' ? (
                                    <>
                                        At your current pace, you will run out of budget{' '}
                                        <strong>
                                            {projectedEndDate &&
                                                Math.ceil(
                                                    (endDate.getTime() - projectedEndDate.getTime()) /
                                                        msPerDay
                                                )}{' '}
                                            days before
                                        </strong>{' '}
                                        your trip ends on {formatDate(typedTrip.end_date!)}.
                                    </>
                                ) : runwayStatus === 'over-budget' ? (
                                    <>
                                        You have exceeded your budget by{' '}
                                        <strong>
                                            {formatCurrency(Math.abs(remaining), typedTrip.base_currency)}
                                        </strong>
                                        .
                                    </>
                                ) : null}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-gray-600">Dates</dt>
                        <dd className="text-gray-900 mt-1">
                            {formatDate(typedTrip.start_date)}
                            {typedTrip.end_date
                                ? ` - ${formatDate(typedTrip.end_date)}`
                                : ' (Open-ended)'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-600">Currency</dt>
                        <dd className="text-gray-900 mt-1">{typedTrip.base_currency}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-600">Created</dt>
                        <dd className="text-gray-900 mt-1">{formatDate(typedTrip.created_at)}</dd>
                    </div>
                </dl>
            </div>

            <TripMembers
                tripId={id}
                members={members}
                currentUserId={currentUserId}
                isOwner={isOwner}
            />

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
                    <div className="flex items-center gap-2">
                        {typedExpenses.length > 0 && (
                            <a
                                href={`/api/trips/${id}/export`}
                                download
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Export CSV
                            </a>
                        )}
                        <Link
                            href={`/trips/${id}/expenses/new`}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            + Add Expense
                        </Link>
                    </div>
                </div>
                <ExpenseList expenses={typedExpenses} baseCurrency={typedTrip.base_currency} />
            </div>
        </div>
    );
}
