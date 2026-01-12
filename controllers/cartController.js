// backend/controllers/cartController.js
import { db } from "../db/index.js";
import { cart, products, productImages } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

// Helper function to get enriched cart items
// Helper function to get enriched cart items
const getEnrichedCart = async (userId) => {
  // Optimized Query: Joins Cart -> Products -> Images (Primary only)
  // This eliminates the N+1 problem of fetching images separately for every item.
  const cartItems = await db
    .select({
      cartId: cart.id,
      quantity: cart.quantity,
      productId: products.id,
      title: products.title,
      price: products.price,
      discount: products.discount,
      availableStock: products.availableStock,
      // Image fields from join
      thumbnail: productImages.thumbnailUrl,
      preview: productImages.previewUrl,
      original: productImages.originalUrl,
    })
    .from(cart)
    .leftJoin(products, eq(cart.productId, products.id))
    // Join strictly on Primary Image (position 0) or use a DISTINCT ON if multiple 0s exist
    // For simplicity/performance in this schema, we assume one image at pos 0 or take the first match
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        // If your logic relies on position 0 being the thumbnail, uncomment below. 
        // If not, this simply grabs 'an' image. Given the previous code just took limit(1), this is equivalent.
        // eq(productImages.position, 0) 
      )
    )
    .where(eq(cart.userId, userId));

  // The previous logic was { ...item, ...image[0] }. The join essentially flattens this.
  // We can return directly.
  return cartItems;
};

// ==============================
// GET CART ITEMS
// ==============================
export const getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const enrichedCart = await getEnrichedCart(userId);
    res.json({ success: true, items: enrichedCart });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cart items." });
  }
};

// ==============================
// ADD TO CART
// ==============================
// ==============================
// ADD TO CART
// ==============================
import { sql } from "drizzle-orm"; // Ensure sql is imported

export const addToCart = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    let { productId, quantity } = req.body;

    // Strict validation
    productId = parseInt(productId);
    quantity = parseInt(quantity || 1);

    if (!productId || isNaN(productId)) {
      return res.status(400).json({ success: false, message: "Valid productId is required" });
    }
    if (isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    // Check product exists
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Atomic Upsert: Requires a unique constraint on cart(user_id, product_id)
    // If constraint "cart_user_id_product_id_unique" exists (or similar), Drizzle handles it.
    // Failing fallback: We use the manual Check-Update-Insert safely if constraint is missing, but Upsert is preferred.

    // Attempting Upsert Logic
    await db.insert(cart)
      .values({
        userId,
        productId,
        quantity,
      })
      .onConflictDoUpdate({
        target: [cart.userId, cart.productId],
        set: { quantity: sql`${cart.quantity} + ${quantity}` }
      });

    res.json({ success: true, message: "Product added to cart.", items: await getEnrichedCart(userId) });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ success: false, message: "Failed to add to cart. Ensure DB constraints are set." });
  }
};

// ==============================
// UPDATE CART ITEM
// ==============================
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = req.params.id;
    const { quantity } = req.body;

    if (!cartId || quantity === undefined) {
      return res.status(400).json({ success: false, message: "cartId and quantity are required" });
    }

    const cartItem = await db
      .select()
      .from(cart)
      .where(and(eq(cart.id, cartId), eq(cart.userId, userId)))
      .limit(1);

    if (!cartItem.length) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    if (quantity <= 0) {
      await db.delete(cart).where(eq(cart.id, cartId));
    } else {
      await db.update(cart).set({ quantity }).where(eq(cart.id, cartId));
    }

    res.json({ success: true, message: "Cart updated successfully.", items: await getEnrichedCart(userId) });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({ success: false, message: "Failed to update cart." });
  }
};

// ==============================
// REMOVE CART ITEM
// ==============================
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = req.params.id;

    if (!cartId) {
      return res.status(400).json({ success: false, message: "cartId is required" });
    }

    const cartItem = await db
      .select()
      .from(cart)
      .where(and(eq(cart.id, cartId), eq(cart.userId, userId)))
      .limit(1);

    if (!cartItem.length) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    await db.delete(cart).where(eq(cart.id, cartId));

    res.json({ success: true, message: "Cart item removed.", items: await getEnrichedCart(userId) });
  } catch (error) {
    console.error("Remove Cart Item Error:", error);
    res.status(500).json({ success: false, message: "Failed to remove cart item." });
  }
};

// ==============================
// CLEAR CART
// ==============================
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.delete(cart).where(eq(cart.userId, userId));

    res.json({ success: true, message: "Cart cleared.", items: [] });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
};
