import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { DeleteTripButton } from './components/delete-trip-button'
import { ExpenseList } from './components/expense-list'
import { differenceInDays, parseISO, isAfter, isBefore } from 'date-fns'
import type { Trip, Expense } from '@/lib/types/database'

type Props = {
  params: Promise<{ id: string }>
}

type RunwayMetrics = {
  daysSinceStart: number
  daysRemaining: number | null
  totalTripDays: number | null
  dailyAverage: number
  dailyTarget: number | null
  runwayDays: number | null
  status: 'on_track' | 'over_budget' | 'under_budget' | 'not_started' | 'completed'
  percentThroughTrip: number | null
  percentThroughBudget: number
}

function calculateRunway(
  trip: Trip,
  totalSpent: number,
  remaining: number
): RunwayMetrics {
  const today = new Date()
  const startDate = parseISO(trip.start_date)
  const endDate = trip.end_date ? parseISO(trip.end_date) : null
  const budget = Number(trip.total_budget)

  // Trip hasn't started yet
  if (isBefore(today, startDate)) {
    return {
      daysSinceStart: 0,
      daysRemaining: endDate ? differenceInDays(endDate, startDate) + 1 : null,
      totalTripDays: endDate ? differenceInDays(endDate, startDate) + 1 : null,
      dailyAverage: 0,
      dailyTarget: endDate ? budget / (differenceInDays(endDate, startDate) + 1) : null,
      runwayDays: null,
      status: 'not_started',
      percentThroughTrip: 0,
      percentThroughBudget: 0,
    }
  }

  // Trip has ended
  if (endDate && isAfter(today, endDate)) {
    const totalDays = differenceInDays(endDate, startDate) + 1
    return {
      daysSinceStart: totalDays,
      daysRemaining: 0,
      totalTripDays: totalDays,
      dailyAverage: totalDays > 0 ? totalSpent / totalDays : 0,
      dailyTarget: budget / totalDays,
      runwayDays: 0,
      status: 'completed',
      percentThroughTrip: 100,
      percentThroughBudget: budget > 0 ? (totalSpent / budget) * 100 : 0,
    }
  }

  // Trip is in progress
  const daysSinceStart = differenceInDays(today, startDate) + 1
  const daysRemaining = endDate ? differenceInDays(endDate, today) : null
  const totalTripDays = endDate ? differenceInDays(endDate, startDate) + 1 : null

  const dailyAverage = daysSinceStart > 0 ? totalSpent / daysSinceStart : 0
  const dailyTarget = totalTripDays ? budget / totalTripDays : null

  // Runway: how many days can you go at current spend rate?
  const runwayDays = dailyAverage > 0 ? Math.floor(remaining / dailyAverage) : null

  // Status determination
  let status: RunwayMetrics['status'] = 'on_track'
  if (dailyTarget !== null) {
    if (dailyAverage > dailyTarget * 1.1) {
      status = 'over_budget'
    } else if (dailyAverage < dailyTarget * 0.9) {
      status = 'under_budget'
    }
  } else if (remaining < 0) {
    status = 'over_budget'
  }

  const percentThroughTrip = totalTripDays ? (daysSinceStart / totalTripDays) * 100 : null
  const percentThroughBudget = budget > 0 ? (totalSpent / budget) * 100 : 0

  return {
    daysSinceStart,
    daysRemaining,
    totalTripDays,
    dailyAverage,
    dailyTarget,
    runwayDays,
    status,
    percentThroughTrip,
    percentThroughBudget,
  }
}

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single()

  if (tripError || !trip) {
    notFound()
  }

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', id)
    .order('date', { ascending: false })

  const typedTrip = trip as Trip
  const typedExpenses = (expenses || []) as Expense[]

  const totalSpent = typedExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount_base),
    0
  )
  const remaining = Number(typedTrip.total_budget) - totalSpent
  const percentSpent = typedTrip.total_budget > 0
    ? Math.round((totalSpent / Number(typedTrip.total_budget)) * 100)
    : 0

  const runway = calculateRunway(typedTrip, totalSpent, remaining)

  const statusColors = {
    on_track: 'bg-green-100 text-green-800',
    under_budget: 'bg-blue-100 text-blue-800',
    over_budget: 'bg-red-100 text-red-800',
    not_started: 'bg-gray-100 text-gray-800',
    completed: 'bg-purple-100 text-purple-800',
  }

  const statusLabels = {
    on_track: 'On Track',
    under_budget: 'Under Budget',
    over_budget: 'Over Budget',
    not_started: 'Not Started',
    completed: 'Completed',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/trips"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to trips
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {typedTrip.name}
          </h1>
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

      {/* Budget Overview */}
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
          <p className={`text-2xl font-bold mt-1 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(remaining, typedTrip.base_currency)}
          </p>
        </div>
      </div>

      {/* Runway Dashboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Spending Pace</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[runway.status]}`}>
            {statusLabels[runway.status]}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Daily Average</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {formatCurrency(runway.dailyAverage, typedTrip.base_currency)}
            </p>
            <p className="text-xs text-gray-500 mt-1">per day</p>
          </div>

          {runway.dailyTarget !== null && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Daily Target</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(runway.dailyTarget, typedTrip.base_currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">to stay on budget</p>
            </div>
          )}

          {runway.runwayDays !== null && runway.status !== 'completed' && runway.status !== 'not_started' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Runway</p>
              <p className={`text-xl font-bold mt-1 ${runway.runwayDays < (runway.daysRemaining || 0) ? 'text-red-600' : 'text-green-600'}`}>
                {runway.runwayDays} days
              </p>
              <p className="text-xs text-gray-500 mt-1">at current rate</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Trip Progress</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              Day {runway.daysSinceStart}{runway.totalTripDays ? ` of ${runway.totalTripDays}` : ''}
            </p>
            {runway.daysRemaining !== null && runway.daysRemaining > 0 && (
              <p className="text-xs text-gray-500 mt-1">{runway.daysRemaining} days left</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {runway.percentThroughTrip !== null && runway.status !== 'not_started' && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Trip Progress</span>
              <span>{Math.round(runway.percentThroughTrip)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min(runway.percentThroughTrip, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2 mb-1">
              <span>Budget Used</span>
              <span>{Math.round(runway.percentThroughBudget)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  runway.percentThroughBudget > runway.percentThroughTrip
                    ? 'bg-red-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(runway.percentThroughBudget, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Trip Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-600">Dates</dt>
            <dd className="text-gray-900 mt-1">
              {formatDate(typedTrip.start_date)}
              {typedTrip.end_date ? ` - ${formatDate(typedTrip.end_date)}` : ' (Open-ended)'}
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

      {/* Expenses */}
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
  )
}
