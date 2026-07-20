import Link from 'next/link'
import CategoryIcon from '@/components/CategoryIcon'
import { Badge } from '@/components/ui/badge'

export type Item = {
  id: string
  title: string
  category: string
  condition: string | null
  photo_url: string | null
  listing_type: 'offer' | 'request'
  residents: { name: string; apartment_no: string } | null
}

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/item/${item.id}`}
      className={`block cursor-pointer overflow-hidden rounded-md border bg-canvas-soft p-4 ${
        item.listing_type === 'request' ? 'border-dashed border-mute' : 'border-border-soft'
      }`}
    >
      <div className="relative flex h-35 items-center justify-center overflow-hidden rounded-sm bg-canvas">
        {item.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo_url} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <CategoryIcon category={item.category} size={48} className="bg-transparent" />
        )}
        {item.listing_type === 'request' && (
          <Badge className="absolute top-2 left-2" variant="secondary">
            Looking for
          </Badge>
        )}
      </div>
      <div className="mt-2.5 flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-ink">{item.title}</p>
          <p className="mt-0.5 text-sm text-body-mid">{item.category}</p>
        </div>
        <p className="shrink-0 text-xs whitespace-nowrap text-body-mid">
          {item.residents?.apartment_no ? `Apt ${item.residents.apartment_no}` : 'Unknown'}
        </p>
      </div>
    </Link>
  )
}
