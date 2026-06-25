import { motion } from 'framer-motion'
import { useMemo } from 'react'

const colors = ['#0D4436', '#A3E635', '#FF6B35', '#E6F2ED']

export function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1.4 + Math.random() * 0.8,
        color: colors[index % colors.length],
        rotate: Math.random() * 360,
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: 220, x: (Math.random() - 0.5) * 60, opacity: 0, rotate: piece.rotate }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: 'easeIn' }}
          className="absolute h-2 w-2 rounded-sm"
          style={{ left: `${piece.left}%`, backgroundColor: piece.color }}
        />
      ))}
    </div>
  )
}
