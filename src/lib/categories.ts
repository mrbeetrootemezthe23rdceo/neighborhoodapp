import type { Icon } from "@phosphor-icons/react"
import {
  WrenchIcon,
  HammerIcon,
  PlantIcon,
  CookingPotIcon,
  SoccerBallIcon,
  TentIcon,
  BroomIcon,
  PlugIcon,
  PackageIcon,
} from "@phosphor-icons/react/dist/ssr"

export const CATEGORIES = [
  "Power Tools",
  "Hand Tools",
  "Garden",
  "Kitchen",
  "Sports & Outdoor",
  "Camping",
  "Household",
  "Electronics",
] as const

export const CONDITIONS = ["Like new", "Good", "Fair"] as const

const CATEGORY_ICONS: Record<string, Icon> = {
  "Power Tools": WrenchIcon,
  "Hand Tools": HammerIcon,
  Garden: PlantIcon,
  Kitchen: CookingPotIcon,
  "Sports & Outdoor": SoccerBallIcon,
  Camping: TentIcon,
  Household: BroomIcon,
  Electronics: PlugIcon,
}

export function categoryIcon(category: string): Icon {
  return CATEGORY_ICONS[category] ?? PackageIcon
}
