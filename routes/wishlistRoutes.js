import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get user's wishlist - GET /api/wishlist/user/:userId
router.get("/user/:userId", getWishlist);

// Toggle wishlist (add/remove) - POST /api/wishlist/toggle
router.post("/toggle", addToWishlist);

// Remove from wishlist - DELETE /api/wishlist/:id
router.delete("/:id", removeFromWishlist);

export default router;
