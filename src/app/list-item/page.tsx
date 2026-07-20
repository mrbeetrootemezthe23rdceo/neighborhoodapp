'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CATEGORIES, CONDITIONS } from '@/lib/categories'
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr'

const selectClass =
  'h-11 w-full rounded-sm border border-ink bg-canvas px-4 text-base text-ink'

export default function ListItemPage() {
  const [listingType, setListingType] = useState<'offer' | 'request'>('offer')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [condition, setCondition] = useState<string>(CONDITIONS[0])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      setLoading(false)
      setError('You need to be logged in to do this.')
      return
    }

    const userId = userData.user.id
    let photoUrl: string | null = null

    if (listingType === 'offer' && photoFile) {
      const filePath = `${userId}/${Date.now()}-${photoFile.name}`

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(filePath, photoFile)

      if (uploadError) {
        setLoading(false)
        setError(`Photo upload failed: ${uploadError.message}`)
        return
      }

      const { data: publicUrlData } = supabase.storage.from('item-photos').getPublicUrl(filePath)
      photoUrl = publicUrlData.publicUrl
    }

    const { error: insertError } = await supabase.from('items').insert({
      owner_id: userId,
      title,
      description,
      category,
      condition: listingType === 'offer' ? condition : null,
      photo_url: photoUrl,
      listing_type: listingType,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="mx-auto max-w-lg px-8 py-10">
        <button
          onClick={() => router.push('/')}
          className="mb-5 inline-flex cursor-pointer items-center gap-1.5 text-sm text-body"
        >
          <ArrowLeftIcon size={16} />
          Back
        </button>

        <h1 className="text-3xl font-medium text-ink">List an item</h1>
        <p className="mt-1.5 text-base text-body">Share something, or ask for something you need</p>

        <div className="mt-7 flex gap-1 rounded-md bg-canvas-soft p-1">
          <button
            type="button"
            onClick={() => setListingType('offer')}
            className={`flex-1 cursor-pointer rounded-sm py-2.5 text-sm font-medium ${
              listingType === 'offer' ? 'bg-ink text-canvas-soft' : 'text-body-mid'
            }`}
          >
            I have this to lend
          </button>
          <button
            type="button"
            onClick={() => setListingType('request')}
            className={`flex-1 cursor-pointer rounded-sm py-2.5 text-sm font-medium ${
              listingType === 'request' ? 'bg-ink text-canvas-soft' : 'text-body-mid'
            }`}
          >
            I&apos;m looking for this
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">{listingType === 'offer' ? 'Item name' : 'What are you looking for?'}</Label>
            <Input
              id="title"
              type="text"
              placeholder={listingType === 'offer' ? 'e.g. Cordless drill' : 'e.g. Bluetooth speaker'}
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
              placeholder="Any details worth mentioning"
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="photo">Photo (optional)</Label>
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

          <Button type="submit" disabled={loading} className="h-12 w-full cursor-pointer justify-center text-base">
            {loading ? 'Posting...' : listingType === 'offer' ? 'List item' : 'Post request'}
          </Button>
        </form>
      </div>
    </div>
  )
}
