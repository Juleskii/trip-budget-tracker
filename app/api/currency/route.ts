import { NextRequest, NextResponse } from 'next/server'

type ConversionRequest = {
  amount: number
  from: string
  to: string
}

type CacheEntry = {
  rate: number
  timestamp: number
}

// In-memory cache for exchange rates (persists during server runtime)
const rateCache = new Map<string, CacheEntry>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

function getCacheKey(from: string, to: string): string {
  return `${from}-${to}`
}

function getCachedRate(from: string, to: string): number | null {
  const key = getCacheKey(from, to)
  const entry = rateCache.get(key)

  if (!entry) return null

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL
  if (isExpired) {
    rateCache.delete(key)
    return null
  }

  return entry.rate
}

function setCachedRate(from: string, to: string, rate: number): void {
  const key = getCacheKey(from, to)
  rateCache.set(key, { rate, timestamp: Date.now() })
}

export async function POST(request: NextRequest) {
  try {
    const body: ConversionRequest = await request.json()
    const { amount, from, to } = body

    // Validate input
    if (!amount || !from || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, from, to' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Same currency - no conversion needed
    if (from === to) {
      return NextResponse.json({
        convertedAmount: amount,
        exchangeRate: 1,
        cached: false,
      })
    }

    // Check cache first
    const cachedRate = getCachedRate(from, to)
    if (cachedRate !== null) {
      return NextResponse.json({
        convertedAmount: Math.round(amount * cachedRate * 100) / 100,
        exchangeRate: cachedRate,
        cached: true,
      })
    }

    // Fetch from Frankfurter API
    const apiUrl = `https://api.frankfurter.app/latest?from=${from}&to=${to}&amount=${amount}`
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Cache at fetch level too
    })

    if (!response.ok) {
      // Handle specific API errors
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Unsupported currency pair: ${from} to ${to}` },
          { status: 400 }
        )
      }
      throw new Error(`Frankfurter API error: ${response.status}`)
    }

    const data = await response.json()
    const convertedAmount = data.rates[to]
    const exchangeRate = convertedAmount / amount

    // Cache the rate
    setCachedRate(from, to, exchangeRate)

    return NextResponse.json({
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      exchangeRate: Math.round(exchangeRate * 1000000) / 1000000,
      cached: false,
    })
  } catch (error) {
    console.error('Currency conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert currency. Please enter exchange rate manually.' },
      { status: 500 }
    )
  }
}
