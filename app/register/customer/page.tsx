'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CustomerRegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError || !signUpData.user) {
      setError(signUpError?.message ?? 'Sign up failed.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: signUpData.user.id,
      role: 'customer',
      full_name: fullName,
      phone,
      whatsapp: whatsapp || null,
    })

    if (profileError) {
      setError('Profile creation failed: ' + profileError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/browse')
  }

  return (
    <div className="max-w-sm mx-auto py-16 px-4">
      <h1 className="font-display text-2xl font-semibold mb-2">Create your account</h1>
      <p className="text-[var(--muted)] mb-6 text-sm">
        Sign up to book handymen in ECR, Chennai.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone number</label>
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp (optional)</label>
          <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white" />
        </div>

        {error && <p className="text-[var(--danger)] text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-[var(--accent)] text-white rounded-sm py-2.5 font-medium disabled:opacity-50">
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </div>
  )
}
