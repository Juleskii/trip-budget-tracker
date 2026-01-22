/**
 * @jest-environment node
 */
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

function createRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/currency', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/currency', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns error when required fields are missing', async () => {
    const request = createRequest({ amount: 100 });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });

  it('returns error when amount is negative', async () => {
    const request = createRequest({ amount: -100, from: 'USD', to: 'EUR' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('positive number');
  });

  it('returns rate of 1 for same currency conversion', async () => {
    const request = createRequest({ amount: 100, from: 'USD', to: 'USD' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.convertedAmount).toBe(100);
    expect(data.exchangeRate).toBe(1);
    expect(data.cached).toBe(false);
  });

  it('fetches rate from API and returns converted amount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { EUR: 92.5 } }),
    });

    const request = createRequest({ amount: 100, from: 'USD', to: 'EUR' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.convertedAmount).toBe(92.5);
    expect(data.exchangeRate).toBe(0.925);
    expect(data.cached).toBe(false);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('frankfurter.app'),
      expect.any(Object)
    );
  });

  it('returns cached rate on subsequent requests', async () => {
    // First request - fetches from API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: { GBP: 80 } }),
    });

    const request1 = createRequest({ amount: 100, from: 'USD', to: 'GBP' });
    await POST(request1);

    // Second request - should use cache
    mockFetch.mockClear();
    const request2 = createRequest({ amount: 200, from: 'USD', to: 'GBP' });
    const response = await POST(request2);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.cached).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('handles API 404 error for unsupported currency', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const request = createRequest({ amount: 100, from: 'USD', to: 'XXX' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Unsupported currency pair');
  });

  it('handles API server error gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const request = createRequest({ amount: 100, from: 'USD', to: 'CAD' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to convert');
  });
});
