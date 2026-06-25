export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-neutral-100 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.015)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <div className="h-full w-full animate-pulse bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_200%]" />
      </div>
      <div className="pt-7 px-1 pb-2">
        <div className="mb-2 h-2.5 w-16 animate-pulse rounded-full bg-neutral-100" />
        <div className="mb-2.5 h-4 w-3/4 animate-pulse rounded-full bg-neutral-100" />
        <div className="mb-3 h-3 w-1/2 animate-pulse rounded-full bg-neutral-100" />
        <div className="flex items-center justify-between border-t border-neutral-50 pt-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-neutral-100" />
          <div className="h-6 w-14 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      </div>
    </div>
  )
}
