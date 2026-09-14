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

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-2">Find a Handyman</h1>
      <p className="text-gray-600 mb-6">Browse registered handymen serving ECR, Chennai.</p>

      <form method="get" className="flex flex-wrap gap-3 mb-8">
        <select name="category" defaultValue={selectedCategory} className="border rounded-md px-3 py-2">
          <option value="">All services</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input type="text" name="locality" placeholder="Locality, e.g. Neelankarai" defaultValue={params.locality ?? ''} className="border rounded-md px-3 py-2 flex-1 min-w-[200px]" />

        <button type="submit" className="bg-black text-white rounded-md px-5 py-2 font-medium">Search</button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">Something went wrong loading handymen: {error.message}</p>}

      {!error && handymen.length === 0 && <p className="text-gray-500">No handymen match that search yet.</p>}

      <div className="space-y-4">
        {handymen.map((h) => (
          <div key={h.profile_id} className="border rounded-lg p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-lg">{h.profiles?.full_name ?? 'Unnamed'}</h2>
              {h.years_experience != null && <span className="text-sm text-gray-500">{h.years_experience} yrs experience</span>}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {h.categories.map((cat) => (
                <span key={cat} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{cat}</span>
              ))}
            </div>

            <p className="text-sm text-gray-600">Serves: {h.localities.join(', ')}</p>

            {h.bio && <p className="text-sm text-gray-700">{h.bio}</p>}

            <div className="flex gap-3 mt-2">
              {h.profiles?.phone && <a href={"tel:" + h.profiles.phone} className="text-sm bg-black text-white px-4 py-1.5 rounded-md">Call {h.profiles.phone}</a>}
              {h.profiles?.whatsapp && <a href={"https://wa.me/" + h.profiles.whatsapp.replace(/\D/g, "")} target="_blank" className="text-sm border border-black px-4 py-1.5 rounded-md">WhatsApp</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}