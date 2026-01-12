import { useSelector, useDispatch } from 'react-redux';
import { selectIsInWishlist, toggleWishlistAsync } from '../redux/wishlistSlice';
import { useNavigate } from 'react-router-dom';

function WishlistButton({ productId }) {
  const { currentUser, token } = useSelector((state) => state.auth);
  const userId = currentUser?.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use selector to check if item is in wishlist
  const isInWishlist = useSelector((state) => selectIsInWishlist(state, productId));

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      navigate('/login');
      return;
    }

    // Optimistic update handled by thunk or we can dispatch local action first if needed
    // For now, relies on thunk fulfillment updating state
    dispatch(toggleWishlistAsync({
      payload: { userId, productId },
      token
    }));
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg border transition-colors ${isInWishlist
        ? 'bg-red-100 text-primary border-primary'
        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
        }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" className={isInWishlist ? "text-primary" : "text-gray-400"}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default WishlistButton;
