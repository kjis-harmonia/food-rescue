import { useData } from '../../context/DataContext'
import { formatYen } from '../../lib/format'
import '../store/Store.css'

const statusLabel = {
  active: '出品中',
  soldout: '完売',
  ended: '終了',
}

const statusBadgeClass = {
  active: 'bg-[#E6F2ED] text-[#0D4436]',
  soldout: 'bg-amber-50 text-amber-700',
  ended: 'bg-neutral-100 text-neutral-500',
}

export function AdminProducts() {
  const { products, getStoreById } = useData()

  return (
    <div className="px-3 py-6 md:px-8 md:py-8">
      <h1 className="text-xl font-black tracking-tight text-neutral-900 md:text-2xl">商品一覧</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-400">加盟店全体の出品状況を確認できます。</p>

      {/* Mobile: high-density card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {products.map((product) => {
          const store = getStoreById(product.storeId)
          return (
            <div key={product.id} className="rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-start gap-3">
                <img src={product.image} alt={product.title} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-bold text-neutral-900">{product.title}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass[product.status]}`}>
                      {statusLabel[product.status]}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-xs text-neutral-500">{store?.name}</p>
                    <div className="flex w-14 shrink-0 flex-col items-center">
                      <span className="text-sm font-black tracking-tighter text-neutral-900">
                        {product.quantityLeft}/{product.quantityTotal}
                      </span>
                      <span className="text-[10px] text-neutral-400">残数</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm font-black text-neutral-900">{formatYen(product.rescuePrice)}</p>
                </div>
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
                <th>商品</th>
                <th>店舗</th>
                <th>レスキュー価格</th>
                <th>残数</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="store-product-cell">
                      <img src={product.image} alt={product.title} />
                      <span>{product.title}</span>
                    </div>
                  </td>
                  <td>{getStoreById(product.storeId)?.name}</td>
                  <td>{formatYen(product.rescuePrice)}</td>
                  <td>{product.quantityLeft} / {product.quantityTotal}</td>
                  <td>
                    <span className={`status-pill status-pill--${product.status}`}>{statusLabel[product.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
