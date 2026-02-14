'use client'

import { formatCurrency } from '@/lib/utils/format'
import { getCategoryColor } from '@/lib/utils/category-colors'
import type { Expense, ExpenseCategory } from '@/lib/types/database'

type Props = {
  expenses: Expense[]
  baseCurrency: string
}

export function CategoryChart({ expenses, baseCurrency }: Props) {
  if (expenses.length === 0) {
    return null
  }

  // Calculate spending by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category as ExpenseCategory
    const amount = Number(expense.amount_base)
    acc[category] = (acc[category] || 0) + amount
    return acc
  }, {} as Record<ExpenseCategory, number>)

  // Convert to array and sort by amount
  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category: category as ExpenseCategory,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)

  const maxAmount = Math.max(...categoryData.map((d) => d.amount))
  const totalSpent = categoryData.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Spending by Category</h2>

      <div className="space-y-4">
        {categoryData.map(({ category, amount }) => {
          const categoryStyle = getCategoryColor(category)
          const percentage = Math.round((amount / totalSpent) * 100)
          const widthPercentage = (amount / maxAmount) * 100

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
                    <span className="mr-1">{categoryStyle.icon}</span>
                    {category}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">{percentage}%</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(amount, baseCurrency)}
                </span>
              </div>

              <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${categoryStyle.bg} opacity-60 transition-all duration-700 ease-out rounded-full`}
                  style={{ width: `${widthPercentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-end pr-3">
                  <span className={`text-xs font-medium ${categoryStyle.text}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalSpent, baseCurrency)}
          </span>
        </div>
      </div>
    </div>
  )
}
