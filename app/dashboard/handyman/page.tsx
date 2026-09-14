import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookingStatusControls from '@/components/BookingStatusControls'
import AvailabilityManager from '@/components/AvailabilityManager'

export default async function HandymanDashboardPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'handyman') redirect('/browse')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, profiles!bookings_customer_id_fkey(full_name, phone)')
    .eq('handyman_id', user.id)
    .order('created_at', { ascending: false })

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('handyman_id', user.id)
    .order('day_of_week')

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold">My Dashboard</h1>
        <a href="/dashboard/handyman/edit" className="text-sm underline">
          Edit profile
        </a>
      </div>

      <h2 className="font-display text-lg font-semibold mb-3">Bookings</h2>
      {(!bookings || bookings.length === 0) && (
        <p className="text-[var(--muted)] mb-8">No booking requests yet.</p>
      )}
      <div className="space-y-5 mb-10">
        {bookings?.map((b) => (
          <div key={b.id} className="border border-[var(--border-hairline)] rounded-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {b.category} for {(b as any).profiles?.full_name ?? 'Customer'}
                </p>
                <p className="text-sm text-[var(--muted)]">{b.locality}</p>
                {b.scheduled_time_slot && (
                  <p className="text-sm text-[var(--muted)]">Slot: {b.scheduled_time_slot}</p>
                )}
                {(b as any).profiles?.phone && (
                  <p className="text-sm text-[var(--muted)]">Phone: {(b as any).profiles.phone}</p>
                )}
                {b.latitude != null && b.longitude != null && (
                  <a
                    href={"https://www.google.com/maps?q=" + b.latitude + "," + b.longitude}
                    target="_blank"
                    className="text-sm underline text-[var(--accent)]"
                  >
                    View exact location on map
                  </a>
                )}
              </div>
              <span className="text-xs uppercase tracking-wide border border-[var(--border-hairline)] px-2 py-1 rounded-sm">
                {b.status}
              </span>
            </div>

            {b.description && <p className="text-sm mt-2">{b.description}</p>}

            <BookingStatusControls bookingId={b.id} status={b.status} />

            <div className="mt-2">
              <a href={"/booking/" + b.id + "/chat"} className="text-sm underline">
                Open chat
              </a>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-lg font-semibold mb-3">Availability</h2>
      <AvailabilityManager handymanId={user.id} initialSlots={availability ?? []} />
    </div>
  )
}
