import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import AuthLayout from '@/components/layout/AuthLayout';
import ShopLayout from '@/components/layout/ShopLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AdminRoute from '@/routes/AdminRoute';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminProductFormPage from '@/pages/admin/AdminProductFormPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Auth 라우트 */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Shop 라우트 */}
            <Route element={<ShopLayout />}>
              <Route path="/" element={<div>Home</div>} />
              <Route path="/products" element={<div>Products</div>} />
              <Route path="/products/:id" element={<div>Product Detail</div>} />
              <Route element={<ProtectedRoute />}>
                <Route path="/order" element={<div>Order</div>} />
                <Route path="/checkout" element={<div>Checkout</div>} />
              </Route>
            </Route>

            {/* Admin 라우트 */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
                <Route path="/admin/users" element={<div>Member List</div>} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/products/new" element={<AdminProductFormPage />} />
                <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
                <Route path="/admin/orders" element={<div>Admin Orders</div>} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
