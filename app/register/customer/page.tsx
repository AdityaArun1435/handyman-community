'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError || !signInData.user) {
      setError(signInError?.message ?? 'Login failed.')
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/browse')
    router.refresh()
  }

  return (
    <div className="max-w-sm mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">Log in</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2" />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-black text-white rounded-md py-2.5 font-medium disabled:opacity-50">
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  )
}