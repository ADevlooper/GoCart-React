import { useSelector } from 'react-redux';
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '../redux/wishlistApi';
import { useNavigate } from 'react-router-dom';

function WishlistButton({ productId }) {
  const { currentUser } = useSelector((state) => state.auth);
  const userId = currentUser?.id;
  const navigate = useNavigate();

  const { data: wishlistData } = useGetWishlistQuery(userId, { skip: !userId });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const isInWishlist = wishlistData?.some(item => item.productId === productId) || false;

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      // Redirect to login or show toaster
      navigate('/login');
      return;
    }

    if (isInWishlist) {
      await removeFromWishlist({ userId, productId });
    } else {
      await addToWishlist({ userId, productId });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg border transition-colors ${isInWishlist
        ? 'bg-red-100 text-primary border-primary'
        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
        }`}
    >
      ♥
    </button>
  );
}

export default WishlistButton;
