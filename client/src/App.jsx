import React from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import SearchPage from './pages/SearchPage';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Account from './pages/Account';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import Unsubscribe from './pages/Unsubscribe';
import OTPVerification from './pages/OTPVerification';
import NotFound from './pages/NotFound';

import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminPortal from './pages/admin/AdminPortal';

import { useStoreSettings } from './context/StoreSettingsContext';
import GlobalPromotionPopup from './components/common/GlobalPromotionPopup';
import MaintenanceScreen from './components/common/MaintenanceScreen';

// Helper component for /categories/:slug forwarding to /shop?category=:slug
const CategoryRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/shop?category=${slug}`} replace />;
};

function App() {
  const { settings } = useStoreSettings();
  const location = useLocation();

  // If maintenance mode is turned on and current URL is NOT /admin, show MaintenanceScreen
  if (settings.maintenanceMode && !location.pathname.startsWith('/admin')) {
    return <MaintenanceScreen />;
  }

  return (
    <>
      <GlobalPromotionPopup />
      <Routes>
        {/* Public Storefront Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products" element={<Navigate to="/shop" replace />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/categories/:slug" element={<CategoryRedirect />} />
        <Route path="/category/:slug" element={<CategoryRedirect />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/search" element={<SearchPage />} />

        {/* Cart & Wishlist Routes */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Legal & Policy Routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="/verify-otp" element={<OTPVerification />} />

        {/* Checkout & Order Routes (Protected) */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:orderNumber"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Customer Protected Account Routes */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/orders/:orderNumber"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/:tab"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />

        {/* Admin Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
