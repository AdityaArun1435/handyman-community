import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ locality?: string }>
}) {
  const params = await searchParams
  const localityQuery = (params.locality ?? '').trim().toLowerCase()

  const supabase = await createClient()

  const { data: postsRaw } = await supabase
    .from('posts')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })

  let posts = postsRaw ?? []

  if (localityQuery) {
    posts = posts.filter((p) => (p.locality ?? '').toLowerCase().includes(localityQuery))
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Community</h1>
          <p className="text-[var(--muted)] mt-1">
            Ask neighbors, share recommendations, talk about what's going on in ECR.
          </p>
        </div>
        <Link
          href="/community/new"
          className="bg-[var(--accent)] text-white rounded-sm px-4 py-2 text-sm font-medium whitespace-nowrap"
        >
          New post
        </Link>
      </div>

      <form method="get" className="mb-6">
        <input
          type="text"
          name="locality"
          placeholder="Filter by locality"
          defaultValue={params.locality ?? ''}
          className="border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white text-sm w-full max-w-xs"
        />
      </form>

      {posts.length === 0 && (
        <p className="text-[var(--muted)]">No posts yet. Be the first to ask something.</p>
      )}

      <div className="divide-y divide-[var(--border-hairline)] border-t border-b border-[var(--border-hairline)]">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={"/community/" + p.id}
            className="block py-4 hover:bg-white/50"
          >
            <h2 className="font-medium">{p.title}</h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              {(p as any).profiles?.full_name ?? 'Someone'}
              {p.locality ? " · " + p.locality : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
