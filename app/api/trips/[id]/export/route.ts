import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Trip, Expense } from '@/lib/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify user has access to this trip
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch trip details
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const typedTrip = trip as Trip;

    // Fetch expenses for this trip
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', id)
      .order('date', { ascending: true });

    if (expensesError) {
      return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }

    const typedExpenses = (expenses || []) as Expense[];

    // Generate CSV content
    const headers = [
      'Date',
      'Category',
      'Amount',
      'Currency',
      'Amount (Base)',
      'Exchange Rate',
      'Note',
    ];

    const rows = typedExpenses.map((expense) => [
      expense.date,
      expense.category,
      expense.amount.toString(),
      expense.currency,
      expense.amount_base.toString(),
      expense.exchange_rate.toString(),
      expense.note ? `"${expense.note.replace(/"/g, '""')}"` : '',
    ]);

    const csvContent = [
      `# Trip: ${typedTrip.name}`,
      `# Base Currency: ${typedTrip.base_currency}`,
      `# Budget: ${typedTrip.total_budget}`,
      `# Exported: ${new Date().toISOString()}`,
      '',
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create filename
    const safeName = typedTrip.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeName}_expenses_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
