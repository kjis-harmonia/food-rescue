import type { ReactNode } from 'react'

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-14 w-9 items-center justify-center rounded-[10px] border-2 border-[#0D4436] bg-[#E6F2ED]">
      <span className="absolute top-1 h-0.5 w-2.5 rounded-full bg-[#0D4436]/40" />
      {children}
    </div>
  )
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0D4436" strokeWidth="2">
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M19 19l-4-4" strokeLinecap="round" />
    </svg>
  )
}

function CalendarGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0D4436" strokeWidth="2">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8 3.5v3M16 3.5v3" strokeLinecap="round" />
      <path d="M9 14.5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BagGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0D4436" strokeWidth="2">
      <path d="M6 8h12l-1 11.5a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
    </svg>
  )
}

const steps = [
  { number: '1', title: '探す', glyph: <SearchGlyph /> },
  { number: '2', title: '予約する', glyph: <CalendarGlyph /> },
  { number: '3', title: '受け取る', glyph: <BagGlyph /> },
]

export function HowItWorks() {
  return (
    <section>
      <p className="mb-4 text-[15px] font-bold tracking-tight text-neutral-800">かんたん3ステップ</p>
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-1 items-center">
            <div className="flex flex-1 flex-col items-center gap-2 text-center">
              <PhoneFrame>{step.glyph}</PhoneFrame>
              <p className="text-xs font-semibold text-neutral-700">
                <span className="mr-1 text-[#0D4436]">{step.number}</span>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#D1D5CD" strokeWidth="2" className="mb-5 shrink-0">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
