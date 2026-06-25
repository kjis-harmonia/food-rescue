import type { ComponentType } from 'react'
import { categoryOptions } from '../../lib/categories'
import type { StoreCategory } from '../../lib/types'

interface CategoryChipsProps {
  active: StoreCategory | 'all'
  onChange: (category: StoreCategory | 'all') => void
}

function BreadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 20V11a7 7 0 0 1 14 0v9Z" />
      <path d="M5 20h14" strokeLinecap="round" />
    </svg>
  )
}

function CupIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 9h11v6a5.5 5.5 0 0 1-11 0Z" />
      <path d="M16 10.5h1.5a2 2 0 0 1 0 4H16" />
      <path d="M8 5.5c0 .8.8 1-.5 2.2S6.5 9 6.5 9M12 5.5c0 .8.8 1-.5 2.2S10.5 9 10.5 9" strokeLinecap="round" />
    </svg>
  )
}

function BowlIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 11h16a8 8 0 0 1-16 0Z" />
      <path d="M9 11c0-2.5.5-5 1.5-6.5M15 11c0-2.5-.5-5-1.5-6.5" strokeLinecap="round" />
    </svg>
  )
}

function LeafBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 19c-3-6-1-13.5 9-14.5 6-.6 8.5 4 7 9-1.5 5.5-9 8-16 5.5Z" />
      <path d="M6.5 17C9.5 12 12.5 8.5 18 5.5" strokeLinecap="round" />
    </svg>
  )
}

function CarrotIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M11 13 4 20M11 13c2-4 6-7 9-7-1 3-3 5-5 6-1.5.7-2.7 1-4 1Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 4.5 18 6M18.5 6.5l1 1" strokeLinecap="round" />
    </svg>
  )
}

export const categoryIcons: Record<StoreCategory, ComponentType> = {
  bakery: BreadIcon,
  cafe: CupIcon,
  restaurant: BowlIcon,
  deli: LeafBadgeIcon,
  grocery: CarrotIcon,
}

export function CategoryChips({ active, onChange }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categoryOptions.map((category) => {
        const isActive = active === category.key
        const Icon = category.key === 'all' ? null : categoryIcons[category.key]

        if (isActive) {
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onChange(category.key)}
              className="shrink-0 whitespace-nowrap rounded-full bg-[#0D4436] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-300"
            >
              {category.label}
            </button>
          )
        }

        return (
          <button
            key={category.key}
            type="button"
            onClick={() => onChange(category.key)}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-200/70 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-all duration-300 hover:border-[#0D4436]/40"
          >
            {Icon && <Icon />}
            {category.label}
          </button>
        )
      })}
    </div>
  )
}
