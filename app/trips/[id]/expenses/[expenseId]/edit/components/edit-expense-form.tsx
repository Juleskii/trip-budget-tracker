'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EXPENSE_CATEGORIES } from '@/lib/types/database'
import type { Trip, Expense } from '@/lib/types/database'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'PHP']

type Props = {
  trip: Trip
  expense: Expense
}

export function EditExpenseForm({ trip, expense }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    amount: String(expense.amount),
    currency: expense.currency,
    category: expense.category,
    date: expense.date,
    note: expense.note || '',
    exchange_rate: String(expense.exchange_rate),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const amount = parseFloat(formData.amount)
    const exchangeRate = parseFloat(formData.exchange_rate)
    const amountBase = amount * exchangeRate

    const { error: updateError } = await supabase
      .from('expenses')
      .update({
        amount,
        currency: formData.currency,
        amount_base: amountBase,
        exchange_rate: exchangeRate,
        category: formData.category,
        date: formData.date,
        note: formData.note || null,
      })
      .eq('id', expense.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push(`/trips/${trip.id}/expenses/${expense.id}`)
    router.refresh()
  }

  const showExchangeRate = formData.currency !== trip.base_currency

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            id="currency"
            value={formData.currency}
            onChange={(e) => setFormData({
              ...formData,
              currency: e.target.value,
              exchange_rate: e.target.value === trip.base_currency ? '1' : formData.exchange_rate
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showExchangeRate && (
        <div>
          <label htmlFor="exchange_rate" className="block text-sm font-medium text-gray-700">
            Exchange Rate <span className="text-gray-500">(1 {formData.currency} = ? {trip.base_currency})</span>
          </label>
          <input
            id="exchange_rate"
            type="number"
            required
            min="0"
            step="0.000001"
            value={formData.exchange_rate}
            onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {formData.amount && formData.exchange_rate && (
            <p className="mt-1 text-sm text-gray-600">
              = {(parseFloat(formData.amount) * parseFloat(formData.exchange_rate)).toFixed(2)} {trip.base_currency}
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          id="date"
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700">
          Note <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="note"
          type="text"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Link
          href={`/trips/${trip.id}/expenses/${expense.id}`}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
