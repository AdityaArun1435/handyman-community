import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  let profile: { full_name: string; role: string } | null = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="border-b border-[var(--border-hairline)]">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold">
          ECR Handyman
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <Link href="/browse">Find help</Link>
          <Link href="/community">Community</Link>

          {profile ? (
            <>
              {profile.role === 'handyman' ? (
                <Link href="/dashboard/handyman">My dashboard</Link>
              ) : (
                <Link href="/dashboard/customer">My bookings</Link>
              )}
              <span className="text-[var(--muted)]">
                Hi, {profile.full_name.split(' ')[0]}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link
                href="/register/customer"
                className="px-3 py-1.5 rounded-sm text-white bg-[var(--accent)]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
