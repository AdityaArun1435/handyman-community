import { createClient } from '@/lib/supabase/server'
import BookingForm from '@/components/BookingForm'

export default async function HandymanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: details } = await supabase
    .from('handyman_details')
    .select('*, profiles(*)')
    .eq('profile_id', id)
    .single()

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('handyman_id', id)
    .order('day_of_week')

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles!reviews_customer_id_fkey(full_name)')
    .eq('handyman_id', id)
    .order('created_at', { ascending: false })

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  let viewerRole: string | null = null
  if (user) {
    const { data: viewerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    viewerRole = viewerProfile?.role ?? null
  }

  if (!details) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <p>This handyman could not be found.</p>
      </div>
    )
  }

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4">
        {(details.profiles as any)?.photo_url && (
          <img
            src={(details.profiles as any).photo_url}
            alt=""
            className="w-20 h-20 rounded-full object-cover border border-[var(--border-hairline)]"
          />
        )}
        <h1 className="font-display text-3xl font-semibold">
          {details.profiles?.full_name}
        </h1>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {details.categories.map((cat: string) => (
          <span
            key={cat}
            className="text-xs bg-white border border-[var(--border-hairline)] px-2 py-0.5 rounded-sm"
          >
            {cat}
          </span>
        ))}
      </div>

      <p className="text-sm text-[var(--muted)] mt-2">
        Serves: {details.localities.join(', ')}
      </p>

      {details.years_experience != null && (
        <p className="text-sm text-[var(--muted)]">
          {details.years_experience} years of experience
        </p>
      )}

      {avgRating != null && (
        <p className="text-sm text-[var(--muted)]">
          {avgRating.toFixed(1)} stars from {reviews!.length} review
          {reviews!.length === 1 ? '' : 's'}
        </p>
      )}

      {details.bio && <p className="mt-4">{details.bio}</p>}

      <div className="mt-6 flex gap-3">
        {details.profiles?.phone && (
          <a
            href={"tel:" + details.profiles.phone}
            className="text-sm border border-[var(--border-hairline)] px-4 py-1.5 rounded-sm"
          >
            Call {details.profiles.phone}
          </a>
        )}
        {details.profiles?.whatsapp && (
          <a
            href={"https://wa.me/" + details.profiles.whatsapp.replace(/\D/g, "")}
            target="_blank"
            className="text-sm border border-[var(--border-hairline)] px-4 py-1.5 rounded-sm"
          >
            WhatsApp
          </a>
        )}
      </div>

      <hr className="my-8 border-[var(--border-hairline)]" />

      <h2 className="font-display text-xl font-semibold mb-3">Request a booking</h2>

      {!user && (
        <p className="text-sm text-[var(--muted)]">
          You need an account to send a booking request. <a href="/register/customer" className="underline">Sign up</a> or{' '}
          <a href="/login" className="underline">log in</a>.
        </p>
      )}

      {user && viewerRole === 'handyman' && (
        <p className="text-sm text-[var(--muted)]">
          Handyman accounts can't book other handymen. Log in as a customer to book.
        </p>
      )}

      {user && viewerRole === 'customer' && (
        <BookingForm
          handymanId={id}
          categories={details.categories}
          availability={(availability ?? []).map((a) => ({
            id: a.id,
            label: DAY_NAMES[a.day_of_week] + ' ' + a.start_time.slice(0, 5) + '-' + a.end_time.slice(0, 5),
          }))}
        />
      )}

      <hr className="my-8 border-[var(--border-hairline)]" />

      <h2 className="font-display text-xl font-semibold mb-3">Reviews</h2>
      {(!reviews || reviews.length === 0) && (
        <p className="text-sm text-[var(--muted)]">No reviews yet.</p>
      )}
      <div className="space-y-4">
        {reviews?.map((r) => (
          <div key={r.id} className="border-b border-[var(--border-hairline)] pb-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {(r as any).profiles?.full_name ?? 'A customer'}
              </span>
              <span>{r.rating} / 5</span>
            </div>
            {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
