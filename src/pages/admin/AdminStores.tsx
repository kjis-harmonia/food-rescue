import { useData } from '../../context/DataContext'
import { formatDistance } from '../../lib/format'
import '../store/Store.css'

export function AdminStores() {
  const { stores, getProductsByStore, toggleStoreStatus } = useData()

  return (
    <div className="px-3 py-6 md:px-8 md:py-8">
      <h1 className="text-xl font-black tracking-tight text-neutral-900 md:text-2xl">店舗一覧</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-400">加盟店の承認・停止を管理できます。</p>

      {/* Mobile: card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {stores.map((store) => (
          <div key={store.id} className="rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <img src={store.image} alt={store.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-neutral-900">{store.name}</p>
                <p className="truncate text-xs text-neutral-500">{store.address}</p>
                <p className="mt-0.5 text-[11px] text-neutral-400">
                  出品{getProductsByStore(store.id).length}件 ・ {formatDistance(store.distanceKm)} ・ 評価{store.rating.toFixed(1)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleStoreStatus(store.id)}
                aria-pressed={!store.isPaused}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all duration-200 active:scale-95 ${
                  store.isPaused ? 'bg-red-50 text-red-600' : 'bg-[#E6F2ED] text-[#0D4436]'
                }`}
              >
                {store.isPaused ? '停止中' : '稼働中'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: existing table */}
      <div className="hidden md:block">
        <div className="card store-table-wrap">
          <table>
            <thead>
              <tr>
                <th>店舗</th>
                <th>住所</th>
                <th>出品数</th>
                <th>距離</th>
                <th>評価</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>
                    <div className="store-product-cell">
                      <img src={store.image} alt={store.name} />
                      <span>{store.name}</span>
                    </div>
                  </td>
                  <td>{store.address}</td>
                  <td>{getProductsByStore(store.id).length}</td>
                  <td>{formatDistance(store.distanceKm)}</td>
                  <td>{store.rating.toFixed(1)}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleStoreStatus(store.id)}
                      aria-pressed={!store.isPaused}
                      className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                        store.isPaused ? 'bg-red-50 text-red-600' : 'bg-[#E6F2ED] text-[#0D4436]'
                      }`}
                    >
                      {store.isPaused ? '停止中（クリックで再開）' : '稼働中（クリックで停止）'}
                    </button>
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
