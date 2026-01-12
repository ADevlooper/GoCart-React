const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlistItem,
} = require('../controllers/wishlistController');
const { auth } = require('../middleware/authMiddleware'); // Assuming you have this middleware

// GET /api/wishlist - Get the current user's wishlist
router.get('/', auth, getWishlist);

// POST /api/wishlist - Add/Remove an item from the wishlist
router.post('/', auth, toggleWishlistItem);


module.exports = router;