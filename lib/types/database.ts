export type Trip = {
    id: string;
    name: string;
    base_currency: string;
    total_budget: number;
    start_date: string;
    end_date: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
};

export type TripInsert = Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export type TripUpdate = Partial<TripInsert>;

export type Expense = {
  id: string
  trip_id: string
  amount: number
  currency: string
  amount_base: number
  exchange_rate: number
  category: string
  date: string
  note: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type ExpenseInsert = Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'created_by'>

export type ExpenseUpdate = Partial<Omit<ExpenseInsert, 'trip_id'>>

export const EXPENSE_CATEGORIES = [
  'Food & Drinks',
  'Transport',
  'Accommodation',
  'Activities',
  'Shopping',
  'Other',
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]
