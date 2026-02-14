import type { ExpenseCategory } from '@/lib/types/database'

type CategoryColor = {
  bg: string
  text: string
  icon: string
}

export const categoryColors: Record<ExpenseCategory, CategoryColor> = {
  'Food & Drinks': {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    icon: '🍽️',
  },
  'Transport': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: '🚗',
  },
  'Accommodation': {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    icon: '🏨',
  },
  'Activities': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: '🎯',
  },
  'Shopping': {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    icon: '🛍️',
  },
  'Other': {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: '📝',
  },
}

export function getCategoryColor(category: ExpenseCategory): CategoryColor {
  return categoryColors[category] || categoryColors['Other']
}
