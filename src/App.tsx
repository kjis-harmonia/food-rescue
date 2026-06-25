import { Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { StoreLayout } from './components/layout/StoreLayout'
import { UserLayout } from './components/layout/UserLayout'
import { ToastStack } from './components/ui/ToastStack'
import { NotFound } from './pages/NotFound'
import { AdminHome } from './pages/admin/AdminHome'
import { AdminOrders } from './pages/admin/AdminOrders'
import { AdminProducts } from './pages/admin/AdminProducts'
import { AdminStores } from './pages/admin/AdminStores'
import { ProductEditPage, ProductForm } from './pages/store/ProductForm'
import { StoreHome } from './pages/store/StoreHome'
import { StoreProducts } from './pages/store/StoreProducts'
import { StoreReservations } from './pages/store/StoreReservations'
import { StoreSettings } from './pages/store/StoreSettings'
import { FavoriteStoresPage } from './pages/user/FavoriteStoresPage'
import { Home } from './pages/user/Home'
import { HistoryPage } from './pages/user/HistoryPage'
import { MyBag } from './pages/user/MyBag'
import { MyPage } from './pages/user/MyPage'
import { ProductDetail } from './pages/user/ProductDetail'
import { ProductList } from './pages/user/ProductList'
import { TicketPage } from './pages/user/TicketPage'

function App() {
  return (
    <>
      <ToastStack />
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/tickets/:reservationId" element={<TicketPage />} />
          <Route path="/bag" element={<MyBag />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/favorites" element={<FavoriteStoresPage />} />
        </Route>

        <Route path="/store" element={<StoreLayout />}>
          <Route index element={<StoreHome />} />
          <Route path="products" element={<StoreProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:productId/edit" element={<ProductEditPage />} />
          <Route path="reservations" element={<StoreReservations />} />
          <Route path="settings" element={<StoreSettings />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="stores" element={<AdminStores />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
