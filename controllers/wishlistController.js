import { db } from "../db/index.js";
import { wishlist, products, productImages } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

// GET USER'S WISHLIST
export const getWishlist = async (req, res) => {
  try {
    console.log("DEBUG: getWishlist called");
    console.log("DEBUG: req.user from middleware:", req.user);
    console.log("DEBUG: req.cookies:", req.cookies);

    const userId = parseInt(req.user?.id);
    if (!userId || isNaN(userId)) {
      console.log("DEBUG: Unauthorized - Invalid userId:", userId);
      return res.status(401).json({ success: false, message: "Unauthorized or invalid user ID" });
    }

    console.log(`DEBUG: Fetching wishlist for userId: ${userId}`);

    // First, get all wishlist items for the user
    const wishlistItems = await db
      .select({
        wishlistId: wishlist.id,
        productId: products.id,
        title: products.title,
        price: products.price,
        discount: products.discount,
        stock: products.stock,
        availableStock: products.availableStock,
      })
      .from(wishlist)
      .leftJoin(products, eq(wishlist.productId, products.id))
      .where(eq(wishlist.userId, userId));

    console.log(`DEBUG: Found ${wishlistItems.length} items for userId ${userId}`);

    // For each wishlist item, get the first image
    const enrichedItems = await Promise.all(
      wishlistItems.map(async (item) => {
        const image = await db
          .select({
            image: productImages.thumbnailUrl,
          })
          .from(productImages)
          .where(eq(productImages.productId, item.productId))
          .limit(1);

        return {
          ...item,
          image: image[0]?.image,
        };
      })
    );

    console.log("DEBUG: Sending enriched items:", enrichedItems.length);
    res.json({ success: true, data: enrichedItems });
  } catch (error) {
    console.error("DEBUG: Get Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
};

// TOGGLE WISHLIST (Add/Remove)
export const addToWishlist = async (req, res) => {
  try {
    const userId = parseInt(req.user?.id);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let { productId } = req.body;
    productId = parseInt(productId);

    if (!productId || isNaN(productId)) {
      return res.status(400).json({ success: false, message: "Valid productId is required" });
    }

    // Check if product exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product.length) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
      .limit(1);

    if (existing.length) {
      // Remove it (Toggle OFF)
      await db.delete(wishlist).where(eq(wishlist.id, existing[0].id));
      return res.json({ success: true, message: "Removed from wishlist", action: "removed" });
    } else {
      // Add it (Toggle ON)
      await db.insert(wishlist).values({ userId, productId });
      return res.json({ success: true, message: "Added to wishlist", action: "added" });
    }

  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle wishlist" });
  }
};

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = parseInt(req.user?.id);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let { id } = req.params;
    id = parseInt(id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "Valid Wishlist ID is required" });
    }

    const item = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.id, id), eq(wishlist.userId, userId)))
      .limit(1);

    if (!item.length) {
      return res.status(404).json({ success: false, message: "Wishlist item not found" });
    }

    await db.delete(wishlist).where(eq(wishlist.id, id));
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error("Remove from Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Failed to remove from wishlist" });
  }
};
