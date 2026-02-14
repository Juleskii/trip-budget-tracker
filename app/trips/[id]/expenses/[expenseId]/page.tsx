import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { getCategoryColor } from '@/lib/utils/category-colors'
import { DeleteExpenseButton } from './components/delete-expense-button'
import type { Trip, Expense } from '@/lib/types/database'

type Props = {
  params: Promise<{ id: string; expenseId: string }>
}

export default async function ExpenseDetailPage({ params }: Props) {
  const { id, expenseId } = await params
  const supabase = await createClient()

  const [{ data: trip }, { data: expense }] = await Promise.all([
    supabase.from('trips').select('*').eq('id', id).single(),
    supabase.from('expenses').select('*').eq('id', expenseId).single(),
  ])

  if (!trip || !expense) {
    notFound()
  }

  const typedTrip = trip as Trip
  const typedExpense = expense as Expense
  const categoryStyle = getCategoryColor(typedExpense.category as any)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/trips/${id}`}
          className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors"
        >
          ← Back to trip
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Expense Details</h1>
          <div className="flex items-center space-x-3">
            <Link
              href={`/trips/${id}/expenses/${expenseId}/edit`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Edit
            </Link>
            <DeleteExpenseButton
              tripId={id}
              expenseId={expenseId}
            />
          </div>
        </div>

        <dl className="space-y-5">
          <div className="flex justify-between items-start py-4 border-b border-gray-200">
            <dt className="text-sm font-medium text-gray-600">Amount</dt>
            <dd className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(Number(typedExpense.amount), typedExpense.currency)}
              </div>
              {typedExpense.currency !== typedTrip.base_currency && (
                <div className="text-sm text-gray-500 mt-1">
                  {formatCurrency(Number(typedExpense.amount_base), typedTrip.base_currency)}
                </div>
              )}
            </dd>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <dt className="text-sm font-medium text-gray-600">Category</dt>
            <dd>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
                <span className="mr-1.5">{categoryStyle.icon}</span>
                {typedExpense.category}
              </span>
            </dd>
          </div>

          <div className="flex justify-between py-3 border-b border-gray-200">
            <dt className="text-sm font-medium text-gray-600">Date</dt>
            <dd className="text-sm text-gray-900">{formatDate(typedExpense.date)}</dd>
          </div>

          {typedExpense.currency !== typedTrip.base_currency && (
            <div className="flex justify-between py-3 border-b border-gray-200">
              <dt className="text-sm font-medium text-gray-600">Exchange Rate</dt>
              <dd className="text-sm text-gray-900">
                1 {typedExpense.currency} = {Number(typedExpense.exchange_rate).toFixed(4)} {typedTrip.base_currency}
              </dd>
            </div>
          )}

          {typedExpense.note && (
            <div className="flex justify-between py-3 border-b border-gray-200">
              <dt className="text-sm font-medium text-gray-600">Note</dt>
              <dd className="text-sm text-gray-900">{typedExpense.note}</dd>
            </div>
          )}

          <div className="flex justify-between py-3">
            <dt className="text-sm font-medium text-gray-600">Added</dt>
            <dd className="text-sm text-gray-900">{formatDate(typedExpense.created_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
