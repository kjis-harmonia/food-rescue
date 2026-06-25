import { categoryOptions } from '../../lib/categories'
import type { StoreCategory } from '../../lib/types'
import { categoryIcons } from './CategoryChips'

interface CategoryTabsProps {
  active: StoreCategory | 'all'
  onChange: (category: StoreCategory | 'all') => void
}

function AllIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex space-x-6 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categoryOptions.map((category) => {
        const isActive = active === category.key
        const Icon = category.key === 'all' ? AllIcon : categoryIcons[category.key]

        return (
          <button
            key={category.key}
            type="button"
            onClick={() => onChange(category.key)}
            className={[
              'flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-1 transition-all duration-300 ease-out',
              isActive
                ? 'scale-105 border-[#0D4436] font-bold text-[#0D4436]'
                : 'border-transparent font-medium text-neutral-400',
            ].join(' ')}
          >
            <Icon />
            <span className="whitespace-nowrap text-xs">{category.label}</span>
          </button>
        )
      })}
    </div>
  )
}
