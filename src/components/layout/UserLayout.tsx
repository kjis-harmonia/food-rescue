import { NavLink, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'ホーム' },
  { to: '/products', label: 'レスキュー' },
  { to: '/bag', label: 'マイバッグ' },
  { to: '/mypage', label: 'マイページ' },
]

const hiddenNavPattern = /^\/products\/[^/]+/

export function UserLayout() {
  const location = useLocation()
  const hideNav = hiddenNavPattern.test(location.pathname)

  return (
    <div className="app-shell bg-[#F4F6F3]">
      <Outlet />
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-100 bg-white/90 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md [padding-bottom:env(safe-area-inset-bottom)]">
          <div className="mx-auto flex w-full max-w-[480px] px-2 pt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'flex-1 min-h-11 rounded-2xl py-2.5 text-center text-[11px] font-semibold transition-all duration-300',
                    isActive ? 'bg-[#E6F2ED] text-[#0D4436]' : 'text-[#8C9892]',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
