import { format, parseISO } from 'date-fns';

export function formatDate(dateString: string): string {
    return format(parseISO(dateString), 'MMM d, yyyy');
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}
