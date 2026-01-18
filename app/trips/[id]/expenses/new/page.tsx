import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AddExpenseForm } from './components/add-expense-form'
import type { Trip } from '@/lib/types/database'

type Props = {
  params: Promise<{ id: string }>
}

export default async function AddExpensePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !trip) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/trips/${id}`}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to trip
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Expense</h1>
        <AddExpenseForm trip={trip as Trip} />
      </div>
    </div>
  )
}
