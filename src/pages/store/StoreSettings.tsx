import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { CURRENT_STORE_ID } from '../../lib/session'

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const settingsItems = ['振込口座', '通知設定', 'スタッフ管理']

export function StoreSettings() {
  const { getStoreById, updateStoreSettings } = useData()
  const store = getStoreById(CURRENT_STORE_ID)

  const [openTime, setOpenTime] = useState(store?.openTime ?? '09:00')
  const [closeTime, setCloseTime] = useState(store?.closeTime ?? '21:00')

  const handleSaveHours = () => {
    updateStoreSettings(CURRENT_STORE_ID, { openTime, closeTime })
  }

  const handleTogglePause = () => {
    if (!store) return
    updateStoreSettings(CURRENT_STORE_ID, { isPaused: !store.isPaused })
  }

  return (
    <div className="px-4 pb-32 pt-5">
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">店舗設定</p>
      <h1 className="mt-0.5 text-xl font-black tracking-tight text-neutral-900">{store?.name ?? 'BAKERY MORI'}</h1>

      <div className="mt-5 rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        <p className="text-sm font-black tracking-tight text-neutral-900">{store?.name ?? 'BAKERY MORI'}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">本人確認済み</span>
          <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-600">Stripe接続済み</span>
        </div>
        <p className="mt-3 text-xs font-bold text-neutral-400">次回振込予定額</p>
        <p className="mt-1 text-3xl font-black tracking-tighter text-[#0D4436]">¥18,420</p>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black tracking-tight text-neutral-900">店舗情報・営業時間</p>
            <p className="mt-0.5 text-xs font-medium text-neutral-500">受取受付の開始・終了時刻を設定</p>
          </div>
          <button
            type="button"
            onClick={handleTogglePause}
            aria-pressed={store?.isPaused ?? false}
            className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${store?.isPaused ? 'bg-red-400' : 'bg-neutral-200'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${store?.isPaused ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
        <p className="mt-1 text-[11px] font-bold text-neutral-400">
          {store?.isPaused ? '一時停止中（お客様には表示されません）' : '営業中'}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">開始時刻</span>
            <input
              type="time"
              value={openTime}
              onChange={(event) => setOpenTime(event.target.value)}
              className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-bold text-neutral-800 outline-none focus:border-[#0D4436]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">終了時刻</span>
            <input
              type="time"
              value={closeTime}
              onChange={(event) => setCloseTime(event.target.value)}
              className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-bold text-neutral-800 outline-none focus:border-[#0D4436]"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleSaveHours}
          className="mt-4 w-full cursor-pointer rounded-xl bg-[#0D4436] py-3 text-center text-xs font-black text-white transition-all duration-200 active:scale-[0.98]"
        >
          営業時間を保存
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        {settingsItems.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`flex w-full cursor-pointer items-center justify-between px-4 py-4 text-left transition-all duration-200 active:scale-[0.98] active:bg-neutral-50 ${index !== settingsItems.length - 1 ? 'border-b border-neutral-100' : ''}`}
          >
            <span className="text-sm font-bold text-neutral-800">{item}</span>
            <ChevronIcon />
          </button>
        ))}
      </div>

      <Link
        to="/"
        className="mt-6 block w-full cursor-pointer rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-neutral-500 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-200 active:scale-[0.98]"
      >
        お客様画面に切り替える
      </Link>
    </div>
  )
}
