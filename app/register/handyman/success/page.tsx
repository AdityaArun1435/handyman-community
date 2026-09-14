import Link from 'next/link'

export default function HandymanRegisterSuccessPage() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      <h1 className="font-display text-2xl font-semibold mb-3">You're registered!</h1>
      <p className="text-[var(--muted)] mb-6">
        Check your email to confirm your account before you appear in search results.
      </p>
      <Link href="/" className="text-[var(--accent)] underline">
        Back to home
      </Link>
    </div>
  )
}
