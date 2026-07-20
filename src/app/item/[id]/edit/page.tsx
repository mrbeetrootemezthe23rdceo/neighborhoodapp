'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CATEGORIES, CONDITIONS } from '@/lib/categories'

const selectClass =
  'h-11 w-full rounded-sm border border-ink bg-canvas px-4 text-base text-ink'

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [listingType, setListingType] = useState<'offer' | 'request'>('offer')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [condition, setCondition] = useState<string>(CONDITIONS[0])
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('items')
        .select('title, description, category, condition, photo_url, owner_id, listing_type')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Could not load this listing.')
        setLoading(false)
        return
      }

      if (data.owner_id !== userData.user.id) {
        router.push('/')
        return
      }

      setTitle(data.title)
      setDescription(data.description ?? '')
      setCategory(data.category)
      setCondition(data.condition ?? CONDITIONS[0])
      setCurrentPhotoUrl(data.photo_url)
      setOwnerId(data.owner_id)
      setListingType(data.listing_type)
      setLoading(false)
    }
    load()
  }, [id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ownerId) return

    setSaving(true)
    setError(null)

    let photoUrl = currentPhotoUrl

    if (listingType === 'offer' && photoFile) {
      const filePath = `${ownerId}/${Date.now()}-${photoFile.name}`

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(filePath, photoFile)

      if (uploadError) {
        setSaving(false)
        setError(`Photo upload failed: ${uploadError.message}`)
        return
      }

      const { data: publicUrlData } = supabase.storage.from('item-photos').getPublicUrl(filePath)
      photoUrl = publicUrlData.publicUrl
    }

    const { error: updateError } = await supabase
      .from('items')
      .update({
        title,
        description,
        category,
        condition: listingType === 'offer' ? condition : null,
        photo_url: listingType === 'offer' ? photoUrl : null,
      })
      .eq('id', id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push(`/item/${id}`)
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-body-mid">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="mx-auto max-w-lg px-8 py-10">
        <h1 className="text-3xl font-medium text-ink">Edit listing</h1>
        <p className="mt-1.5 text-base text-body">
          {listingType === 'offer' ? "Update the details of what you're lending" : "Update what you're looking for"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-11 rounded-sm border-ink px-4 text-base"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-sm border-ink px-4 py-3 text-base"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {listingType === 'offer' && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="condition">Condition</Label>
                <select
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className={selectClass}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {currentPhotoUrl && !photoFile && (
                <div className="h-32 w-32 overflow-hidden rounded-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentPhotoUrl} alt={title} className="h-full w-full object-cover" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="photo">{currentPhotoUrl ? 'Replace photo (optional)' : 'Photo (optional)'}</Label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-body file:mr-3 file:cursor-pointer file:rounded-sm file:border file:border-ink file:bg-canvas file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/item/${id}`)}
              className="h-12 flex-1 cursor-pointer justify-center text-base"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="h-12 flex-1 cursor-pointer justify-center text-base">
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
