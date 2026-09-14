'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type Slot = {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
}

export default function AvailabilityManager({
  handymanId,
  initialSlots,
}: {
  handymanId: string
  initialSlots: Slot[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: insertError } = await supabase.from('availability').insert({
      handyman_id: handymanId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: number) {
    await supabase.from('availability').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div>
      <div className="space-y-2 mb-4">
        {initialSlots.length === 0 && (
          <p className="text-sm text-[var(--muted)]">No availability set yet.</p>
        )}
        {initialSlots.map((s) => (
          <div key={s.id} className="flex items-center justify-between text-sm border border-[var(--border-hairline)] rounded-sm px-3 py-2">
            <span>
              {DAY_NAMES[s.day_of_week]} {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
            </span>
            <button onClick={() => handleDelete(s.id)} className="text-[var(--danger)] underline">
              Remove
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-xs mb-1">Day</label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="border border-[var(--border-hairline)] rounded-sm px-2 py-1.5 bg-white text-sm"
          >
            {DAY_NAMES.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Start</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border border-[var(--border-hairline)] rounded-sm px-2 py-1.5 bg-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">End</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border border-[var(--border-hairline)] rounded-sm px-2 py-1.5 bg-white text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--accent)] text-white rounded-sm px-4 py-1.5 text-sm disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add slot'}
        </button>
      </form>
      {error && <p className="text-[var(--danger)] text-sm mt-2">{error}</p>}
    </div>
  )
}
