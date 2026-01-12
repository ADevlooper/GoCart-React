// backend/controllers/cartController.js
import { db } from "../db/index.js";
import { carts, cartItems, products, productImages } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

// Helper function to get enriched cart items
// Helper function to get enriched cart items
const getEnrichedCart = async (userId) => {
  // 1. Find active cart
  const [activeCart] = await db
    .select()
    .from(carts)
    .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
    .limit(1);

  if (!activeCart) return [];

  // 2. Fetch items for this cart
  const items = await db
    .select({
      cartId: cartItems.id, // ID of the item row
      quantity: cartItems.quantity,
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
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        // eq(productImages.position, 0) // Optional: prioritize thumbnail
      )
    )
    .where(eq(cartItems.cartId, activeCart.id));

  return items;
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
import { sql } from "drizzle-orm";

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

    // 1. Get or Create Active Cart for User
    let [activeCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
      .limit(1);

    if (!activeCart) {
      // Create new cart
      [activeCart] = await db.insert(carts).values({ userId, status: "active" }).returning();
    }

    // 2. Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, activeCart.id), eq(cartItems.productId, productId)))
      .limit(1);

    if (existingItem) {
      // Update quantity
      await db
        .update(cartItems)
        .set({ quantity: sql`${cartItems.quantity} + ${quantity}` })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      // Insert new item
      await db.insert(cartItems).values({
        cartId: activeCart.id,
        productId,
        quantity,
      });
    }

    res.json({ success: true, message: "Product added to cart.", items: await getEnrichedCart(userId) });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ success: false, message: "Failed to add to cart." });
  }
};

// ==============================
// UPDATE CART ITEM
// ==============================
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id; // This is the ID from cart_items table
    const { quantity } = req.body;

    if (!cartItemId || quantity === undefined) {
      return res.status(400).json({ success: false, message: "cartItemId and quantity are required" });
    }

    // Verify item belongs to user's active cart
    const [item] = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId
      })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(and(eq(cartItems.id, cartItemId), eq(carts.userId, userId), eq(carts.status, "active")))
      .limit(1);

    if (!item) {
      return res.status(404).json({ success: false, message: "Cart item not found or not owned by user." });
    }

    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
    } else {
      await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
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
    const cartItemId = req.params.id;

    if (!cartItemId) {
      return res.status(400).json({ success: false, message: "cartItemId is required" });
    }

    // Verify item ownership
    const [item] = await db
      .select({ id: cartItems.id })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(and(eq(cartItems.id, cartItemId), eq(carts.userId, userId), eq(carts.status, "active")))
      .limit(1);

    if (!item) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));

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

    const [activeCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
      .limit(1);

    if (activeCart) {
      // Option A: Just delete items?
      // Option B: Mark cart as 'abandoned'/'cleared' and create new one?
      // For now, let's delete items to keep the cart active.
      await db.delete(cartItems).where(eq(cartItems.cartId, activeCart.id));
    }

    res.json({ success: true, message: "Cart cleared.", items: [] });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
};
