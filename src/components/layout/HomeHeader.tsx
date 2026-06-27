import { useEffect, useState } from 'react'
import foodRescueLogo from '../../assets/food-rescue.png'

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HomeHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={[
        'sticky top-0 z-50 flex items-center justify-between px-4 py-2 transition-all duration-300',
        isScrolled ? 'border-b border-neutral-100 bg-white/90 backdrop-blur-md' : 'border-b border-neutral-100 bg-white',
      ].join(' ')}
    >
      <img
        src={foodRescueLogo}
        alt="FOOD RESCUE"
        className="h-9 w-auto shrink-0 object-contain"
      />
      <button type="button" className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] font-semibold text-neutral-600">
        現在地 広島市中区
        <ChevronDownIcon />
      </button>
    </header>
  )
}
