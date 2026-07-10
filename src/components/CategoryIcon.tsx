const ICON_MAP: Record<string, { emoji: string; bg: string }> = {
  'Power Tools': { emoji: '🔧', bg: '#FAECE7' },
  'Hand Tools': { emoji: '🔨', bg: '#F1EFE8' },
  'Garden': { emoji: '🌱', bg: '#EAF3DE' },
  'Kitchen': { emoji: '🍳', bg: '#EEEDFE' },
  'Sports & Outdoor': { emoji: '⚽', bg: '#FBEAF0' },
  'Camping': { emoji: '⛺', bg: '#E6F1FB' },
  'Household': { emoji: '🧹', bg: '#FAEEDA' },
  'Electronics': { emoji: '🔌', bg: '#E1F5EE' },
}

export default function CategoryIcon({ category, size = 68 }: { category: string; size?: number }) {
  const config = ICON_MAP[category] ?? { emoji: '📦', bg: '#F1EFE8' }
  return (
    <div
      style={{ width: size, height: size, background: config.bg, fontSize: size * 0.45 }}
      className="rounded-2xl flex items-center justify-center shrink-0"
    >
      {config.emoji}
    </div>
  )
}
