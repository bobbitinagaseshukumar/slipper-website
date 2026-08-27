import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';

// Lazy-load all route pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Account = lazy(() => import('./pages/Account'));
const BrandPage = lazy(() => import('./pages/BrandPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const Unsubscribe = lazy(() => import('./pages/Unsubscribe'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const NotFound = lazy(() => import('./pages/NotFound'));

import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminPortal = lazy(() => import('./pages/admin/AdminPortal'));

import { useStoreSettings } from './context/StoreSettingsContext';
import GlobalPromotionPopup from './components/common/GlobalPromotionPopup';
import MaintenanceScreen from './components/common/MaintenanceScreen';

// Helper component for /categories/:slug forwarding to /shop?category=:slug
const CategoryRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/shop?category=${slug}`} replace />;
};

// Helper component for /category/:categorySlug/:subcategorySlug forwarding
const CategorySubcategoryRedirect = () => {
  const { categorySlug, subcategorySlug } = useParams();
  return <Navigate to={`/shop?category=${categorySlug}&subcategory=${subcategorySlug}`} replace />;
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
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <Routes>
        {/* Public Storefront Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products" element={<Navigate to="/shop" replace />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/categories/:slug" element={<CategoryRedirect />} />
        <Route path="/category/:slug" element={<CategoryRedirect />} />
        <Route path="/categories/:categorySlug/:subcategorySlug" element={<CategorySubcategoryRedirect />} />
        <Route path="/category/:categorySlug/:subcategorySlug" element={<CategorySubcategoryRedirect />} />
        <Route path="/brand/:slug" element={<BrandPage />} />
        <Route path="/brands/:slug" element={<BrandPage />} />

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
      </Suspense>
    </>
  );
}

export default App;
