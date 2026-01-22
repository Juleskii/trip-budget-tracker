# Trip Budget Tracker

A mobile-first budget tracking app for extended travelers, featuring real-time currency conversion and "runway" projections.

## Problem Statement

When planning multi-country trips, travelers struggle to answer: **"Am I on track with my budget?"** This app provides runway calculations (days remaining at current burn rate) and multi-user expense tracking.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State**: Zustand
- **Currency API**: Frankfurter (ECB rates)
- **Deployment**: Vercel

## Features

- ✅ Multi-currency expense tracking with auto-conversion
- ✅ Budget runway projections ("X days remaining at current rate")
- ✅ Shared trip access (multiple users, same budget)
- ✅ Offline support with sync queue
- ✅ Mobile-optimized quick-entry interface

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and add your Supabase credentials
3. Run `npm install`
4. Run `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Project Structure

```
app/              # Next.js App Router pages
components/       # React components
lib/              # Utilities, Supabase clients, calculations
stores/           # Zustand state management
types/            # TypeScript type definitions
```

## License

MIT

---

**Built as a portfolio project by Ken** | [LinkedIn](your-linkedin-url)
