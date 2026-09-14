import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatThread from '@/components/ChatThread'

export default async function BookingChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const bookingId = parseInt(id, 10)

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) redirect('/login')

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, handyman:profiles!bookings_handyman_id_fkey(full_name), customer:profiles!bookings_customer_id_fkey(full_name)')
    .eq('id', bookingId)
    .single()

  if (!booking) notFound()

  if (booking.handyman_id !== user.id && booking.customer_id !== user.id) {
    redirect('/browse')
  }

  const otherPartyName =
    booking.handyman_id === user.id
      ? (booking as any).customer?.full_name ?? 'Customer'
      : (booking as any).handyman?.full_name ?? 'Handyman'

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="font-display text-xl font-semibold mb-1">
        Chat with {otherPartyName}
      </h1>
      <p className="text-sm text-[var(--muted)] mb-4">
        Booking: {booking.category} — {booking.locality}
      </p>

      <ChatThread bookingId={bookingId} currentUserId={user.id} otherPartyName={otherPartyName} />
    </div>
  )
}
