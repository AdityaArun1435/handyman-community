import Link from 'next/link'

const CATEGORIES = [
  'AC Repair',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'Appliance Repair',
]

export default function HomePage() {
  return (
    <div>
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12">
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight max-w-2xl">
          Find someone who will actually pick up the phone.
        </h1>
        <p className="mt-4 text-lg max-w-xl text-[var(--muted)]">
          A directory of real, contactable handymen serving ECR, Chennai —
          AC repair, electrical, plumbing, and more. No app fees, no markup,
          no bidding war.
        </p>

        <form action="/browse" method="get" className="mt-8 flex flex-wrap gap-3 max-w-xl">
          <select
            name="category"
            className="border border-[var(--border-hairline)] px-3 py-2 rounded-sm bg-white"
          >
            <option value="">All services</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            name="locality"
            placeholder="Your locality, e.g. Neelankarai"
            className="border border-[var(--border-hairline)] px-3 py-2 rounded-sm bg-white flex-1 min-w-[200px]"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-sm text-white font-medium bg-[var(--accent)]"
          >
            Search
          </button>
        </form>
      </section>

      <section className="border-t border-[var(--border-hairline)]">
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={"/browse?category=" + encodeURIComponent(c)}
              className="border border-[var(--border-hairline)] rounded-sm px-3 py-1.5 text-sm bg-white"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border-hairline)]">
        <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">
              Do skilled work in ECR?
            </h2>
            <p className="mt-1 text-[var(--muted)]">
              List your services and get found by neighbors who need you.
            </p>
          </div>
          <Link
            href="/register/handyman"
            className="px-5 py-2.5 rounded-sm border border-[var(--foreground)] font-medium"
          >
            Register as a handyman
          </Link>
        </div>
      </section>
    </div>
  )
}
