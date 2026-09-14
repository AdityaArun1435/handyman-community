import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const CATEGORY_OPTIONS = [
  'AC Repair',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'Appliance Repair',
]

type HandymanRow = {
  profile_id: string
  categories: string[]
  localities: string[]
  years_experience: number | null
  bio: string | null
  profiles: {
    id: string
    full_name: string
    phone: string
    whatsapp: string | null
  } | null
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; locality?: string }>
}) {
  const params = await searchParams
  const selectedCategory = params.category ?? ''
  const localityQuery = (params.locality ?? '').trim().toLowerCase()

  const supabase = await createClient()

  let query = supabase.from('handyman_details').select('*, profiles(*)')

  if (selectedCategory) {
    query = query.contains('categories', [selectedCategory])
  }

  const { data, error } = await query

  let handymen = (data as unknown as HandymanRow[]) ?? []

  if (localityQuery) {
    handymen = handymen.filter((h) =>
      h.localities.some((l) => l.toLowerCase().includes(localityQuery))
    )
  }

  const handymanIds = handymen.map((h) => h.profile_id)
  const ratingsMap: Record<string, { avg: number; count: number }> = {}

  if (handymanIds.length > 0) {
    const { data: reviewRows } = await supabase
      .from('reviews')
      .select('handyman_id, rating')
      .in('handyman_id', handymanIds)

    if (reviewRows) {
      const grouped: Record<string, number[]> = {}
      reviewRows.forEach((r) => {
        if (!grouped[r.handyman_id]) grouped[r.handyman_id] = []
        grouped[r.handyman_id].push(r.rating)
      })
      Object.entries(grouped).forEach(([id, ratings]) => {
        const sum = ratings.reduce((a, b) => a + b, 0)
        ratingsMap[id] = { avg: sum / ratings.length, count: ratings.length }
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="font-display text-2xl font-semibold mb-2">Find a Handyman</h1>
      <p className="text-[var(--muted)] mb-6">
        Browse registered handymen serving ECR, Chennai.
      </p>

      <form method="get" className="flex flex-wrap gap-3 mb-8">
        <select
          name="category"
          defaultValue={selectedCategory}
          className="border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
        >
          <option value="">All services</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          name="locality"
          placeholder="Locality, e.g. Neelankarai"
          defaultValue={params.locality ?? ''}
          className="border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white flex-1 min-w-[200px]"
        />

        <button
          type="submit"
          className="bg-[var(--accent)] text-white rounded-sm px-5 py-2 font-medium"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="text-[var(--danger)] text-sm mb-4">
          Something went wrong loading handymen: {error.message}
        </p>
      )}

      {!error && handymen.length === 0 && (
        <p className="text-[var(--muted)]">No handymen match that search yet.</p>
      )}

      <div className="divide-y divide-[var(--border-hairline)] border-t border-b border-[var(--border-hairline)]">
        {handymen.map((h) => {
          const rating = ratingsMap[h.profile_id]
          return (
            <div key={h.profile_id} className="py-5 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {(h.profiles as any)?.photo_url && (
                    <img
                      src={(h.profiles as any).photo_url}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border border-[var(--border-hairline)]"
                    />
                  )}
                  <Link
                    href={"/handyman/" + h.profile_id}
                    className="font-display font-semibold text-lg hover:underline"
                  >
                    {h.profiles?.full_name ?? 'Unnamed'}
                  </Link>
                </div>
                <div className="text-right text-sm text-[var(--muted)]">
                  {h.years_experience != null && <div>{h.years_experience} yrs experience</div>}
                  {rating && <div>{rating.avg.toFixed(1)} stars ({rating.count})</div>}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {h.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs bg-white border border-[var(--border-hairline)] px-2 py-0.5 rounded-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <p className="text-sm text-[var(--muted)]">
                Serves: {h.localities.join(', ')}
              </p>

              {h.bio && <p className="text-sm">{h.bio}</p>}

              <div className="flex gap-3 mt-1">
                <Link
                  href={"/handyman/" + h.profile_id}
                  className="text-sm bg-[var(--foreground)] text-white px-4 py-1.5 rounded-sm"
                >
                  View profile & book
                </Link>
                {h.profiles?.phone && (
                  <a
                    href={"tel:" + h.profiles.phone}
                    className="text-sm border border-[var(--border-hairline)] px-4 py-1.5 rounded-sm"
                  >
                    Call
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
