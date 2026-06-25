import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { formatYen } from '../../lib/format'
import { CURRENT_STORE_ID } from '../../lib/session'

const statusBadgeClass = {
  active: 'bg-[#E6F2ED] text-[#0D4436]',
  soldout: 'bg-amber-50 text-amber-700',
  ended: 'bg-neutral-100 text-neutral-500',
}

const statusLabel = { active: '販売中', soldout: '完売', ended: '終了' }

export function StoreProducts() {
  const { getProductsByStore, reservations, endProduct, updateStock } = useData()
  const products = getProductsByStore(CURRENT_STORE_ID)

  return (
    <div className="px-4 pb-32 pt-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Live listings</p>
          <h1 className="mt-0.5 text-xl font-black tracking-tight text-neutral-900">現在出品中</h1>
        </div>
        <Link
          to="/store/products/new"
          className="cursor-pointer rounded-full bg-[#0D4436] px-4 py-2 text-xs font-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-200 active:scale-[0.98]"
        >
          ＋ 出品する
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="py-12 text-center text-sm text-neutral-400">現在出品中の商品はありません。</p>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((product) => {
            const booked = reservations
              .filter((reservation) => reservation.productId === product.id && reservation.status !== 'cancelled')
              .reduce((sum, reservation) => sum + reservation.quantity, 0)

            return (
              <div key={product.id} className="rounded-2xl bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                <div className="relative">
                  <img src={product.image} alt={product.title} className="h-40 w-full rounded-2xl object-cover" />
                  <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass[product.status]}`}>
                    {statusLabel[product.status]}
                  </span>
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">残数</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateStock(product.id, Math.max(0, product.quantityLeft - 1))}
                        disabled={product.status === 'ended' || product.quantityLeft <= 0}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-700 transition-all duration-200 active:scale-[0.9] disabled:opacity-40"
                      >
                        −
                      </button>
                      <p className="min-w-[64px] text-lg font-black tracking-tighter text-neutral-900">
                        残り{product.quantityLeft}個
                      </p>
                      <button
                        type="button"
                        onClick={() => updateStock(product.id, product.quantityLeft + 1)}
                        disabled={product.status === 'ended'}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-700 transition-all duration-200 active:scale-[0.9] disabled:opacity-40"
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <p className="truncate text-sm font-bold text-neutral-700">{product.title}</p>
                    <p className="mt-0.5 text-xs font-medium text-neutral-500">
                      {booked}件予約 ・ {formatYen(product.rescuePrice)}
                    </p>
                  </div>
                </div>

                <p className="mt-2 text-xs font-medium text-neutral-500">
                  受取時間 {product.pickupStart}〜{product.pickupEnd}
                </p>

                <div className="mt-4 flex gap-3">
                  <Link
                    to="/store/reservations"
                    className="flex-1 cursor-pointer rounded-xl bg-[#0D4436] py-3 text-center text-xs font-bold text-white shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-200 active:scale-[0.98]"
                  >
                    予約を見る
                  </Link>
                  <Link
                    to={`/store/products/${product.id}/edit`}
                    className="flex-1 cursor-pointer rounded-xl bg-neutral-100 py-3 text-center text-xs font-bold text-neutral-700 transition-all duration-200 active:scale-[0.98]"
                  >
                    編集
                  </Link>
                  {product.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => endProduct(product.id)}
                      className="flex-1 cursor-pointer rounded-xl bg-red-50 py-3 text-center text-xs font-bold text-red-600 transition-all duration-200 active:scale-[0.98]"
                    >
                      販売を終了
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
