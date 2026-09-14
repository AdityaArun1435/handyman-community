'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function BookingStatusControls({
  bookingId,
  status,
}: {
  bookingId: number
  status: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function updateStatus(newStatus: string) {
    setLoading(true)
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2 mt-2">
      {status === 'pending' && (
        <button
          disabled={loading}
          onClick={() => updateStatus('confirmed')}
          className="text-sm bg-[var(--success)] text-white px-3 py-1 rounded-sm disabled:opacity-50"
        >
          Confirm
        </button>
      )}
      {status === 'confirmed' && (
        <button
          disabled={loading}
          onClick={() => updateStatus('completed')}
          className="text-sm bg-[var(--foreground)] text-white px-3 py-1 rounded-sm disabled:opacity-50"
        >
          Mark completed
        </button>
      )}
      {(status === 'pending' || status === 'confirmed') && (
        <button
          disabled={loading}
          onClick={() => updateStatus('cancelled')}
          className="text-sm border border-[var(--danger)] text-[var(--danger)] px-3 py-1 rounded-sm disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </div>
  )
}
