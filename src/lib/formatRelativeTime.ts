export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.round(diffMs / 60000)

  if (diffMin < 1) return 'now'
  if (diffMin < 60) return `${diffMin}m`

  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h`

  const diffDay = Math.round(diffHr / 24)
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay}d`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
