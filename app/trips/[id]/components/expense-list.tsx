import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import type { Expense } from '@/lib/types/database'

type Props = {
  expenses: Expense[]
  baseCurrency: string
}

export function ExpenseList({ expenses, baseCurrency }: Props) {
  if (expenses.length === 0) {
    return (
      <p className="text-gray-600 text-center py-8">
        No expenses yet. Add your first expense to start tracking!
      </p>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {expenses.map((expense) => (
        <Link
          key={expense.id}
          href={`/trips/${expense.trip_id}/expenses/${expense.id}`}
          className="block py-4 hover:bg-gray-50 -mx-6 px-6 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {expense.category}
                </span>
                <span className="text-sm text-gray-600">
                  {formatDate(expense.date)}
                </span>
              </div>
              {expense.note && (
                <p className="mt-1 text-sm text-gray-600 truncate">
                  {expense.note}
                </p>
              )}
            </div>
            <div className="ml-4 text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(Number(expense.amount_base), baseCurrency)}
              </p>
              {expense.currency !== baseCurrency && (
                <p className="text-xs text-gray-500">
                  {formatCurrency(Number(expense.amount), expense.currency)}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
