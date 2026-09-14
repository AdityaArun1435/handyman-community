'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  handymanId: string
  categories: string[]
  availability: { id: number; label: string }[]
}

export default function BookingForm({ handymanId, categories, availability }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [category, setCategory] = useState(categories[0] ?? '')
  const [description, setDescription] = useState('')
  const [locality, setLocality] = useState('')
  const [slotLabel, setSlotLabel] = useState(availability[0]?.label ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  function shareLocation() {
    if (!navigator.geolocation) {
      setLocationError('Location is not supported on this browser.')
      return
    }
    setLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setLocationError('Could not get your location. You can still book without it.')
        setLocating(false)
      }
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) {
      setError('You need to be logged in.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('bookings').insert({
      handyman_id: handymanId,
      customer_id: user.id,
      category,
      description,
      locality,
      scheduled_time_slot: slotLabel || null,
      status: 'pending',
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
    router.refresh()
  }

  if (success) {
    return (
      <p className="text-sm text-[var(--success)]">
        Booking request sent. You can track it from{' '}
        <a href="/dashboard/customer" className="underline">your bookings</a>.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Service needed</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {availability.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Preferred slot</label>
          <select
            value={slotLabel}
            onChange={(e) => setSlotLabel(e.target.value)}
            className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
          >
            {availability.map((a) => (
              <option key={a.id} value={a.label}>{a.label}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Your locality</label>
        <input
          type="text"
          required
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={shareLocation}
          disabled={locating}
          className="text-sm border border-[var(--border-hairline)] rounded-sm px-3 py-1.5 disabled:opacity-50"
        >
          {locating ? 'Getting location...' : coords ? 'Location shared' : 'Share my exact location (optional)'}
        </button>
        {locationError && <p className="text-sm text-[var(--danger)] mt-1">{locationError}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Describe the issue</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
        />
      </div>

      {error && <p className="text-[var(--danger)] text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-[var(--accent)] text-white rounded-sm px-5 py-2 font-medium disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send booking request'}
      </button>
    </form>
  )
}
