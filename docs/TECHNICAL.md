# Trip Budget Tracker - Technical Documentation

> **Version**: 1.0.0
> **Last Updated**: January 2026
> **Author**: Ken

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture Diagram](#3-high-level-architecture-diagram)
4. [Database Schema](#4-database-schema)
5. [API Specification](#5-api-specification)
6. [Integration Requirements](#6-integration-requirements)
7. [Security & Compliance](#7-security--compliance)
8. [Testing Requirements](#8-testing-requirements)
9. [Deployment & CI/CD](#9-deployment--cicd)
10. [Future Considerations](#10-future-considerations)

---

## 1. System Architecture Overview

### 1.1 Application Summary

Trip Budget Tracker is a mobile-first budget management application designed for extended travelers. It solves the core problem: **"Am I on track with my budget?"** by providing:

- Multi-currency expense tracking with automatic conversion
- Budget runway projections (days remaining at current burn rate)
- Shared trip access for group travel
- Real-time budget visibility

### 1.2 Architecture Pattern

The application follows a **serverless architecture** pattern using:

- **Next.js App Router** - Server-side rendering with React Server Components
- **Supabase Backend-as-a-Service** - Authentication, database, and real-time subscriptions
- **Edge Middleware** - Route protection and session management
- **External API Integration** - Currency conversion via Frankfurter API

### 1.3 Key Design Principles

| Principle | Implementation |
|-----------|---------------|
| Mobile-First | Tailwind CSS responsive design, touch-optimized UI |
| Offline-Ready | Sync queue architecture (planned) |
| Multi-Tenant | Row-level security, user-scoped data |
| Real-Time | Supabase real-time subscriptions for shared trips |

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.2 | React framework with App Router |
| React | 19.2.3 | UI component library |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 4.x | Utility-first styling |
| date-fns | 4.1.0 | Date formatting utilities |

### 2.2 Backend Services

| Service | Purpose |
|---------|---------|
| Supabase PostgreSQL | Primary database |
| Supabase Auth | User authentication (email/password) |
| Supabase Realtime | Live data subscriptions |
| Frankfurter API | ECB currency exchange rates |

### 2.3 Development & Build

| Tool | Purpose |
|------|---------|
| ESLint 9 | Code linting |
| Babel React Compiler | Optimized React compilation |
| Vercel | Deployment platform |

### 2.4 NPM Dependencies

```json
{
  "@supabase/ssr": "0.8.0",
  "@supabase/supabase-js": "2.90.1",
  "date-fns": "4.1.0",
  "next": "16.1.2",
  "react": "19.2.3",
  "react-dom": "19.2.3"
}
```

---

## 3. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐     │
│   │   Browser/PWA    │    │  Mobile Browser  │    │   Future: Native │     │
│   │   (React RSC)    │    │   (Responsive)   │    │       Apps       │     │
│   └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘     │
│            │                       │                       │                │
│            └───────────────────────┼───────────────────────┘                │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EDGE LAYER (Vercel)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────┐     │
│   │                     Next.js Middleware                            │     │
│   │  • Route Protection (/dashboard, /trips)                          │     │
│   │  • Session Refresh (updateSession)                                │     │
│   │  • Auth Redirect Logic                                            │     │
│   └──────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    Next.js App Router                                │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │                                                                      │  │
│   │  SERVER COMPONENTS              CLIENT COMPONENTS                    │  │
│   │  ┌────────────────┐            ┌────────────────┐                   │  │
│   │  │ /trips/page    │            │ AddExpenseForm │                   │  │
│   │  │ /trips/[id]    │◄──props───►│ EditTripForm   │                   │  │
│   │  │ Data Fetching  │            │ DeleteButtons  │                   │  │
│   │  └────────────────┘            └────────────────┘                   │  │
│   │                                                                      │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │                       API ROUTES                                     │  │
│   │  ┌────────────────────────┐  ┌────────────────────────┐            │  │
│   │  │ POST /api/currency     │  │ GET /auth/callback     │            │  │
│   │  │ • Rate fetching        │  │ • OAuth code exchange  │            │  │
│   │  │ • In-memory cache      │  │ • Session creation     │            │  │
│   │  └────────────────────────┘  └────────────────────────┘            │  │
│   │                                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────┬───────────────────────────────┬────────────────────────┘
                      │                               │
                      ▼                               ▼
┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│         SUPABASE SERVICES           │  │       EXTERNAL SERVICES              │
├─────────────────────────────────────┤  ├─────────────────────────────────────┤
│                                     │  │                                     │
│  ┌─────────────────────────────┐   │  │  ┌─────────────────────────────┐   │
│  │      PostgreSQL Database    │   │  │  │    Frankfurter API          │   │
│  │  ┌───────┐ ┌───────────┐   │   │  │  │    (ECB Exchange Rates)     │   │
│  │  │ trips │ │ expenses  │   │   │  │  │                             │   │
│  │  └───┬───┘ └─────┬─────┘   │   │  │  │  GET /latest?from=X&to=Y   │   │
│  │      │           │         │   │  │  │  • 32+ currencies           │   │
│  │  ┌───┴───────────┴───┐     │   │  │  │  • Real-time ECB rates      │   │
│  │  │    trip_users     │     │   │  │  └─────────────────────────────┘   │
│  │  └───────────────────┘     │   │  │                                     │
│  └─────────────────────────────┘   │  └─────────────────────────────────────┘
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Authentication         │   │
│  │  • Email/Password           │   │
│  │  • Session Management       │   │
│  │  • JWT Tokens               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Row-Level Security     │   │
│  │  • User-scoped queries      │   │
│  │  • Policy enforcement       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 3.1 Data Flow Summary

```
User Action → Client Component → Server Action/API Route → Supabase → Response → UI Update
                                          ↓
                              Frankfurter API (if currency conversion needed)
```

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE SCHEMA (PostgreSQL)                        │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────┐
    │       auth.users         │  (Supabase managed)
    ├──────────────────────────┤
    │ id          UUID [PK]    │
    │ email       VARCHAR      │
    │ created_at  TIMESTAMP    │
    └──────────────┬───────────┘
                   │
                   │ 1:N
                   ▼
    ┌──────────────────────────┐         ┌──────────────────────────┐
    │         trips            │         │       trip_users         │
    ├──────────────────────────┤         ├──────────────────────────┤
    │ id            UUID [PK]  │◄────────│ trip_id    UUID [FK,PK]  │
    │ name          VARCHAR    │   N:M   │ user_id    UUID [FK,PK]  │
    │ base_currency VARCHAR(3) │────────►│ role       VARCHAR       │
    │ total_budget  NUMERIC    │         └──────────────────────────┘
    │ start_date    DATE       │                    │
    │ end_date      DATE NULL  │                    │ N:1
    │ created_by    UUID [FK]  │────────────────────┘
    │ created_at    TIMESTAMP  │
    │ updated_at    TIMESTAMP  │
    └──────────────┬───────────┘
                   │
                   │ 1:N
                   ▼
    ┌──────────────────────────┐
    │        expenses          │
    ├──────────────────────────┤
    │ id            UUID [PK]  │
    │ trip_id       UUID [FK]  │
    │ amount        NUMERIC    │  ← Original transaction amount
    │ currency      VARCHAR(3) │  ← Transaction currency
    │ amount_base   NUMERIC    │  ← Converted to trip base currency
    │ exchange_rate NUMERIC    │  ← Rate used for conversion
    │ category      VARCHAR    │
    │ date          DATE       │
    │ note          TEXT NULL  │
    │ created_by    UUID [FK]  │
    │ created_at    TIMESTAMP  │
    │ updated_at    TIMESTAMP  │
    └──────────────────────────┘
```

### 4.2 Table Specifications

#### 4.2.1 `trips` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique trip identifier |
| `name` | VARCHAR(255) | NOT NULL | Trip display name |
| `base_currency` | VARCHAR(3) | NOT NULL | ISO 4217 currency code |
| `total_budget` | NUMERIC(12,2) | NOT NULL | Total allocated budget |
| `start_date` | DATE | NOT NULL | Trip start date |
| `end_date` | DATE | NULL | Optional end date |
| `created_by` | UUID | FOREIGN KEY → auth.users(id) | Trip owner |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

#### 4.2.2 `expenses` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique expense identifier |
| `trip_id` | UUID | FOREIGN KEY → trips(id) ON DELETE CASCADE | Parent trip |
| `amount` | NUMERIC(12,2) | NOT NULL | Original amount |
| `currency` | VARCHAR(3) | NOT NULL | Transaction currency |
| `amount_base` | NUMERIC(12,2) | NOT NULL | Converted to base currency |
| `exchange_rate` | NUMERIC(10,6) | NOT NULL | Conversion rate used |
| `category` | VARCHAR(50) | NOT NULL | Expense category |
| `date` | DATE | NOT NULL | Transaction date |
| `note` | TEXT | NULL | Optional description |
| `created_by` | UUID | FOREIGN KEY → auth.users(id) | Creator |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

#### 4.2.3 `trip_users` Table (Multi-User Access)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `trip_id` | UUID | PRIMARY KEY, FOREIGN KEY → trips(id) | Trip reference |
| `user_id` | UUID | PRIMARY KEY, FOREIGN KEY → auth.users(id) | User reference |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'member' | User role (owner/member) |

### 4.3 Supported Values

#### Currencies (ISO 4217)
```
USD, EUR, GBP, JPY, CAD, AUD, PHP
```

#### Expense Categories
```typescript
const EXPENSE_CATEGORIES = [
  'Food & Drinks',
  'Transport',
  'Accommodation',
  'Activities',
  'Shopping',
  'Other'
] as const;
```

### 4.4 Indexes (Recommended)

```sql
-- Performance indexes
CREATE INDEX idx_trips_created_by ON trips(created_by);
CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_trip_users_user_id ON trip_users(user_id);
```

---

## 5. API Specification

### 5.1 Authentication Endpoints

#### `GET /auth/callback`

OAuth callback handler for Supabase authentication.

| Property | Value |
|----------|-------|
| **Method** | GET |
| **Authentication** | None (callback endpoint) |
| **Rate Limit** | N/A |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | OAuth authorization code |

**Response:**
- **Success**: Redirect to `/dashboard`
- **Failure**: Redirect to `/login`

**Flow:**
```
1. User clicks email verification link
2. Supabase redirects to /auth/callback?code=xxx
3. Server exchanges code for session
4. User redirected to dashboard
```

---

### 5.2 Currency API

#### `POST /api/currency`

Converts currency amounts using real-time exchange rates.

| Property | Value |
|----------|-------|
| **Method** | POST |
| **Authentication** | None (public endpoint) |
| **Rate Limit** | Recommended: 100 req/min |
| **Cache TTL** | 1 hour (in-memory) |

**Request Body:**

```typescript
interface CurrencyRequest {
  amount: number;   // Amount to convert
  from: string;     // Source currency (ISO 4217)
  to: string;       // Target currency (ISO 4217)
}
```

**Response:**

```typescript
// Success (200)
interface CurrencyResponse {
  convertedAmount: number;   // Converted amount
  exchangeRate: number;      // Rate used
  cached: boolean;           // Whether rate was cached
}

// Error (400/500)
interface ErrorResponse {
  error: string;             // Error message
}
```

**Example:**

```bash
# Request
curl -X POST /api/currency \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "EUR"}'

# Response
{
  "convertedAmount": 92.45,
  "exchangeRate": 0.9245,
  "cached": false
}
```

**Error Codes:**

| Status | Condition |
|--------|-----------|
| 200 | Success |
| 400 | Invalid currency pair or missing parameters |
| 500 | Frankfurter API failure |

---

### 5.3 Data Operations (Supabase Client)

All data operations use the Supabase JavaScript client directly. Below are the key operations:

#### Trips CRUD

```typescript
// Create trip
const { data, error } = await supabase
  .from('trips')
  .insert({ name, base_currency, total_budget, start_date, end_date })
  .select()
  .single();

// Read trips (user-scoped)
const { data, error } = await supabase
  .from('trips')
  .select('*')
  .order('created_at', { ascending: false });

// Update trip
const { error } = await supabase
  .from('trips')
  .update({ name, base_currency, total_budget, start_date, end_date })
  .eq('id', tripId);

// Delete trip
const { error } = await supabase
  .from('trips')
  .delete()
  .eq('id', tripId);
```

#### Expenses CRUD

```typescript
// Create expense
const { data, error } = await supabase
  .from('expenses')
  .insert({
    trip_id, amount, currency, amount_base,
    exchange_rate, category, date, note
  })
  .select()
  .single();

// Read expenses for trip
const { data, error } = await supabase
  .from('expenses')
  .select('*')
  .eq('trip_id', tripId)
  .order('date', { ascending: false });

// Update expense
const { error } = await supabase
  .from('expenses')
  .update({ amount, currency, category, date, note, amount_base, exchange_rate })
  .eq('id', expenseId);

// Delete expense
const { error } = await supabase
  .from('expenses')
  .delete()
  .eq('id', expenseId);
```

---

## 6. Integration Requirements

### 6.1 Supabase Configuration

#### Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Auth Configuration (Supabase Dashboard)

| Setting | Value |
|---------|-------|
| Email Confirmations | Enabled |
| Redirect URLs | `http://localhost:3000/auth/callback`, `https://your-domain.com/auth/callback` |
| Password Min Length | 6 characters |

### 6.2 Frankfurter API

| Property | Value |
|----------|-------|
| Base URL | `https://api.frankfurter.app` |
| Authentication | None (public API) |
| Rate Limit | Fair use (no strict limit) |
| Data Source | European Central Bank |

#### Endpoints Used

```
GET /latest?from={currency}&to={currency}&amount={amount}
```

#### Supported Currencies

The API supports 32+ currencies including: AUD, BGN, BRL, CAD, CHF, CNY, CZK, DKK, EUR, GBP, HKD, HUF, IDR, ILS, INR, ISK, JPY, KRW, MXN, MYR, NOK, NZD, PHP, PLN, RON, SEK, SGD, THB, TRY, USD, ZAR

### 6.3 Vercel Deployment

| Configuration | Value |
|--------------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Node Version | 18.x+ |

---

## 7. Security & Compliance

### 7.1 Authentication Security

| Layer | Implementation |
|-------|---------------|
| Password Storage | Supabase (bcrypt hashing) |
| Session Management | HTTP-only cookies, JWT |
| Token Refresh | Automatic via middleware |
| CSRF Protection | SameSite cookies |

### 7.2 Authorization

#### Middleware Protection

```typescript
// Protected routes
const protectedPaths = ['/dashboard', '/trips'];

// Auth routes (redirect if logged in)
const authPaths = ['/login', '/signup'];
```

#### Row-Level Security (RLS)

Recommended Supabase policies:

```sql
-- Users can only see their own trips
CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (
    auth.uid() = created_by OR
    auth.uid() IN (SELECT user_id FROM trip_users WHERE trip_id = id)
  );

-- Users can only modify their own trips
CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can only delete their own trips
CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE USING (auth.uid() = created_by);

-- Users can add expenses to trips they have access to
CREATE POLICY "Users can insert expenses" ON expenses
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM trip_users WHERE trip_id = trip_id)
  );

-- Users can view expenses on accessible trips
CREATE POLICY "Users can view trip expenses" ON expenses
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM trip_users WHERE trip_id = trip_id)
  );
```

### 7.3 Data Protection

| Concern | Mitigation |
|---------|-----------|
| XSS | React automatic escaping, no dangerouslySetInnerHTML |
| SQL Injection | Supabase parameterized queries |
| HTTPS | Enforced by Vercel |
| Environment Secrets | `.env.local` (not committed) |

### 7.4 Compliance Considerations

| Regulation | Status |
|------------|--------|
| GDPR | User data scoped, deletion supported |
| PCI DSS | N/A (no payment processing) |
| SOC 2 | Inherited from Supabase/Vercel |

---

## 8. Testing Requirements

### 8.1 Testing Strategy

| Level | Tools | Coverage Target |
|-------|-------|-----------------|
| Unit | Jest, React Testing Library | 80% |
| Integration | Playwright | Critical paths |
| E2E | Playwright | User journeys |
| API | Jest, Supertest | All endpoints |

### 8.2 Unit Tests

```typescript
// Example: Currency formatting
describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('formats EUR correctly', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });
});
```

### 8.3 Integration Tests

```typescript
// Example: Currency API
describe('POST /api/currency', () => {
  it('converts USD to EUR', async () => {
    const response = await request(app)
      .post('/api/currency')
      .send({ amount: 100, from: 'USD', to: 'EUR' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('convertedAmount');
    expect(response.body).toHaveProperty('exchangeRate');
  });

  it('returns rate of 1 for same currency', async () => {
    const response = await request(app)
      .post('/api/currency')
      .send({ amount: 100, from: 'USD', to: 'USD' });

    expect(response.body.exchangeRate).toBe(1);
  });
});
```

### 8.4 E2E Test Scenarios

| Scenario | Steps |
|----------|-------|
| User Registration | Sign up → Verify email → Login → See dashboard |
| Trip Creation | Login → New trip → Fill form → Submit → See trip |
| Expense Entry | Open trip → Add expense → Currency converts → Saved |
| Budget Tracking | Add expenses → See total → Check remaining |
| Trip Deletion | Open trip → Delete → Confirm → Removed |

### 8.5 Test Commands

```bash
npm run test          # Run unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e      # Playwright E2E tests
```

---

## 9. Deployment & CI/CD

### 9.1 Environment Setup

| Environment | URL | Branch |
|-------------|-----|--------|
| Development | localhost:3000 | feature/* |
| Staging | staging.domain.com | develop |
| Production | domain.com | main |

### 9.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 9.3 Deployment Checklist

- [ ] Environment variables configured in Vercel
- [ ] Supabase redirect URLs updated
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Domain configured
- [ ] SSL certificate active

### 9.4 Rollback Procedure

```bash
# Via Vercel CLI
vercel rollback [deployment-url]

# Via Vercel Dashboard
# Deployments → Select previous → Promote to Production
```

---

## 10. Future Considerations

### 10.1 Planned Features

| Feature | Priority | Complexity | Status |
|---------|----------|------------|--------|
| Runway Projections | High | Medium | Not Started |
| Offline Sync Queue | High | High | Not Started |
| Shared Trip Invitations | Medium | Medium | Schema Ready |
| Zustand State Management | Medium | Low | Not Started |
| Push Notifications | Low | Medium | Not Started |
| Receipt Photo Uploads | Low | Medium | Not Started |
| Export to CSV/PDF | Low | Low | Not Started |

### 10.2 Runway Projections (High Priority)

**Calculation Logic:**
```typescript
interface RunwayCalculation {
  remainingBudget: number;      // total_budget - sum(amount_base)
  daysElapsed: number;          // today - start_date
  dailyBurnRate: number;        // sum(amount_base) / daysElapsed
  daysRemaining: number;        // remainingBudget / dailyBurnRate
  projectedEndDate: Date;       // today + daysRemaining
  isOnTrack: boolean;           // projectedEndDate >= end_date
}
```

### 10.3 Offline Support Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Offline Architecture                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────────┐    ┌──────────────┐                  │
│   │  IndexedDB   │◄──►│  Sync Queue  │                  │
│   │  (Local)     │    │  (Pending)   │                  │
│   └──────────────┘    └──────┬───────┘                  │
│                              │                           │
│                              ▼ Online?                   │
│                       ┌──────────────┐                  │
│                       │   Supabase   │                  │
│                       │   (Remote)   │                  │
│                       └──────────────┘                  │
│                                                          │
│   Flow:                                                  │
│   1. Write to IndexedDB immediately                     │
│   2. Queue operation for sync                           │
│   3. When online, process queue                         │
│   4. Handle conflicts (last-write-wins or merge)        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 10.4 Performance Optimization

| Optimization | Benefit |
|--------------|---------|
| React Server Components | Reduced client JS |
| Edge caching for currency rates | Faster conversions |
| Database connection pooling | Better concurrent performance |
| Image optimization for receipts | Reduced storage/bandwidth |

### 10.5 Scalability Considerations

| Metric | Current Limit | Scaling Strategy |
|--------|---------------|------------------|
| Users | ~10K (Supabase free) | Upgrade Supabase plan |
| Requests | 100K/month | Vercel Pro + Edge functions |
| Database Size | 500MB | Supabase Pro (8GB+) |
| Real-time Connections | 200 concurrent | Supabase Pro (500+) |

---

## Appendix A: File Structure

```
trip-budget-tracker/
├── app/
│   ├── api/
│   │   └── currency/
│   │       └── route.ts              # Currency conversion API
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts              # OAuth callback handler
│   ├── dashboard/
│   │   ├── components/
│   │   │   └── dashboard-nav.tsx     # Navigation component
│   │   ├── layout.tsx                # Dashboard layout
│   │   └── page.tsx                  # Dashboard page
│   ├── login/
│   │   └── page.tsx                  # Login page
│   ├── signup/
│   │   └── page.tsx                  # Signup page
│   ├── trips/
│   │   ├── [id]/
│   │   │   ├── components/
│   │   │   │   ├── delete-trip-button.tsx
│   │   │   │   └── expense-list.tsx
│   │   │   ├── edit/
│   │   │   │   ├── components/
│   │   │   │   │   └── edit-trip-form.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── expenses/
│   │   │   │   ├── [expenseId]/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── delete-expense-button.tsx
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   ├── components/
│   │   │   │   │   │   │   └── edit-expense-form.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       ├── components/
│   │   │   │       │   └── add-expense-form.tsx
│   │   │   │       └── page.tsx
│   │   │   └── page.tsx              # Trip detail page
│   │   ├── new/
│   │   │   └── page.tsx              # New trip page
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Trips list page
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── middleware.ts             # Session management
│   │   └── server.ts                 # Server client
│   ├── types/
│   │   └── database.ts               # TypeScript types
│   └── utils/
│       └── format.ts                 # Formatting utilities
├── docs/
│   └── TECHNICAL.md                  # This document
├── middleware.ts                     # Route protection
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── .env.example
```

---

## Appendix B: Quick Reference

### Common Commands

```bash
# Development
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run lint          # Run ESLint

# Database (Supabase CLI)
supabase db reset     # Reset local database
supabase db push      # Push migrations
supabase gen types    # Generate TypeScript types
```

### Key URLs

| Resource | URL |
|----------|-----|
| Supabase Dashboard | https://app.supabase.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Frankfurter API Docs | https://www.frankfurter.app/docs |

---

*This document should be updated as the application evolves.*
