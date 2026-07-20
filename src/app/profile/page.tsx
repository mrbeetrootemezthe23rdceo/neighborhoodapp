'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeftIcon, SignOutIcon, EyeIcon, EyeSlashIcon } from '@phosphor-icons/react/dist/ssr'

type Resident = {
  name: string | null
  apartment_no: string | null
  phone: string | null
}

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [resident, setResident] = useState<Resident | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  const [name, setName] = useState('')
  const [apartmentNo, setApartmentNo] = useState('')
  const [phone, setPhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSaved, setProfileSaved] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }
      setUserId(userData.user.id)
      setEmail(userData.user.email ?? null)

      const { data } = await supabase
        .from('residents')
        .select('name, apartment_no, phone')
        .eq('id', userData.user.id)
        .single()

      setResident(data)
      setName(data?.name ?? '')
      setApartmentNo(data?.apartment_no ?? '')
      setPhone(data?.phone ?? '')
      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const profileUnchanged =
    name === (resident?.name ?? '') &&
    apartmentNo === (resident?.apartment_no ?? '') &&
    phone === (resident?.phone ?? '')

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    setProfileSaving(true)
    setProfileError(null)
    setProfileSaved(false)

    const { error } = await supabase
      .from('residents')
      .update({ name, apartment_no: apartmentNo, phone })
      .eq('id', userId)

    setProfileSaving(false)

    if (error) {
      setProfileError(error.message)
      return
    }

    setResident({ name, apartment_no: apartmentNo, phone })
    setProfileSaved(true)
  }

  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPassword || newPassword !== confirmPassword) return

    setPasswordSaving(true)
    setPasswordError(null)
    setPasswordSaved(false)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setPasswordSaving(false)

    if (error) {
      setPasswordError(error.message)
      return
    }

    setNewPassword('')
    setConfirmPassword('')
    setPasswordSaved(true)
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-body-mid">Loading...</div>
  }

  const initial = resident?.name?.trim()?.[0]?.toUpperCase() ?? email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="mx-auto max-w-md px-8 py-10">
        <button
          onClick={() => router.push('/')}
          className="mb-5 inline-flex cursor-pointer items-center gap-1.5 text-sm text-body"
        >
          <ArrowLeftIcon size={16} />
          Back
        </button>

        <div className="rounded-md bg-canvas-soft p-8">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-ink text-xl font-semibold text-canvas-soft">
              {initial}
            </div>
            <div>
              <p className="text-xl font-semibold text-ink">{resident?.name || 'Unnamed neighbor'}</p>
              <p className="text-sm text-body-mid">{email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-7 flex flex-col gap-4 border-t border-border-soft pt-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setProfileSaved(false)
                }}
                required
                className="h-11 rounded-sm border-ink px-4 text-base"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="apartmentNo">Apartment</Label>
              <Input
                id="apartmentNo"
                type="text"
                value={apartmentNo}
                onChange={(e) => {
                  setApartmentNo(e.target.value)
                  setProfileSaved(false)
                }}
                required
                className="h-11 rounded-sm border-ink px-4 text-base"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setProfileSaved(false)
                }}
                className="h-11 rounded-sm border-ink px-4 text-base"
              />
            </div>

            <Button
              type="submit"
              variant="outline"
              disabled={profileSaving || !name.trim() || !apartmentNo.trim() || profileUnchanged}
              className="h-11 cursor-pointer justify-center text-base"
            >
              {profileSaving ? 'Saving...' : 'Save'}
            </Button>

            {profileError && <p className="text-sm text-destructive">{profileError}</p>}
            {profileSaved && <p className="text-sm text-primary">Profile updated.</p>}
          </form>

          <form onSubmit={handleSavePassword} className="mt-6 flex flex-col gap-4 border-t border-border-soft pt-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">New password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setPasswordSaved(false)
                  }}
                  minLength={6}
                  className="h-11 rounded-sm border-ink px-4 pr-11 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-ink/60"
                >
                  {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setPasswordSaved(false)
                }}
                required
                minLength={6}
                className="h-11 rounded-sm border-ink px-4 text-base"
              />
              {passwordsMismatch && <p className="text-sm text-destructive">Passwords don&apos;t match.</p>}
            </div>

            <p className="text-sm text-body-mid">Enter a new password to change it. At least 6 characters.</p>

            <Button
              type="submit"
              variant="outline"
              disabled={passwordSaving || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="h-11 cursor-pointer justify-center text-base"
            >
              {passwordSaving ? 'Saving...' : 'Save'}
            </Button>

            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            {passwordSaved && <p className="text-sm text-primary">Password updated.</p>}
          </form>

          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-8 h-12 w-full cursor-pointer justify-center gap-1.5 text-base"
          >
            <SignOutIcon size={18} />
            {loggingOut ? 'Logging out...' : 'Log out'}
          </Button>
        </div>
      </div>
    </div>
  )
}
