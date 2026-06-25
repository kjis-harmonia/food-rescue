import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { CURRENT_STORE_ID } from '../../lib/session'
import './Store.css'

const defaultImage =
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80'

interface RescueFormProps {
  onComplete?: () => void
  editProductId?: string
}

export function RescueForm({ onComplete, editProductId }: RescueFormProps) {
  const navigate = useNavigate()
  const { addProduct, updateProduct, getProductById } = useData()
  const editingProduct = editProductId ? getProductById(editProductId) : undefined

  const [title, setTitle] = useState(editingProduct?.title ?? '本日のレスキューバッグ')
  const [normalPrice, setNormalPrice] = useState(String(editingProduct?.normalPrice ?? 1000))
  const [rescuePrice, setRescuePrice] = useState(String(editingProduct?.rescuePrice ?? 500))
  const [quantity, setQuantity] = useState(editingProduct?.quantityTotal ?? 5)
  const [pickupStart, setPickupStart] = useState(editingProduct?.pickupStart ?? '18:00')
  const [pickupEnd, setPickupEnd] = useState(editingProduct?.pickupEnd ?? '19:00')
  const [error, setError] = useState('')

  const savings = Math.max(0, Number(normalPrice) - Number(rescuePrice))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!title || !normalPrice || !rescuePrice || quantity < 1 || !pickupStart || !pickupEnd) {
      setError('入力内容を確認してください')
      return
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        title,
        normalPrice: Number(normalPrice),
        rescuePrice: Number(rescuePrice),
      })
    } else {
      addProduct({
        storeId: CURRENT_STORE_ID,
        title,
        description: '当日店頭で余った商品を詰め合わせたレスキューバッグです。',
        image: defaultImage,
        normalPrice: Number(normalPrice),
        rescuePrice: Number(rescuePrice),
        quantityTotal: quantity,
        pickupStart,
        pickupEnd,
      })
    }
    if (onComplete) onComplete()
    else navigate('/store/products')
  }

  return (
    <form className="rescue-form" onSubmit={handleSubmit}>
      <div className="form-progress">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>

      <div className="rescue-form__section">
        <label className="rescue-form__label"><span className="rescue-form__step">1</span>商品写真</label>
        <button type="button" className="photo-picker"><span>＋</span> 写真を追加</button>
      </div>

      <div className="rescue-form__section">
        <label className="rescue-form__label" htmlFor="rescue-title"><span className="rescue-form__step">2</span>商品名</label>
        <input id="rescue-title" className="rescue-input" value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>

      <div className="rescue-form__section">
        <div className="rescue-form__label"><span className="rescue-form__step">3</span>価格</div>
        <div className="form-two-col">
          <label>
            <span className="store-eyebrow">通常価格</span>
            <span className="price-field"><span>¥</span><input aria-label="通常価格" className="rescue-input" type="number" value={normalPrice} onChange={(event) => setNormalPrice(event.target.value)} /></span>
          </label>
          <label>
            <span className="store-eyebrow">販売価格</span>
            <span className="price-field"><span>¥</span><input aria-label="販売価格" className="rescue-input" type="number" value={rescuePrice} onChange={(event) => setRescuePrice(event.target.value)} /></span>
          </label>
        </div>
        <p className="savings-note">お客様は ¥{savings.toLocaleString('ja-JP')} お得</p>
      </div>

      {!editingProduct && (
        <>
          <div className="rescue-form__section">
            <div className="rescue-form__label"><span className="rescue-form__step">4</span>数量</div>
            <div className="quantity-control">
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button>
              <output>{quantity} 個</output>
              <button type="button" onClick={() => setQuantity((current) => current + 1)}>＋</button>
            </div>
          </div>

          <div className="rescue-form__section">
            <div className="rescue-form__label"><span className="rescue-form__step">5</span>受取時間</div>
            <div className="form-two-col">
              <input aria-label="受取開始時間" className="rescue-input" type="time" value={pickupStart} onChange={(event) => setPickupStart(event.target.value)} />
              <input aria-label="受取終了時間" className="rescue-input" type="time" value={pickupEnd} onChange={(event) => setPickupEnd(event.target.value)} />
            </div>
          </div>
        </>
      )}

      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="submit-rescue">{editingProduct ? '変更を保存' : 'レスキューを開始'}</button>
    </form>
  )
}

export function ProductForm() {
  return (
    <div className="store-page">
      <p className="store-eyebrow">Quick listing</p>
      <h1 className="store-heading">レスキューバッグを出品</h1>
      <p className="store-subheading">必要な項目だけ。30秒で販売を開始できます。</p>
      <div className="merchant-card" style={{ maxWidth: 760, marginTop: 28 }}><RescueForm /></div>
    </div>
  )
}

export function ProductEditPage() {
  const { productId } = useParams<{ productId: string }>()
  return (
    <div className="store-page">
      <p className="store-eyebrow">Edit listing</p>
      <h1 className="store-heading">商品を編集</h1>
      <p className="store-subheading">商品名と価格を更新できます。</p>
      <div className="merchant-card" style={{ maxWidth: 760, marginTop: 28 }}>
        <RescueForm editProductId={productId} />
      </div>
    </div>
  )
}
