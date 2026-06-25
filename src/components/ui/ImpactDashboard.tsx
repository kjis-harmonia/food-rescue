interface ImpactDashboardProps {
  mealsSaved: number
  co2SavedKg: number
  moneySavedYen: number
}

function PlateIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  )
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 19c-3-6-1-13.5 9-14.5 6-.6 8.5 4 7 9-1.5 5.5-9 8-16 5.5Z" />
      <path d="M6.5 17C9.5 12 12.5 8.5 18 5.5" strokeLinecap="round" />
    </svg>
  )
}

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v9M9.5 9.3c0-1 1-1.8 2.5-1.8s2.5.7 2.5 1.6c0 2.4-5 1.3-5 3.8 0 .9 1 1.6 2.5 1.6s2.5-.8 2.5-1.8" strokeLinecap="round" />
    </svg>
  )
}

export function ImpactDashboard({ mealsSaved, co2SavedKg, moneySavedYen }: ImpactDashboardProps) {
  const stats = [
    {
      key: 'meals',
      icon: <PlateIcon />,
      value: mealsSaved.toLocaleString('ja-JP'),
      unit: '食',
      label: '救った食事',
      iconBg: 'bg-[#0D4436]',
      glow: 'bg-[#9FD7BD]',
    },
    {
      key: 'co2',
      icon: <LeafIcon />,
      value: co2SavedKg.toFixed(1),
      unit: 'kg',
      label: '削減したCO2',
      iconBg: 'bg-[#0D4436]',
      glow: 'bg-[#9FD7BD]',
    },
    {
      key: 'money',
      icon: <CoinIcon />,
      value: moneySavedYen.toLocaleString('ja-JP'),
      unit: '円',
      label: '節約できた金額',
      iconBg: 'bg-[#FF6B35]',
      glow: 'bg-[#FFCBB0]',
    },
  ]

  return (
    <section>
      <p className="mb-3.5 text-[15px] font-bold tracking-tight text-neutral-800">あなたのレスキューインパクト</p>
      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-3.5 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(13,68,54,0.06)]"
          >
            <span
              className={`pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full opacity-25 blur-md ${stat.glow}`}
            />
            <div className={`relative z-10 mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-white ${stat.iconBg}`}>
              {stat.icon}
            </div>
            <span className="relative z-10 mb-1 block tracking-tight">
              <span className="text-3xl font-black text-neutral-800">{stat.value}</span>
              <span className="ml-0.5 text-sm font-bold text-neutral-500">{stat.unit}</span>
            </span>
            <span className="relative z-10 block text-xs font-medium leading-tight text-neutral-400">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
