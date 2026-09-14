import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ReviewForm from '@/components/ReviewForm'

export default async function CustomerDashboardPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'customer') redirect('/browse')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, profiles!bookings_handyman_id_fkey(full_name)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const { data: reviewedBookingIds } = await supabase
    .from('reviews')
    .select('booking_id')
    .eq('customer_id', user.id)

  const reviewedSet = new Set((reviewedBookingIds ?? []).map((r) => r.booking_id))

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="font-display text-2xl font-semibold mb-6">My Bookings</h1>

      {(!bookings || bookings.length === 0) && (
        <p className="text-[var(--muted)]">
          No bookings yet. <Link href="/browse" className="underline">Find a handyman</Link>.
        </p>
      )}

      <div className="space-y-5">
        {bookings?.map((b) => (
          <div key={b.id} className="border border-[var(--border-hairline)] rounded-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {b.category} with {(b as any).profiles?.full_name ?? 'Handyman'}
                </p>
                <p className="text-sm text-[var(--muted)]">{b.locality}</p>
                {b.scheduled_time_slot && (
                  <p className="text-sm text-[var(--muted)]">Slot: {b.scheduled_time_slot}</p>
                )}
              </div>
              <span className="text-xs uppercase tracking-wide border border-[var(--border-hairline)] px-2 py-1 rounded-sm">
                {b.status}
              </span>
            </div>

            {b.description && <p className="text-sm mt-2">{b.description}</p>}

            <div className="mt-3">
              <Link
                href={"/booking/" + b.id + "/chat"}
                className="text-sm underline"
              >
                Open chat
              </Link>
            </div>

            {b.status === 'completed' && !reviewedSet.has(b.id) && (
              <ReviewForm bookingId={b.id} handymanId={b.handyman_id} customerId={user.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
