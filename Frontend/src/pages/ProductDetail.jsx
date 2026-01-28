import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, addToCartAsync } from '../redux/cartSlice';
import { toggleWishlist, toggleWishlistAsync, selectWishlist } from '../redux/wishlistSlice';
import Toaster from '../components/toaster';
import Loader from '../components/Loader';
import { API_BASE_URL } from '../config/api';

// Constants
const isFurniture = (categories) => categories && (categories.includes('Furniture') || categories.includes('furniture'));
const isCosmetic = (categories) => categories && (categories.includes('Cosmetics') || categories.includes('cosmetics'));
const isPerfume = (categories) => categories && (categories.includes('Perfumes') || categories.includes('perfumes'));

const furnitureColors = [
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Brown', code: '#8B4513' },
  { name: 'Gray', code: '#808080' }
];

const furnitureModels = ['Standard', 'Premium', 'Luxury'];

const cosmeticColors = [
  { name: 'Red', code: '#FF0000' },
  { name: 'Pink', code: '#FFC0CB' },
  { name: 'Nude', code: '#E6BE8A' }
];

const fragranceTypes = ['Floral', 'Woody', 'Fresh', 'Citrus'];

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ... (other state)
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlist = useSelector(selectWishlist);
  const { currentUser } = useSelector((state) => state.auth);

  // ... (category checks remain same)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Product not found');
          throw new Error('Failed to load product');
        }
        const data = await response.json();
        const prod = data.product || data.data;
        if (!prod) throw new Error('Product data is missing');

        setProduct({
          ...prod,
          description: typeof prod.description === 'object' ? JSON.stringify(prod.description) : (prod.description || '')
        });

        // Fetch related/similar products if needed (simple implementation)
        // const relatedRes = await fetch(`${API_BASE_URL}/products?limit=4`);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleBuyNow = () => {
    if (!product) return;

    const productWithOptions = {
      ...product,
      name: product.title, // Map title to name for consistency
      quantity: Number(quantity),
      ...(isFurniture(product.categories) && { selectedColor, selectedModel }),
      ...(isCosmetic(product.categories) && !isPerfume(product.categories) && { selectedColor }),
      ...(isPerfume(product.categories) && { selectedFlavor })
    };

    dispatch(addToCart(productWithOptions));

    if (currentUser) {
      dispatch(addToCartAsync({ payload: { productId: product.id, quantity: Number(quantity) } }));
    }

    navigate('/payment');
  };

  const handleAddToCart = () => {
    if (!product) return;

    const productWithOptions = {
      ...product,
      name: product.title, // Map title to name for consistency
      quantity: Number(quantity),
      ...(isFurniture(product.categories) && { selectedColor, selectedModel }),
      ...(isCosmetic(product.categories) && !isPerfume(product.categories) && { selectedColor }),
      ...(isPerfume(product.categories) && { selectedFlavor })
    };

    dispatch(addToCart(productWithOptions));

    if (currentUser) {
      dispatch(addToCartAsync({ payload: { productId: product.id, quantity: Number(quantity) } }));
    }

    setToast(`${product.title} added to cart!`);
  };

  // Image navigation functions
  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-8 py-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
        <Link to="/products" className="text-primary hover:text-primary-dark">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-8 md:py-8">
      {/* Back button */}
      <Link to="/products" className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-all duration-300 mb-4 md:mb-8 group text-sm md:text-base">
        <svg className="w-4 h-4 md:w-5 md:h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* Product Images Slider */}
        <div className="space-y-4">
          <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden relative">
            <img
              src={(() => {
                const img = product.images?.[currentImageIndex];
                const preview = img?.preview;
                const original = img?.original;
                const baseUrl = API_BASE_URL.replace('/api', '');
                if (preview) return `${baseUrl}${preview}`;
                if (original) return `${baseUrl}${original}`;
                return `data:image/svg+xml;utf8,${encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="18">No Image</text></svg>'
                )}`;
              })()}
              alt={product.title}
              className="w-full h-64 sm:h-[300px] md:h-[400px] object-contain mx-auto"
              onError={(e) => {
                e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="18">No Image</text></svg>'
                )}`;
              }}
            />

            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                // Optimistic update
                dispatch(toggleWishlist({ productId: product.id }));
                // Sync with backend
                dispatch(toggleWishlistAsync({ payload: { productId: product.id } }));
              }}
              className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all duration-200"
            >
              <svg
                className={`w-5 h-5 ${wishlist.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
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

            {/* Offer Tag */}
            {product.discount > 0 && (
              <span className="absolute top-2 left-2 bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded">
                {Math.floor(product.discount)}% OFF
              </span>
            )}

            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${index === currentImageIndex ? 'border-red-800' : 'border-gray-200 hover:border-red-400'
                    }`}
                >
                  <img
                    src={(() => {
                      const img = image;
                      const thumb = img?.thumbnail;
                      const preview = img?.preview;
                      const baseUrl = API_BASE_URL.replace('/api', '');
                      if (thumb) return `${baseUrl}${thumb}`;
                      if (preview) return `${baseUrl}${preview}`;
                      return `data:image/svg+xml;utf8,${encodeURIComponent(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="10">No Image</text></svg>'
                      )}`;
                    })()}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="10">No Image</text></svg>'
                      )}`;
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Image Dots Indicator */}
          {product.images.length > 1 && (
            <div className="flex justify-center gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{product.title}</h1>
          <p className="text-sm md:text-base text-gray-600">{product.description}</p>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">${product.price}</span>
                {product.discount > 0 && <span className="text-sm text-gray-500 line-through">
                  ${Math.round(product.price * (1 + Number(product.discount) / 100))}
                </span>}
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-green-600">In Stock: {product.stock} units</p>
          </div>

          {/* Quantity Selection */}
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="px-3 py-1 border rounded-md hover:border-red-800"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-1 border rounded-md text-center"
              />
              <button
                onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                className="px-3 py-1 border rounded-md hover:border-red-800"
              >
                +
              </button>
            </div>
          </div>

          {/* Warranty Information */}
          {product.warrantyInfo && (
            <div className="flex items-center w-full sm:w-fit gap-2 bg-gradient-to-r from-green-400 to-green-600 text-white pl-3 pr-4 md:pr-12 py-2 rounded-lg md:rounded-2xl shadow-sm">
              <img width="20" height="20" src="https://img.icons8.com/dotty/80/security-checked.png" alt="security-checked" className="invert brightness-0" />
              <span className="font-bold text-sm md:text-base">{product.warrantyInfo}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
            <button
              onClick={handleBuyNow}
              className="flex-1 border-2 border-primary text-primary px-6 py-3 rounded-md hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Product Options */}
      {(isFurniture(product.categories) || isCosmetic(product.categories) || isPerfume(product.categories)) && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Conditional rendering of options based on product category */}
            {(isFurniture(product.categories) || (isCosmetic(product.categories) && !isPerfume(product.categories))) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {isCosmetic(product.categories) ? 'Select Shade' : 'Select Color'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(isCosmetic(product.categories) ? cosmeticColors : furnitureColors).map(color => (
                    <button
                      key={typeof color === 'string' ? color : color.name}
                      onClick={() => setSelectedColor(typeof color === 'string' ? color : color.name)}
                      className={`flex flex-col items-center gap-2 p-2 rounded-md transition-all ${selectedColor === (typeof color === 'string' ? color : color.name)
                        ? 'ring-2 ring-red-800 scale-105'
                        : 'hover:ring-1 hover:ring-red-800'
                        }`}
                    >
                      {typeof color === 'string' ? (
                        <span>{color}</span>
                      ) : (
                        <>
                          <div
                            className="w-8 h-8 rounded-full border border-gray-200"
                            style={{ backgroundColor: color.code }}
                          />
                          <span className="text-sm">{color.name}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isFurniture(product.categories) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Select Model</h3>
                <div className="flex flex-wrap gap-3">
                  {furnitureModels.map(model => (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={`px-4 py-2 border rounded-md ${selectedModel === model
                        ? 'border-primary bg-red-50 text-primary'
                        : 'border-gray-300 hover:border-red-800'
                        }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isPerfume(product.categories) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Select Fragrance</h3>
                <div className="flex flex-wrap gap-3">
                  {fragranceTypes.map(fragrance => (
                    <button
                      key={fragrance}
                      onClick={() => setSelectedFlavor(fragrance)}
                      className={`px-4 py-2 border rounded-md ${selectedFlavor === fragrance
                        ? 'border-primary bg-red-50 text-primary'
                        : 'border-gray-300 hover:border-red-800'
                        }`}
                    >
                      {fragrance}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* You Might Also Like Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <Link to={`/product/${relatedProduct.id}`} className="block relative">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <img
                      src={(() => {
                        const img = relatedProduct.images?.[0];
                        const preview = img?.preview;
                        const original = img?.original;
                        const baseUrl = API_BASE_URL.replace('/api', '');
                        if (preview) return `${baseUrl}${preview}`;
                        if (original) return `${baseUrl}${original}`;
                        return `data:image/svg+xml;utf8,${encodeURIComponent(
                          '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="18">No Image</text></svg>'
                        )}`;
                      })()}
                      alt={relatedProduct.title}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                          '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="18">No Image</text></svg>'
                        )}`;
                      }}
                    />

                    {/* Offer Tag */}
                    {relatedProduct.discount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded">
                        {Math.floor(relatedProduct.discount)}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{relatedProduct.title}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-primary">${relatedProduct.price}</span>
                      {relatedProduct.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          ${Math.round(relatedProduct.price * (1 + Number(relatedProduct.discount) / 100))}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Detail Section */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Product Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-600 min-w-[80px]">Brand:</span>
              <span className="text-gray-800">{product.brand || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-600 min-w-[80px]">Category:</span>
              <span className="text-gray-800 capitalize">{(product.categories || []).join(', ')}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-600 min-w-[80px]">Rating:</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-800">{product.rating || 'No ratings'}</span>
                {product.rating && (
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-600 min-w-[80px]">Stock:</span>
              <span className="text-gray-800">{product.stock} units</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-600 min-w-[80px]">Discount:</span>
              <span className="text-green-600">{Math.floor(product.discount || 0)}% off</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-600 min-w-[80px]">Product ID:</span>
              <span className="text-gray-800">#{product.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Product Description</h2>
        <div className="prose max-w-none">
          <ul className="text-gray-700 leading-relaxed list-disc list-inside">
            {product.description.split('. ').map((point, index) => (
              <li key={index}>{point}</li>
            ))}
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
            <li>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
          </ul>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="space-y-6">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{review.reviewerName}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-500">Updated on {new Date(review.date).toLocaleDateString('en-US')}</span>
                    <div className="flex items-center gap-1 text-blue-600 text-xs mt-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Purchase
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{review.rating} out of 5</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button className="border border-primary text-primary px-3 py-1 rounded-md hover:bg-primary hover:text-white transition-colors">
                      Helpful
                    </button>
                    <button className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary-dark transition-colors flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700">Report</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && <Toaster message={toast} onClose={() => setToast(null)} position="top-right" />}
    </div>
  );
}

export default ProductDetail;
