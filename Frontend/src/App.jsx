import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from './redux/cartSlice';
import Navbar from './components/navbar';
import Adcorousel from './components/adcorousel';
import Shortmenu from './components/shortmenu';
import About from './pages/about';
import Contact from './pages/contact';
import Products from './pages/products';
import Cart from './pages/cart';
import Payment from './pages/payment';
import Account from './pages/account';
import Auth from './pages/auth';
import Footer from './components/footer';
import GoToTop from './components/gototop';
import ProductDetail from './pages/ProductDetail';
import DealsForYou from './components/dealsForYou';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminTags from './pages/AdminTags';
import './App.css';

const Home = () => (
  <>
    <Adcorousel />
    <Shortmenu />
    <DealsForYou />
  </>
);

function App() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchCart({ userId: currentUser.id }));
    }
  }, [dispatch, currentUser]);

  return (
    <>
      <ScrollToTop />
      <div className="App">
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/account" element={<Account />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="tags" element={<AdminTags />} />
          </Route>
        </Routes>
        <GoToTop />
      </div>
    </>
  );
}

export default App;
