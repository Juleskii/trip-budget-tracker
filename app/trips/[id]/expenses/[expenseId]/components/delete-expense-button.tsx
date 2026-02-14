'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/spinner'
import { showToast } from '@/components/ui/toast'

type Props = {
  tripId: string
  expenseId: string
}

export function DeleteExpenseButton({ tripId, expenseId }: Props) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)

    if (error) {
      showToast('Failed to delete expense: ' + error.message, 'error')
      setLoading(false)
      return
    }

    showToast('Expense deleted successfully', 'success')
    router.push(`/trips/${tripId}`)
    router.refresh()
  }

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors min-h-[44px] inline-flex items-center gap-2"
        >
          {loading && <Spinner className="h-4 w-4" />}
          {loading ? 'Deleting...' : 'Yes'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors min-h-[44px]"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
    >
      Delete
    </button>
  )
}
