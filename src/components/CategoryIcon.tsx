const ICON_MAP: Record<string, string> = {
  'Power Tools': '🔧',
  'Hand Tools': '🔨',
  'Garden': '🌱',
  'Kitchen': '🍳',
  'Sports & Outdoor': '⚽',
  'Camping': '⛺',
  'Household': '🧹',
  'Electronics': '🔌',
}

export default function CategoryIcon({ category, size = 68 }: { category: string; size?: number }) {
  const emoji = ICON_MAP[category] ?? '📦'
  return (
    <div
      style={{ width: size, height: size, background: '#FFF3E8', fontSize: size * 0.45 }}
      className="rounded-2xl flex items-center justify-center shrink-0"
    >
      {emoji}
    </div>
  )
}
