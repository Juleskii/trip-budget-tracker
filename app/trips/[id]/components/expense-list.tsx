import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { getCategoryColor } from '@/lib/utils/category-colors'
import type { Expense } from '@/lib/types/database'

type Props = {
  expenses: Expense[]
  baseCurrency: string
}

export function ExpenseList({ expenses, baseCurrency }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">💸</div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No expenses yet. Add your first expense to start tracking!
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {expenses.map((expense) => {
        const categoryStyle = getCategoryColor(expense.category as any)

        return (
          <Link
            key={expense.id}
            href={`/trips/${expense.trip_id}/expenses/${expense.id}`}
            className="block py-4 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 -mx-6 px-6 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
                    <span className="mr-1.5">{categoryStyle.icon}</span>
                    {expense.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(expense.date)}
                  </span>
                </div>
                {expense.note && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate mt-1 pl-1">
                    {expense.note}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(Number(expense.amount_base), baseCurrency)}
                </p>
                {expense.currency !== baseCurrency && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatCurrency(Number(expense.amount), expense.currency)}
                  </p>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
