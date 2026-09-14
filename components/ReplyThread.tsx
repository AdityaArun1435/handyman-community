'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Reply = {
  id: number
  post_id: number
  author_id: string
  body: string
  created_at: string
  authorName?: string
}

export default function ReplyThread({
  postId,
  initialReplies,
  isLoggedIn,
}: {
  postId: number
  initialReplies: Reply[]
  isLoggedIn: boolean
}) {
  const supabase = createClient()
  const [replies, setReplies] = useState<Reply[]>(initialReplies)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel('post-' + postId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_replies', filter: 'post_id=eq.' + postId },
        async (payload) => {
          const newReply = payload.new as Reply
          const { data: authorProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newReply.author_id)
            .single()
          setReplies((prev) => [
            ...prev,
            { ...newReply, authorName: authorProfile?.full_name ?? 'Someone' },
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setError(null)
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) {
      setError('You need to log in to reply.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('post_replies').insert({
      post_id: postId,
      author_id: user.id,
      body: text,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setText('')
    setLoading(false)
  }

  return (
    <div>
      <div className="space-y-4">
        {replies.length === 0 && (
          <p className="text-sm text-[var(--muted)]">No replies yet.</p>
        )}
        {replies.map((r) => (
          <div key={r.id} className="border-b border-[var(--border-hairline)] pb-3">
            <p className="text-sm font-medium">{r.authorName ?? 'Someone'}</p>
            <p className="text-sm mt-1">{r.body}</p>
          </div>
        ))}
      </div>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a reply"
            className="flex-1 border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[var(--accent)] text-white rounded-sm px-4 py-2 text-sm disabled:opacity-50"
          >
            Reply
          </button>
        </form>
      ) : (
        <p className="text-sm text-[var(--muted)] mt-5">
          <a href="/login" className="underline">Log in</a> to reply.
        </p>
      )}
      {error && <p className="text-[var(--danger)] text-sm mt-2">{error}</p>}
    </div>
  )
}
