'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  bookingId: number
  handymanId: string
  customerId: string
}

export default function ReviewForm({ bookingId, handymanId, customerId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: insertError } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      handyman_id: handymanId,
      customer_id: customerId,
      rating,
      comment: comment || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSubmitted(true)
    router.refresh()
  }

  if (submitted) {
    return <p className="text-sm text-[var(--success)]">Review submitted.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 border-t border-[var(--border-hairline)] pt-3">
      <div className="flex items-center gap-2">
        <label className="text-sm">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border border-[var(--border-hairline)] rounded-sm px-2 py-1 bg-white text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <textarea
        rows={2}
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white text-sm"
      />
      {error && <p className="text-[var(--danger)] text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-[var(--foreground)] text-white rounded-sm px-4 py-1.5 text-sm disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Leave review'}
      </button>
    </form>
  )
}
