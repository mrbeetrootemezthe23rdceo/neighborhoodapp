import CategoryIcon from '@/components/CategoryIcon'

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
    <a
      href={`/item/${item.id}`}
      className="rounded-xl overflow-hidden block transition-colors bg-white cursor-pointer"
      style={{
        border: item.listing_type === 'request' ? '2px dashed #FDBA74' : '1px solid #FED7AA',
      }}
    >
      <div className="h-32 flex items-center justify-center text-xs relative" style={{ background: '#FFF3E8' }}>
        {item.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <CategoryIcon category={item.category} size={48} />
        )}
        {item.listing_type === 'request' && (
          <span
            className="absolute top-2 left-2 text-white text-[11px] px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#9A3412' }}
          >
            Looking for
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-base font-semibold" style={{ color: '#431407' }}>{item.title}</p>
        <p className="text-sm mt-1" style={{ color: '#9A3412' }}>
          {item.category} · {item.residents?.apartment_no ?? 'Unknown'}
        </p>
      </div>
    </a>
  )
}
