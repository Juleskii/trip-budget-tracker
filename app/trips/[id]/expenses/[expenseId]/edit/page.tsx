import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditExpenseForm } from './components/edit-expense-form'
import type { Trip, Expense } from '@/lib/types/database'

type Props = {
  params: Promise<{ id: string; expenseId: string }>
}

export default async function EditExpensePage({ params }: Props) {
  const { id, expenseId } = await params
  const supabase = await createClient()

  const [{ data: trip }, { data: expense }] = await Promise.all([
    supabase.from('trips').select('*').eq('id', id).single(),
    supabase.from('expenses').select('*').eq('id', expenseId).single(),
  ])

  if (!trip || !expense) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/trips/${id}/expenses/${expenseId}`}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to expense
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Expense</h1>
        <EditExpenseForm trip={trip as Trip} expense={expense as Expense} />
      </div>
    </div>
  )
}
