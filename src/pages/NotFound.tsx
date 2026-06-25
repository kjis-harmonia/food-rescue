import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D4436] px-6 text-center text-white">
      <p className="text-sm font-bold uppercase tracking-widest text-[#A3E635]">404</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight">このページは見つかりませんでした</h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
        お探しのページは削除されたか、URLが間違っている可能性があります。
      </p>
      <Link
        to="/"
        className="mt-8 rounded-2xl bg-[#A3E635] px-8 py-3.5 text-sm font-black text-[#0D4436] shadow-lg transition-all duration-200 active:scale-[0.97]"
      >
        ホームへ戻る
      </Link>
    </div>
  )
}
