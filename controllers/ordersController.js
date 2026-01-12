import { db } from "../db/index.js";
import { orders, orderItems, products, carts, cartItems } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

// CREATE ORDER
// CREATE ORDER
// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subtotal, tax, shipping, totalAmount, shippingInfo, paymentMethod } = req.body;

    console.log("=== ORDER CREATION REQUEST ===");
    console.log("User ID:", userId);

    // Validate main fields
    const missingFields = [];
    if (subtotal === undefined) missingFields.push("subtotal");
    if (tax === undefined) missingFields.push("tax");
    if (shipping === undefined) missingFields.push("shipping");
    if (totalAmount === undefined) missingFields.push("totalAmount");
    if (!shippingInfo) missingFields.push("shippingInfo");
    if (!paymentMethod) missingFields.push("paymentMethod");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required order fields: ${missingFields.join(", ")}`
      });
    }

    // Start Transaction
    const orderId = await db.transaction(async (tx) => {
      // 1. Get filtered cart items from ACTIVE cart
      const usersCartItems = await tx
        .select({
          productId: cartItems.productId,
          quantity: cartItems.quantity,
          title: products.title,
          price: products.price,
          discount: products.discount,
          cartId: carts.id,
        })
        .from(cartItems)
        .innerJoin(carts, eq(cartItems.cartId, carts.id))
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(and(eq(carts.userId, userId), eq(carts.status, "active")));

      if (!usersCartItems.length) {
        throw new Error("Cart is empty or no active cart found");
      }

      // 2. Insert into orders table with paymentStatus
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId,
          subtotal: Number(subtotal),
          tax: Number(tax),
          shipping: Number(shipping),
          totalAmount: Number(totalAmount),
          paymentMethod,
          status: "pending",
          paymentStatus: "pending", // Default to pending
          shippingInfo: JSON.stringify(shippingInfo),
        })
        .returning();

      if (!newOrder) throw new Error("Failed to create order");

      // 3. Insert into orderItems table (Batch Insert)
      if (usersCartItems.length > 0) {
        await tx.insert(orderItems).values(
          usersCartItems.map((item) => ({
            orderId: newOrder.id,
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            price: Number(item.price),
            discountPercentage: Number(item.discount) || 0,
          }))
        );
      }

      // 4. Update cart status to 'ordered'
      // This effectively "clears" the active cart for the user
      await tx.update(carts)
        .set({ status: "ordered", updatedAt: new Date() })
        .where(eq(carts.id, usersCartItems[0].cartId));

      return newOrder.id;
    });

    res.status(201).json({
      success: true,
      orderId: orderId,
      message: "Order created successfully"
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    // return proper error message to frontend
    res.status(err.message.includes("Cart is empty") ? 400 : 500)
      .json({ success: false, message: err.message || "Failed to create order" });
  }
};

// GET ALL ORDERS FOR LOGGED-IN USER
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId));

    // Attach items to each order
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items,
          shippingInfo: typeof order.shippingInfo === 'string'
            ? JSON.parse(order.shippingInfo || "{}")
            : order.shippingInfo,
        };
      })
    );

    res.json({
      success: true,
      data: ordersWithItems
    });
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(id)))
      .limit(1);

    if (!order.length || order[0].userId !== userId) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, Number(id)));

    res.json({
      success: true,
      data: {
        ...order[0],
        items,
        shippingInfo: typeof order[0].shippingInfo === 'string'
          ? JSON.parse(order[0].shippingInfo || "{}")
          : order[0].shippingInfo,
      }
    });
  } catch (err) {
    console.error("Get Order Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};
