import type { ComponentType } from 'react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

function DashboardIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.8" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.8" />
      <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.8" />
    </svg>
  )
}

function StoreIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 9.5 5.5 4h13L20 9.5" strokeLinejoin="round" />
      <path d="M4 9.5v9.5h16V9.5M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" strokeLinejoin="round" />
    </svg>
  )
}

function BoxIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3.5 8.5 12 4l8.5 4.5L12 13Z" strokeLinejoin="round" />
      <path d="M3.5 8.5V16l8.5 4.5 8.5-4.5V8.5M12 13v7.5" strokeLinejoin="round" />
    </svg>
  )
}

function ListIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="4.5" width="16" height="15" rx="2.5" />
      <path d="M8 9h8M8 13h8M8 17h5" strokeLinecap="round" />
    </svg>
  )
}

function ChartIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UsersIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.5-3.5 2.7-5.5 5.5-5.5s5 2 5.5 5.5" strokeLinecap="round" />
      <circle cx="17" cy="8.5" r="2.3" />
      <path d="M15.5 13.7c2 .2 3.6 1.8 4 5.3" strokeLinecap="round" />
    </svg>
  )
}

function HandshakeIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M2.5 12.5 7 8l3 2 2.5-2L17 11l4.5-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 8 4 11M17 11l3-2.5M9.5 12l2 2-2.2 2.2a1.6 1.6 0 0 1-2.3 0 1.6 1.6 0 0 1 0-2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BellIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6.5 10.2a5.5 5.5 0 0 1 11 0c0 5 2 5.4 2 6.8h-15c0-1.4 2-1.8 2-6.8ZM10 20h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ReportIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 13.5v-3l-2-.7a7.8 7.8 0 0 0-.7-1.6l.9-1.9-2.1-2.1-1.9.9a7.8 7.8 0 0 0-1.6-.7L10.5 2h-3l-.7 2.4a7.8 7.8 0 0 0-1.6.7l-1.9-.9-2.1 2.1.9 1.9a7.8 7.8 0 0 0-.7 1.6L0 10.5v3l2.4.7c.2.6.4 1.1.7 1.6l-.9 1.9 2.1 2.1 1.9-.9c.5.3 1 .5 1.6.7l.7 2.4h3l.7-2.4c.6-.2 1.1-.4 1.6-.7l1.9.9 2.1-2.1-.9-1.9c.3-.5.5-1 .7-1.6l2.4-.7Z" strokeLinecap="round" strokeLinejoin="round" transform="translate(2 0) scale(.83)" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

interface NavItem {
  label: string
  icon: ComponentType<{ className?: string }>
  to?: string
  end?: boolean
}

const navItems: NavItem[] = [
  { label: 'ダッシュボード', icon: DashboardIcon, to: '/admin', end: true },
  { label: '店舗一覧', icon: StoreIcon, to: '/admin/stores' },
  { label: '商品一覧', icon: BoxIcon, to: '/admin/products' },
  { label: '注文一覧', icon: ListIcon, to: '/admin/orders' },
  { label: '売上管理', icon: ChartIcon },
  { label: 'ユーザー管理', icon: UsersIcon },
  { label: '加盟申請', icon: HandshakeIcon },
  { label: 'お知らせ', icon: BellIcon },
  { label: 'レポート', icon: ReportIcon },
  { label: '設定', icon: SettingsIcon },
]

const mobileNavItems = [navItems[0], navItems[3], navItems[2], navItems[4]]

function NavRow({ item, variant }: { item: NavItem; variant: 'sidebar' | 'sheet' }) {
  const Icon = item.icon
  const content = (
    <>
      <Icon className="h-5 w-5" />
      <span className="text-sm font-bold">{item.label}</span>
    </>
  )

  if (!item.to) {
    return (
      <span className="flex cursor-not-allowed items-center gap-3 rounded-2xl px-4 py-3 text-neutral-300">
        {content}
        <span className="ml-auto rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-400">準備中</span>
      </span>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200',
          variant === 'sidebar' ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-neutral-700 hover:bg-neutral-50',
          isActive && variant === 'sidebar' ? 'bg-white/10 text-white' : '',
          isActive && variant === 'sheet' ? 'bg-[#E6F2ED] text-[#0D4436]' : '',
        ].join(' ')
      }
    >
      {content}
    </NavLink>
  )
}

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F9FA] md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-[#0D4436] md:fixed md:inset-y-0 md:flex">
        <div className="px-6 py-7">
          <p className="text-base font-black tracking-tight text-white">FOOD RESCUE</p>
          <p className="mt-0.5 text-xs font-medium text-white/50">フードレスキュー管理</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavRow key={item.label} item={item} variant="sidebar" />
          ))}
        </nav>
        <div className="m-3 flex items-center gap-3 rounded-2xl bg-white/5 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-xs font-bold text-white">
            FR
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white">FOOD RESCUE 本部</p>
            <p className="truncate text-[11px] text-white/50">運営管理者</p>
          </div>
        </div>
        <Link to="/" className="mx-3 mb-4 block rounded-2xl px-4 py-2.5 text-center text-xs font-bold text-white/60 hover:bg-white/5">
          ユーザー画面へ
        </Link>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-neutral-100 bg-white/90 px-3 py-3 backdrop-blur-md md:hidden">
        <div>
          <p className="text-sm font-black tracking-tight text-[#0D4436]">FOOD RESCUE</p>
          <p className="text-[10px] font-medium text-neutral-400">フードレスキュー管理</p>
        </div>
        <Link to="/" className="text-xs font-bold text-neutral-400">
          ユーザー画面へ
        </Link>
      </header>

      <main className="flex-1 pb-24 md:ml-64 md:pb-10">
        <Outlet />
      </main>

      {/* Floating action button (mobile) */}
      <Link
        to="/store/products/new"
        className="fixed bottom-24 right-4 z-40 flex items-center gap-1.5 rounded-full bg-[#0D4436] px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 active:scale-95 md:hidden"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        新規商品
      </Link>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-neutral-100 bg-white/95 px-3 py-2 backdrop-blur-md md:hidden [padding-bottom:env(safe-area-inset-bottom)]">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          if (!item.to) {
            return (
              <span key={item.label} className="flex min-h-11 flex-1 flex-col items-center justify-center gap-1 px-2 py-1 text-neutral-300">
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </span>
            )
          }
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-11 flex-1 flex-col items-center justify-center gap-1 px-2 py-1 transition-all duration-200 active:scale-[0.98] ${isActive ? 'text-[#0D4436]' : 'text-neutral-400'}`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </NavLink>
          )
        })}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex min-h-11 flex-1 flex-col items-center justify-center gap-1 px-2 py-1 text-neutral-400 transition-all duration-200 active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] font-bold">メニュー</span>
        </button>
      </nav>

      {menuOpen && (
        <div
          role="presentation"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm md:hidden"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[80vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-4 pb-8"
          >
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-sm font-black tracking-tight text-neutral-900">メニュー</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => (
                <div key={item.label} onClick={() => item.to && setMenuOpen(false)} role="presentation">
                  <NavRow item={item} variant="sheet" />
                </div>
              ))}
            </div>
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="mt-3 block rounded-2xl bg-neutral-50 px-4 py-3 text-center text-sm font-bold text-neutral-500"
            >
              ユーザー画面へ
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
