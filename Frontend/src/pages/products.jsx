import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addToCartAsync } from '../redux/cartSlice';
import { toggleWishlist, toggleWishlistAsync, selectWishlist } from '../redux/wishlistSlice';
import { Link, useNavigate } from 'react-router-dom';
import Toaster from '../components/toaster';
import Loader from '../components/Loader';
import SearchBox from '../components/SearchBox';
import Shortlist from '../components/Shortlist';
import Filters from '../components/Filters';
import { API_BASE_URL } from '../config/api';

// Component for conditionally scrolling titles
const ScrollingTitle = ({ title, isScrolling }) => {
  const titleRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current) {
        const { scrollWidth, clientWidth } = titleRef.current;
        setShouldScroll(scrollWidth > clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [title]);

  return (
    <div className="relative overflow-hidden whitespace-nowrap">
      <h3 ref={titleRef} className={`font-semibold text-lg mb-2 ${shouldScroll ? 'animate-scroll' : ''}`}>
        {title}
      </h3>
    </div>
  )
};

function Products() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistIds = useSelector(selectWishlist);
  const { currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const productList = Array.isArray(data) ? data : (data.data || []);
        // Normalize: add 'name' field from 'title' for compatibility with filter logic
        const normalized = productList.map(p => ({
          ...p,
          name: p.title,
          description: typeof p.description === 'object' ? JSON.stringify(p.description) : (p.description || '')
        }));
        setProducts(normalized);
        setCategories(['Electronics', 'Furniture', 'Groceries', 'Appliances', 'Fashion', 'Others']);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Sort and filter products
  const sortAndFilterProducts = () => {
    let filtered = products.filter(product => {
      const name = (product.name || product.title || '').toString();
      const description = (product.description || '').toString();
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all';
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  };

  const filteredProducts = sortAndFilterProducts();

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
    setToast(`${product.name} added to cart!`);
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    dispatch(addToCart({ ...product, quantity: 1 }));
    if (currentUser) {
      dispatch(addToCartAsync({ payload: { productId: product.id, quantity: 1 } }));
    }
    navigate('/payment');
  };

  const handleToggleWishlist = (e, productId) => {
    e.preventDefault();
    if (!currentUser) {
      setToast('Please login to use wishlist');
      return;
    }
    // Optimistic update
    dispatch(toggleWishlist({ productId }));
    // Sync with backend
    dispatch(toggleWishlistAsync({ payload: { productId } }));
  };

  const isInWishlist = (productId) => wishlistIds.includes(productId);

  return (
    <div className="container mx-auto px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Our Products</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-4">
            <Filters selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} categories={categories} />
            <Shortlist sortBy={sortBy} setSortBy={setSortBy} />
          </div>

          <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full mx-auto">
            <Link to={`/product/${product.id}`} className="block relative">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <img
                  src={(() => {
                    const img = product.images?.[0];
                    const preview = img?.preview;
                    const original = img?.original;
                    const baseUrl = API_BASE_URL.replace('/api', '');
                    if (preview) return `${baseUrl}${preview}`;
                    if (original) return `${baseUrl}${original}`;
                    return `${baseUrl}${product.images?.[0]?.original}`.includes('undefined') ? 'https://via.placeholder.com/300x300?text=No+Image' : `${baseUrl}${original}`; // Double check logic
                  })() === 'undefined' ? 'https://via.placeholder.com/300x300?text=No+Image' : // Simplify:
                    (() => {
                      const img = product.images?.[0];
                      const preview = img?.preview;
                      const original = img?.original;
                      const baseUrl = API_BASE_URL.replace('/api', '');
                      if (preview) return `${baseUrl}${preview}`;
                      if (original) return `${baseUrl}${original}`;
                      return 'https://via.placeholder.com/300x300?text=No+Image';
                    })()}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="18">No Image</text></svg>'
                    )}`;
                  }}
                />

                {product.discount >= 5 && (
                  <span className="absolute top-2 left-2 bg-red-100 text-primary text-sm font-medium px-3 py-1 rounded">
                    {Math.floor(product.discount)}% OFF
                  </span>
                )}

                <button
                  onClick={(e) => handleToggleWishlist(e, product.id)}
                  aria-label="Toggle Wishlist"
                  className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-200"
                >
                  <svg
                    className={`w-5 h-5 ${isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <ScrollingTitle title={product.name} />
                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary">
                    ${product.price}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${Math.round(product.price * (1 + Math.floor(product.discount) / 100))}
                  </span>
                </div>
              </div>
            </Link>

            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={(e) => handleBuyNow(e, product)}
                className="flex-1 border-2 border-primary text-primary px-2 py-2 rounded-md hover:bg-primary hover:text-white transition-colors text-center flex items-center justify-center gap-1 text-sm whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Buy Now
              </button>
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className="flex-1 bg-primary text-white px-2 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-1 text-sm whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
      {toast && <Toaster message={toast} onClose={() => setToast(null)} position="top-right" />}
    </div>
  );
}

export default Products;
