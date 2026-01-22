import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { DeleteTripButton } from './components/delete-trip-button';
import { ExpenseList } from './components/expense-list';
import type { Trip, Expense } from '@/lib/types/database';

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/trips" className="text-sm text-gray-600 hover:text-gray-900">
                        ← Back to trips
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">{typedTrip.name}</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <Link
                        href={`/trips/${id}/edit`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Edit
                    </Link>
                    <DeleteTripButton tripId={id} tripName={typedTrip.name} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Total Budget</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(Number(typedTrip.total_budget), typedTrip.base_currency)}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Spent</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(totalSpent, typedTrip.base_currency)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{percentSpent}% of budget</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Remaining</h3>
                    <p
                        className={`text-2xl font-bold mt-1 ${
                            remaining >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {formatCurrency(remaining, typedTrip.base_currency)}
                    </p>
                </div>
            </div>

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

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
                    <Link
                        href={`/trips/${id}/expenses/new`}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                        + Add Expense
                    </Link>
                </div>
                <ExpenseList expenses={typedExpenses} baseCurrency={typedTrip.base_currency} />
            </div>
        </div>
    );
}
