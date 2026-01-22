import { formatDate, formatCurrency } from '../format';

describe('formatDate', () => {
  it('formats ISO date string to readable format', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
  });

  it('formats date with time component', () => {
    expect(formatDate('2024-12-25T10:30:00Z')).toBe('Dec 25, 2024');
  });

  it('handles different months correctly', () => {
    expect(formatDate('2024-06-01')).toBe('Jun 1, 2024');
    expect(formatDate('2024-11-30')).toBe('Nov 30, 2024');
  });
});

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('formats EUR correctly', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });

  it('formats GBP correctly', () => {
    expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
  });

  it('formats JPY without decimals', () => {
    expect(formatCurrency(1234, 'JPY')).toBe('¥1,234');
  });

  it('formats PHP correctly', () => {
    expect(formatCurrency(1234.56, 'PHP')).toBe('₱1,234.56');
  });

  it('defaults to USD when no currency specified', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('handles zero correctly', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('handles negative amounts', () => {
    expect(formatCurrency(-500.5, 'USD')).toBe('-$500.50');
  });

  it('handles large numbers with proper formatting', () => {
    expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
  });
});
