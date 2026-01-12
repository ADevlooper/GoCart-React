const User = require('../models/userModel');
const Product = require('../models/productModel'); // Assuming you have a Product model
const mongoose = require('mongoose');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res) => {
  try {
    // The user ID comes from the auth middleware
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      model: 'Product' // Ensure your product model is named 'Product'
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // The frontend expects an array of objects with product_id
    // We map the populated wishlist to match that structure
    const wishlistItems = user.wishlist.map(item => ({
        ...item.toObject(),
        product_id: item._id // Ensure consistency
    }));

    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc    Add or remove an item from the wishlist (toggle)
 * @route   POST /api/wishlist
 * @access  Private
 */
const toggleWishlistItem = async (req, res) => {
  const { productId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid Product ID' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const pullOrPush = user.wishlist.includes(productId) ? '$pull' : '$push';

    const updatedUser = await User.findByIdAndUpdate(req.user._id, { [pullOrPush]: { wishlist: productId } }, { new: true });

    res.status(200).json(updatedUser.wishlist);
  } catch (error) {
    console.error('Error toggling wishlist item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getWishlist, toggleWishlistItem };