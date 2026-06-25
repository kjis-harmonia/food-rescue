import { useData } from '../../context/DataContext'
import { formatYen } from '../../lib/format'
import '../store/Store.css'

const statusLabel = {
  confirmed: '受取待ち',
  picked_up: '受取済み',
  cancelled: 'キャンセル',
}

const statusCardClass = {
  confirmed: 'bg-orange-500',
  picked_up: 'bg-[#0D4436]',
  cancelled: 'bg-neutral-100',
}

export function AdminOrders() {
  const { reservations, getProductById, getStoreById } = useData()
  const sorted = [...reservations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="px-3 py-6 md:px-8 md:py-8">
      <h1 className="text-xl font-black tracking-tight text-neutral-900 md:text-2xl">注文一覧</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-400">全店舗の予約・受取状況を確認できます。</p>

      {/* Mobile: Wallet-style card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {sorted.map((reservation) => {
          const product = getProductById(reservation.productId)
          const store = getStoreById(reservation.storeId)
          if (!product) return null
          const isCancelled = reservation.status === 'cancelled'

          return (
            <div
              key={reservation.id}
              className={`rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 active:scale-[0.99] ${statusCardClass[reservation.status]}`}
            >
              <p className={`font-mono text-xs font-bold ${isCancelled ? 'text-neutral-400' : 'text-white/70'}`}>
                #{reservation.pickupCode} / {reservation.pickupStart}
              </p>
              <p className={`mt-1 text-sm font-bold ${isCancelled ? 'text-neutral-600' : 'text-white'}`}>{product.title}</p>
              <p className={`text-xs ${isCancelled ? 'text-neutral-400' : 'text-white/75'}`}>{store?.name}</p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className={`text-base font-black tracking-tight ${isCancelled ? 'text-neutral-600' : 'text-white'}`}>
                  {formatYen(product.rescuePrice * reservation.quantity)}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isCancelled ? 'bg-neutral-200 text-neutral-500' : 'bg-white/20 text-white'}`}>
                  {statusLabel[reservation.status]}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop: existing table */}
      <div className="hidden md:block">
        <div className="card store-table-wrap">
          <table>
            <thead>
              <tr>
                <th>受取コード</th>
                <th>商品</th>
                <th>店舗</th>
                <th>金額</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((reservation) => {
                const product = getProductById(reservation.productId)
                const store = getStoreById(reservation.storeId)
                if (!product) return null
                return (
                  <tr key={reservation.id}>
                    <td style={{ fontWeight: 700 }}>{reservation.pickupCode}</td>
                    <td>{product.title}</td>
                    <td>{store?.name}</td>
                    <td>{formatYen(product.rescuePrice * reservation.quantity)}</td>
                    <td>
                      <span className={`status-pill status-pill--${reservation.status}`}>
                        {statusLabel[reservation.status]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
