import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { FloatingActions } from './components/layout/FloatingActions';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { AddressPage } from './pages/AddressPage';
import { ReviewPage } from './pages/ReviewPage';

function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <Navbar />
      {children}
      <Footer variant={isHome ? 'default' : 'default'} />
      <FloatingActions />
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        {/* Legacy html path support: redirect product-detail.html?slug= -> via ProductDetailPage fallback handled by slug param but also support search param route */}
        <Route path="/product-detail.html" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/cart/alamat" element={<AddressPage />} />
        <Route path="/cart/review" element={<ReviewPage />} />
        <Route path="/cart-alamat.html" element={<AddressPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Layout>
  );
}
