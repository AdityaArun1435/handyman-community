'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewPostPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [locality, setLocality] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) {
      setError('You need to log in to post.')
      setLoading(false)
      return
    }

    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        title,
        body,
        locality: locality || null,
      })
      .select()
      .single()

    if (insertError || !newPost) {
      setError(insertError?.message ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    router.push('/community/' + newPost.id)
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="font-display text-2xl font-semibold mb-6">New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Locality (optional)</label>
          <input
            type="text"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="e.g. Neelankarai"
            className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">What's on your mind?</label>
          <textarea
            required
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
          />
        </div>

        {error && <p className="text-[var(--danger)] text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--accent)] text-white rounded-sm px-5 py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  )
}
