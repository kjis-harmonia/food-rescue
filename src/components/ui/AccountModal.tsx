import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Sheet } from './Sheet'

interface AccountModalProps {
  open: boolean
  onClose: () => void
}

interface AccountInfo {
  name: string
  email: string
  phone: string
}

const STORAGE_KEY = 'food-rescue:account-info'

const defaultAccount: AccountInfo = {
  name: '平田 慶一郎',
  email: 'keiichiro.hirata@example.com',
  phone: '090-1234-5678',
}

export function AccountModal({ open, onClose }: AccountModalProps) {
  const navigate = useNavigate()
  const [account, setAccount] = useState<AccountInfo>(defaultAccount)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setAccount(JSON.parse(saved))
      } catch {
        // ignore malformed local data
      }
    }
  }, [])

  const updateField = (field: keyof AccountInfo, value: string) => {
    const next = { ...account, [field]: value }
    setAccount(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const handlePasswordSubmit = () => {
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setPasswordMessage('すべての項目を入力してください。')
      return
    }
    if (passwordForm.next.length < 8) {
      setPasswordMessage('新しいパスワードは8文字以上で入力してください。')
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage('確認用パスワードが一致しません。')
      return
    }
    setPasswordMessage('✓ パスワードを変更しました。')
    setPasswordForm({ current: '', next: '', confirm: '' })
    window.setTimeout(() => setIsPasswordOpen(false), 1200)
  }

  const handleLogout = () => {
    void supabase.auth.signOut()
    onClose()
    navigate('/')
  }

  return (
    <Sheet open={open} title="アカウント情報" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">ユーザー名</span>
          <input
            value={account.name}
            onChange={(event) => updateField('name', event.target.value)}
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-bold text-neutral-900 outline-none focus:border-[#0D4436]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">メールアドレス</span>
          <input
            type="email"
            value={account.email}
            onChange={(event) => updateField('email', event.target.value)}
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-[#0D4436]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">電話番号</span>
          <input
            value={account.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-[#0D4436]"
          />
        </label>

        <button
          type="button"
          onClick={() => setIsPasswordOpen((current) => !current)}
          className="mt-2 w-full rounded-xl bg-neutral-100 py-3 text-center text-sm font-bold text-neutral-700"
        >
          パスワードを変更
        </button>

        {isPasswordOpen && (
          <div className="rounded-2xl border border-neutral-100 bg-white p-4">
            <div className="flex flex-col gap-3">
              <input
                type="password"
                value={passwordForm.current}
                onChange={(event) => setPasswordForm((current) => ({ ...current, current: event.target.value }))}
                placeholder="現在のパスワード"
                className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#0D4436]"
              />
              <input
                type="password"
                value={passwordForm.next}
                onChange={(event) => setPasswordForm((current) => ({ ...current, next: event.target.value }))}
                placeholder="新しいパスワード（8文字以上）"
                className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#0D4436]"
              />
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(event) => setPasswordForm((current) => ({ ...current, confirm: event.target.value }))}
                placeholder="新しいパスワード（確認）"
                className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#0D4436]"
              />
            </div>
            {passwordMessage && (
              <p className={`mt-2 text-xs font-bold ${passwordMessage.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>
                {passwordMessage}
              </p>
            )}
            <button
              type="button"
              onClick={handlePasswordSubmit}
              className="mt-3 w-full rounded-xl bg-[#0D4436] py-2.5 text-center text-sm font-bold text-white"
            >
              変更する
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 w-full rounded-xl bg-red-50 py-3 text-center text-sm font-bold text-red-600"
        >
          ログアウト
        </button>
      </div>
    </Sheet>
  )
}
