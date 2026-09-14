'use client'

import { useEffect, useState } from 'react'
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

export default function EditHandymanProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [localities, setLocalities] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [bio, setBio] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: details } = await supabase
        .from('handyman_details')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name)
        setPhone(profile.phone)
        setWhatsapp(profile.whatsapp ?? '')
        setPhotoUrl(profile.photo_url)
      }
      if (details) {
        setCategories(details.categories)
        setLocalities(details.localities.join(', '))
        setYearsExperience(details.years_experience?.toString() ?? '')
        setBio(details.bio ?? '')
      }

      setLoading(false)
    }
    load()
  }, [])

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setUploading(true)
    setError(null)

    const filePath = userId + '/' + Date.now() + '-' + file.name

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    setPhotoUrl(publicUrlData.publicUrl)
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setError(null)
    setSaving(true)

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        whatsapp: whatsapp || null,
        photo_url: photoUrl,
      })
      .eq('id', userId)

    if (profileError) {
      setError(profileError.message)
      setSaving(false)
      return
    }

    const localityList = localities
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)

    const { error: detailsError } = await supabase
      .from('handyman_details')
      .update({
        categories,
        localities: localityList,
        years_experience: yearsExperience ? parseInt(yearsExperience, 10) : null,
        bio: bio || null,
      })
      .eq('profile_id', userId)

    if (detailsError) {
      setError(detailsError.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  if (loading) {
    return <div className="max-w-xl mx-auto py-16 px-4">Loading...</div>
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="font-display text-2xl font-semibold mb-6">Edit Your Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Photo</label>
          <div className="flex items-center gap-4">
            {photoUrl && (
              <img src={photoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-[var(--border-hairline)]" />
            )}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
          </div>
          {uploading && <p className="text-sm text-[var(--muted)] mt-1">Uploading...</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone number</label>
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white" />
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
                className={"px-3 py-1.5 rounded-sm border text-sm " + (categories.includes(cat) ? "bg-[var(--foreground)] text-white border-[var(--foreground)]" : "bg-white text-[var(--foreground)] border-[var(--border-hairline)]")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Localities you serve (comma-separated)</label>
          <input type="text" required value={localities} onChange={(e) => setLocalities(e.target.value)} className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Years of experience</label>
          <input type="number" min={0} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Short bio</label>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white" />
        </div>

        {error && <p className="text-[var(--danger)] text-sm">{error}</p>}
        {saved && <p className="text-[var(--success)] text-sm">Saved.</p>}

        <button type="submit" disabled={saving} className="bg-[var(--accent)] text-white rounded-sm px-5 py-2 font-medium disabled:opacity-50">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
