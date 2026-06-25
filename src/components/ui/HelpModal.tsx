import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { Sheet } from './Sheet'

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

const faqItems = [
  {
    q: 'レスキュー品はどうやって受け取りますか？',
    a: '予約完了画面に表示されるQRコードを、受取時間内に店舗スタッフへ提示してください。スタッフが確認後、商品をお渡しします。',
  },
  {
    q: '受取時間に間に合わない場合はどうなりますか？',
    a: '受取開始30分前までは無料でキャンセルできます。マイバッグの該当の予約から「予約をキャンセル」を選択してください。',
  },
  {
    q: '「サプライズバッグ」とは何ですか？',
    a: '店舗が当日仕込みすぎた商品をランダムに詰め合わせたお得なバッグです。内容は受け取るまでのお楽しみです。',
  },
  {
    q: '支払い方法は何が使えますか？',
    a: '現在はクレジットカードのみご利用いただけます（テストモード）。お支払い方法はマイページから登録・変更できます。',
  },
  {
    q: 'アレルギー情報は確認できますか？',
    a: '商品ごとの詳細なアレルギー表示は行っておりません。ご不安な場合は受取時に店舗スタッフへ直接ご確認ください。',
  },
]

type Section = 'faq' | 'contact' | 'terms' | 'privacy' | 'company'

const sections: { key: Section; label: string }[] = [
  { key: 'faq', label: 'よくある質問' },
  { key: 'contact', label: 'お問い合わせ' },
  { key: 'terms', label: '利用規約' },
  { key: 'privacy', label: 'プライバシーポリシー' },
  { key: 'company', label: '運営会社情報' },
]

export function HelpModal({ open, onClose }: HelpModalProps) {
  const { createSystemAnnouncement } = useData()
  const [activeSection, setActiveSection] = useState<Section>('faq')
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactError, setContactError] = useState('')

  const handleContactSubmit = () => {
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactError('すべての項目を入力してください。')
      return
    }
    setContactError('')
    createSystemAnnouncement('📨 お問い合わせを受け付けました。ご返信まで少々お待ちください。', 'user')
    setContactForm({ name: '', email: '', message: '' })
  }

  return (
    <Sheet open={open} title="ヘルプ・お問い合わせ" onClose={onClose}>
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveSection(section.key)}
            className={
              activeSection === section.key
                ? 'shrink-0 rounded-full bg-[#0D4436] px-3.5 py-1.5 text-xs font-bold text-white'
                : 'shrink-0 rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-bold text-neutral-500'
            }
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === 'faq' && (
        <div className="flex flex-col gap-2">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index
            return (
              <div key={item.q} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <span className="text-sm font-bold text-neutral-900">{item.q}</span>
                  <span className={`shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>＋</span>
                </button>
                {isOpen && <p className="border-t border-neutral-100 px-4 py-3 text-sm leading-relaxed text-neutral-500">{item.a}</p>}
              </div>
            )
          })}
        </div>
      )}

      {activeSection === 'contact' && (
        <div className="flex flex-col gap-3">
          <input
            value={contactForm.name}
            onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="お名前"
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#0D4436]"
          />
          <input
            type="email"
            value={contactForm.email}
            onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="メールアドレス"
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#0D4436]"
          />
          <textarea
            value={contactForm.message}
            onChange={(event) => setContactForm((current) => ({ ...current, message: event.target.value }))}
            placeholder="お問い合わせ内容"
            rows={4}
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#0D4436]"
          />
          {contactError && <p className="text-xs font-bold text-red-500">⚠️ {contactError}</p>}
          <button
            type="button"
            onClick={handleContactSubmit}
            className="rounded-xl bg-[#0D4436] py-3 text-center text-sm font-bold text-white"
          >
            送信する
          </button>
        </div>
      )}

      {activeSection === 'terms' && (
        <div className="space-y-3 text-sm leading-relaxed text-neutral-600">
          <p className="text-xs font-bold text-neutral-400">最終更新日: 2026年6月24日</p>
          <p>
            本利用規約（以下「本規約」）は、株式会社K's Japan（以下「当社」）が提供するフードシェアリングサービス「FOOD
            RESCUE」（以下「本サービス」）の利用条件を定めるものです。
          </p>
          <p>第1条（適用）　本規約は、本サービスの利用に関わる当社とユーザーとの間の権利義務関係を定めます。</p>
          <p>
            第2条（予約と決済）　ユーザーは本サービスを通じて店舗の食品レスキュー品を予約し、事前決済により購入できます。予約確定後の受取時間内に店舗にてQRコードを提示し、商品を受け取るものとします。
          </p>
          <p>
            第3条（キャンセル）　受取開始時刻の30分前までは、ユーザーは無料でキャンセルできます。それ以降のキャンセルについては、各店舗の判断により対応が異なります。
          </p>
          <p>
            第4条（禁止事項）　ユーザーは、本サービスの不正利用、他者へのなりすまし、QRコードの不正な複製・転用その他当社が不適切と判断する行為を行ってはなりません。
          </p>
          <p>第5条（免責事項）　当社は、本サービスを通じて提供される食品の品質について、合理的な範囲を超えて責任を負わないものとします。</p>
        </div>
      )}

      {activeSection === 'privacy' && (
        <div className="space-y-3 text-sm leading-relaxed text-neutral-600">
          <p className="text-xs font-bold text-neutral-400">最終更新日: 2026年6月24日</p>
          <p>
            株式会社K's Japan（以下「当社」）は、本サービスの提供にあたり、ユーザーの個人情報を以下の方針に基づき適切に取り扱います。
          </p>
          <p>1. 取得する情報　氏名、メールアドレス、電話番号、決済情報（カード情報はStripe等の決済代行事業者が管理し、当社では保持しません）、利用履歴。</p>
          <p>2. 利用目的　本サービスの提供・運営、予約・決済処理、お知らせ・通知の配信、お問い合わせへの対応、サービス改善のための分析。</p>
          <p>3. 第三者提供　法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者へ提供することはありません。</p>
          <p>4. 安全管理　当社は個人情報の漏えい・改ざん・不正アクセスを防止するため、Supabase等の信頼できる基盤上で適切なセキュリティ対策を実施します。</p>
          <p>5. お問い合わせ　個人情報の取扱いに関するお問い合わせは、本ヘルプ内のお問い合わせフォームよりご連絡ください。</p>
        </div>
      )}

      {activeSection === 'company' && (
        <div className="space-y-3 text-sm leading-relaxed text-neutral-600">
          <div className="rounded-2xl border border-neutral-100 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">運営会社</p>
            <p className="mt-1 text-base font-black tracking-tight text-neutral-900">株式会社K's Japan</p>
          </div>
          <p>所在地　東京都渋谷区神南1-2-3 K's Japanビル 5F</p>
          <p>設立　2024年4月</p>
          <p>事業内容　食品ロス削減プラットフォーム「FOOD RESCUE」の企画・開発・運営</p>
          <p>お問い合わせ　本ヘルプ内のお問い合わせフォームよりご連絡ください。</p>
        </div>
      )}
    </Sheet>
  )
}
