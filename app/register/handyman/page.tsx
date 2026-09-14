'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORY_OPTIONS = [
  'AC Repair',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'Appliance Repair',
]

export default function HandymanRegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [localities, setLocalities] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [bio, setBio] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (categories.length === 0) {
      setError('Select at least one service category.')
      return
    }
    if (!localities.trim()) {
      setError('Enter at least one locality you serve.')
      return
    }

    setLoading(true)

    // 1. Create the auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError || !signUpData.user) {
      setError(signUpError?.message ?? 'Sign up failed.')
      setLoading(false)
      return
    }

    const userId = signUpData.user.id

    // 2. Create the shared profile row
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      role: 'handyman',
      full_name: fullName,
      phone,
      whatsapp: whatsapp || null,
    })

    if (profileError) {
      setError(`Profile creation failed: ${profileError.message}`)
      setLoading(false)
      return
    }

    // 3. Create the handyman-specific details row
    const localityList = localities
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)

    const { error: detailsError } = await supabase.from('handyman_details').insert({
      profile_id: userId,
      categories,
      localities: localityList,
      years_experience: yearsExperience ? parseInt(yearsExperience, 10) : null,
      bio: bio || null,
    })

    if (detailsError) {
      setError(`Details creation failed: ${detailsError.message}`)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/register/handyman/success')
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="font-display text-2xl font-semibold mb-2">Register as a Handyman</h1>
      <p className="text-[var(--muted)] mb-6">
        List your services so ECR residents can find and book you directly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp (optional)</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Services you offer</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-sm border text-sm ${
                  categories.includes(cat)
                    ? 'bg-[var(--foreground)] text-white border-[var(--foreground)]'
                    : 'bg-white text-[var(--foreground)] border-[var(--border-hairline)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Localities you serve (comma-separated)
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Neelankarai, Injambakkam, Thiruvanmiyur"
            value={localities}
            onChange={(e) => setLocalities(e.target.value)}
            className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Years of experience (optional)
          </label>
          <input
            type="number"
            min={0}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Short bio (optional)</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
          />
        </div>

        {error && <p className="text-[var(--danger)] text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] text-white rounded-sm py-2.5 font-medium disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}
