'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EXPENSE_CATEGORIES } from '@/lib/types/database'
import type { Trip, ExpenseCategory } from '@/lib/types/database'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'PHP', 'THB', 'SGD', 'MYR', 'IDR', 'VND', 'KRW', 'CNY', 'HKD', 'TWD', 'INR', 'AED', 'CHF', 'NZD', 'MXN', 'BRL']

type Props = {
  trip: Trip
}

export function AddExpenseForm({ trip }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [converting, setConverting] = useState(false)
  const [conversionError, setConversionError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState<{
    amount: string;
    currency: string;
    category: ExpenseCategory;
    date: string;
    note: string;
    exchange_rate: string;
  }>({
    amount: '',
    currency: trip.base_currency,
    category: EXPENSE_CATEGORIES[0],
    date: today,
    note: '',
    exchange_rate: '1',
  })

  // Auto-convert currency when amount or currency changes
  const fetchExchangeRate = useCallback(async (amount: string, from: string, to: string) => {
    if (!amount || parseFloat(amount) <= 0 || from === to) {
      setFormData(prev => ({ ...prev, exchange_rate: '1' }))
      setConversionError(false)
      return
    }

    setConverting(true)
    setConversionError(false)

    try {
      const response = await fetch('/api/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          from,
          to,
        }),
      })

      if (!response.ok) {
        throw new Error('Conversion failed')
      }

      const data = await response.json()
      setFormData(prev => ({
        ...prev,
        exchange_rate: String(data.exchangeRate),
      }))
    } catch {
      setConversionError(true)
      // Keep previous exchange rate, user can enter manually
    } finally {
      setConverting(false)
    }
  }, [])

  // Debounced effect for auto-conversion
  useEffect(() => {
    if (formData.currency === trip.base_currency) {
      setFormData(prev => ({ ...prev, exchange_rate: '1' }))
      return
    }

    const timer = setTimeout(() => {
      fetchExchangeRate(formData.amount, formData.currency, trip.base_currency)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [formData.amount, formData.currency, trip.base_currency, fetchExchangeRate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to add an expense')
      setLoading(false)
      return
    }

    const amount = parseFloat(formData.amount)
    const exchangeRate = parseFloat(formData.exchange_rate)
    const amountBase = amount * exchangeRate

    const { error: insertError } = await supabase
      .from('expenses')
      .insert({
        trip_id: trip.id,
        amount,
        currency: formData.currency,
        amount_base: amountBase,
        exchange_rate: exchangeRate,
        category: formData.category,
        date: formData.date,
        note: formData.note || null,
        created_by: user.id,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/trips/${trip.id}`)
    router.refresh()
  }

  const showExchangeRate = formData.currency !== trip.base_currency
  const convertedAmount = formData.amount && formData.exchange_rate
    ? (parseFloat(formData.amount) * parseFloat(formData.exchange_rate)).toFixed(2)
    : null

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
            className="mt-1 block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
            placeholder="0.00"
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
            })}
            className="mt-1 block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="flex items-center justify-between">
            <label htmlFor="exchange_rate" className="block text-sm font-medium text-gray-700">
              Exchange Rate
              <span className="text-gray-500 font-normal ml-1">
                (1 {formData.currency} = ? {trip.base_currency})
              </span>
            </label>
            {converting && (
              <span className="text-xs text-blue-600">Fetching rate...</span>
            )}
          </div>
          <input
            id="exchange_rate"
            type="number"
            required
            min="0"
            step="any"
            value={formData.exchange_rate}
            onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
            className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              conversionError ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
            }`}
          />
          {conversionError && (
            <p className="mt-1 text-xs text-yellow-700">
              Auto-conversion failed. Please enter rate manually.
            </p>
          )}
          {convertedAmount && !converting && (
            <p className="mt-1 text-sm text-gray-600">
              = {convertedAmount} {trip.base_currency}
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
          onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
          className="mt-1 block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="mt-1 block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="mt-1 block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
          placeholder="e.g., Lunch at local restaurant"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Link
          href={`/trips/${trip.id}`}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading || converting}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </div>
    </form>
  )
}
