import { useEffect, useState } from 'react'
import { secondsUntilTime } from '../../lib/format'

function fmt(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface Props {
  pickupEnd: string   // "HH:MM"
  variant?: 'card' | 'featured'
}

export function LiveCountdown({ pickupEnd, variant = 'card' }: Props) {
  const [secs, setSecs] = useState(() => secondsUntilTime(pickupEnd))

  useEffect(() => {
    const id = setInterval(() => setSecs(secondsUntilTime(pickupEnd)), 1000)
    return () => clearInterval(id)
  }, [pickupEnd])

  const isUrgent = secs <= 3600      // < 1 hour
  const isCritical = secs <= 600     // < 10 min
  const label = secs <= 0 ? 'まもなく終了' : isUrgent ? fmt(secs) : `あと${Math.floor(secs / 3600)}時間`

  if (variant === 'featured') {
    return (
      <span
        className={[
          'rounded-full px-3 py-1 text-xs font-black text-white',
          isCritical ? 'animate-pulse bg-red-600' : 'bg-red-600',
        ].join(' ')}
      >
        {isUrgent ? `⏱ ${label}` : `🔥 ${label}`}
      </span>
    )
  }

  return (
    <span
      className={[
        'rounded-full px-2 py-1 text-[10px] font-black text-white backdrop-blur-sm',
        isCritical ? 'animate-pulse bg-red-600' : isUrgent ? 'bg-red-600/90' : 'bg-red-600/80',
      ].join(' ')}
    >
      {isUrgent ? `⏱ ${label}` : `⏰ ${label}`}
    </span>
  )
}
