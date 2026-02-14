import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">TripBudget</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 pt-12 pb-16 sm:px-6 lg:px-8 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Know exactly how long
            <span className="block text-blue-600">your budget will last</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Track expenses in any currency, see your daily burn rate, and get
            runway projections for your trip. Built for backpackers, digital
            nomads, and anyone stretching their travel budget.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start tracking free
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Everything you need to travel longer
          </h2>
          <p className="mt-4 text-center text-gray-600 max-w-xl mx-auto">
            Stop guessing if you can afford that extra week. Know exactly where
            you stand.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Multi-Currency Support
              </h3>
              <p className="mt-2 text-gray-600">
                Log expenses in Thai Baht, Vietnamese Dong, or any currency.
                We&apos;ll convert everything to your base currency automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Burn Rate Tracking
              </h3>
              <p className="mt-2 text-gray-600">
                See your daily spending average and understand exactly how fast
                you&apos;re going through your budget.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-violet-600 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Runway Projections
              </h3>
              <p className="mt-2 text-gray-600">
                &quot;At your current rate, your budget lasts until March 15th.&quot;
                Know when to adjust or when you can splurge.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-amber-600 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Category Breakdown
              </h3>
              <p className="mt-2 text-gray-600">
                See where your money goes. Food, transport, accommodation,
                activities&mdash;spot the categories eating your budget.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-rose-600 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Share with Travel Buddies
              </h3>
              <p className="mt-2 text-gray-600">
                Traveling with friends? Share trips and track group expenses
                together in real-time.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 border border-cyan-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-cyan-600 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Mobile-First Design
              </h3>
              <p className="mt-2 text-gray-600">
                Log expenses on the go, right from your phone. Quick entry when
                you&apos;re at the hostel or on the bus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Simple as logging your morning coffee
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                1
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Create a trip
              </h3>
              <p className="mt-2 text-gray-600">
                Set your total budget and base currency. Southeast Asia for 3
                months? Europe summer trip? You decide.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                2
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Log expenses
              </h3>
              <p className="mt-2 text-gray-600">
                Paid 150 baht for pad thai? Log it. We&apos;ll handle the currency
                conversion with real-time rates.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                3
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Stay on track
              </h3>
              <p className="mt-2 text-gray-600">
                Check your dashboard to see remaining budget, daily burn rate,
                and how many days you can keep traveling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Ready to stretch your travel budget?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join travelers who know exactly where their money goes.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create free account
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-sm">Trip Budget Tracker</span>
          </div>
          <p className="text-sm text-gray-500">
            Built for travelers, by travelers.
          </p>
        </div>
      </footer>
    </div>
  );
}
