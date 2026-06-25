import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { CURRENT_STORE_ID } from '../../lib/session'
import { NotificationPanel } from '../ui/NotificationPanel'

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6.5 10.2a5.5 5.5 0 0 1 11 0c0 5 2 5.4 2 6.8h-15c0-1.4 2-1.8 2-6.8ZM10 20h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HomeIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9.5h12V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TagIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M11.5 4h6a1 1 0 0 1 1 1v6l-9.3 9.3a1 1 0 0 1-1.4 0L4 17.5a1 1 0 0 1 0-1.4Z" strokeLinejoin="round" />
      <circle cx="15.2" cy="8.8" r="1.4" />
    </svg>
  )
}

function ClipboardIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="5.5" y="4.5" width="13" height="16" rx="2" />
      <path d="M9 4.5h6v2.5H9z" />
      <path d="M8.5 12h7M8.5 15.5h7" strokeLinecap="round" />
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

const navItems = [
  { to: '/store', label: 'ホーム', icon: HomeIcon, end: true },
  { to: '/store/products', label: '出品中', icon: TagIcon, end: false },
  { to: '/store/reservations', label: '予約管理', icon: ClipboardIcon, end: false },
  { to: '/store/settings', label: '店舗設定', icon: SettingsIcon, end: false },
]

export function StoreLayout() {
  const { getStoreById, notifications } = useData()
  const store = getStoreById(CURRENT_STORE_ID)
  const initials = (store?.name ?? 'FR').slice(0, 2).toUpperCase()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const unreadCount = notifications.filter((notification) => notification.audience === 'store' && !notification.read).length

  return (
    <div className="min-h-screen bg-[#FBFBFA] pb-24">
      <header className="flex w-full flex-col gap-4 rounded-b-[2rem] bg-[#0D4436] px-4 pb-6 pt-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 font-mono text-xs font-bold text-white/80">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight">{store?.name ?? 'FOOD RESCUE'}</span>
              <span className="font-mono text-[10px] tracking-widest text-white/60">{CURRENT_STORE_ID.toUpperCase()}</span>
            </div>
          </div>
          <div className="relative flex items-center gap-3">
            <button
              type="button"
              aria-label="通知"
              onClick={() => setNotificationsOpen((current) => !current)}
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/90 transition-all duration-200 hover:bg-white/10 active:scale-[0.98] active:opacity-90"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#A3E635] px-1 font-mono text-[9px] font-bold text-[#0D4436] ring-2 ring-[#0D4436]">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel audience="store" open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            <Link
              to="/store/products/new"
              className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-black text-[#0D4436] shadow-sm transition-all duration-200 hover:bg-neutral-100 active:scale-[0.98] active:opacity-90"
            >
              ＋ 出品する
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between border-t border-neutral-100 bg-white/95 px-6 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-11 cursor-pointer flex-col items-center justify-center gap-1 px-2 py-1 transition-all duration-200 active:scale-[0.98] active:opacity-90 ${isActive ? 'text-[#0D4436]' : 'text-neutral-400'}`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="mt-0.5 text-[9px] font-bold tracking-tighter">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
