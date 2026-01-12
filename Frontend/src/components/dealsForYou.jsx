import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addToCartAsync } from '../redux/cartSlice';
import { Link } from 'react-router-dom';
import Toaster from './toaster';
import Loader from './Loader';
import { API_BASE_URL } from '../config/api';

function DealsForYou() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch');
        const dataRaw = await response.json();
        const data = Array.isArray(dataRaw) ? dataRaw : (dataRaw.data || []);
        // Map backend fields to frontend expected fields
        const mappedProducts = data.map(product => ({
          ...product,
          title: product.name,
          thumbnail: product.images?.[0]?.thumbnail ? `${API_BASE_URL.replace('/api', '')}${product.images[0].thumbnail}` : 'https://via.placeholder.com/150',
          discountPercentage: product.discount
        }));
        // Filter products with highest discount (top 10)
        const discountedProducts = mappedProducts
          .filter(product => product.discountPercentage >= 5)
          .sort((a, b) => b.discountPercentage - a.discountPercentage)
          .slice(0, 10);
        setProducts(discountedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) return (
    <div className="text-center text-red-500 p-4">
      Error: {error}
    </div>
  );

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    dispatch(addToCart({ ...product, quantity: 1 }));
    if (currentUser) {
      dispatch(addToCartAsync({ payload: { productId: product.id, quantity: 1 } }));
    }
    setToast(`${product.title} added to cart!`);
  };



  return (
    <div className="container mt-6 px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-left">Deals for you</h2>
        <Link to="/products" className="bg-transparent text-red-800 px-4 py-2 rounded-2xl border hover:bg-red-800 hover:text-white transition-colors">
          See More →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link to={`/product/${product.id}`} className="block relative">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="max-w-full max-h-full object-contain"
                />
                <span className="absolute top-2 left-2 bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded">
                  {Math.floor(product.discountPercentage)}% OFF
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-red-800">${product.price}</span>
                  <span className="text-sm text-gray-500 line-through">
                    ${Math.round(product.price * (1 + Math.floor(product.discountPercentage) / 100))}
                  </span>
                </div>
              </div>
            </Link>

          </div>
        ))}
      </div>
      {toast && <Toaster message={toast} onClose={() => setToast(null)} position="top-right" />}
    </div>
  );
}

export default DealsForYou;
