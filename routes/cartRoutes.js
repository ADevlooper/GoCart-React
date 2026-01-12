// backend/routes/cartRoutes.js
import express from "express";
import {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cartController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require login
router.use(requireAuth);

// Get cart for user - GET /api/cart/:userId
router.get("/:userId", getCartItems);
// Add to cart - POST /api/cart/
router.post("/", addToCart);
// Update cart item - PUT /api/cart/:id
router.put("/:id", updateCartItem);
// Remove from cart - DELETE /api/cart/:id
router.delete("/:id", removeCartItem);
// Clear cart - DELETE /api/cart/clear (optional)
router.delete("/clear/all", clearCart);

export default router;
