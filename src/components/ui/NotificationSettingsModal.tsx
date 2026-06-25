import { useEffect, useState } from 'react'
import { Sheet } from './Sheet'
import { ToggleSwitch } from './ToggleSwitch'

interface NotificationSettingsModalProps {
  open: boolean
  onClose: () => void
}

interface NotificationPrefs {
  newProduct: boolean
  favoriteStore: boolean
  pickupReminder: boolean
  announcements: boolean
}

const STORAGE_KEY = 'food-rescue:notification-prefs'

const defaultPrefs: NotificationPrefs = {
  newProduct: true,
  favoriteStore: true,
  pickupReminder: true,
  announcements: true,
}

const items: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: 'newProduct', label: '新商品通知', description: '近くのお店が新しいレスキュー品を出品したとき' },
  { key: 'favoriteStore', label: 'お気に入り店舗通知', description: 'お気に入り店舗の新着・再販情報' },
  { key: 'pickupReminder', label: '予約リマインド', description: '受取時間の30分前にお知らせ' },
  { key: 'announcements', label: 'お知らせ通知', description: '運営からのお知らせ・クーポン情報' },
]

export function NotificationSettingsModal({ open, onClose }: NotificationSettingsModalProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setPrefs(JSON.parse(saved))
      } catch {
        // ignore malformed local data
      }
    }
  }, [])

  const handleToggle = (key: keyof NotificationPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return (
    <Sheet open={open} title="通知設定" onClose={onClose}>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3 border-b border-neutral-100 py-4 last:border-none">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-neutral-900">{item.label}</p>
              <p className="mt-0.5 text-xs text-neutral-400">{item.description}</p>
            </div>
            <ToggleSwitch checked={prefs[item.key]} onChange={(value) => handleToggle(item.key, value)} label={item.label} />
          </div>
        ))}
      </div>
    </Sheet>
  )
}
