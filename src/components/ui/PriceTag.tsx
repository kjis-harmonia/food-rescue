interface PriceTagProps {
  amount: number
  size?: 'sm' | 'md' | 'lg'
  colorClassName?: string
}

const sizeClassMap: Record<NonNullable<PriceTagProps['size']>, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
}

export function PriceTag({ amount, size = 'md', colorClassName = 'text-[#0D4436]' }: PriceTagProps) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="text-xs font-normal text-neutral-400">¥</span>
      <span className={`font-extrabold tracking-tight ${sizeClassMap[size]} ${colorClassName}`}>
        {amount.toLocaleString('ja-JP')}
      </span>
    </span>
  )
}
