import { createElement } from "react"
import { categoryIcon } from "@/lib/categories"

export default function CategoryIcon({
  category,
  size = 64,
  className = "",
}: {
  category: string
  size?: number
  className?: string
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md bg-canvas ${className}`}
      style={{ width: size, height: size }}
    >
      {createElement(categoryIcon(category), {
        size: Math.round(size * 0.42),
        className: "text-ink/70",
      })}
    </div>
  )
}
