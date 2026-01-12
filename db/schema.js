import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  decimal,
  json
} from "drizzle-orm/pg-core";

// =========================
// USERS TABLE
// =========================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  zip_code: varchar("zip_code", { length: 20 }),
  role: varchar("role", { length: 50 }).default("user"), // default role
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});



// ------------------------
//  CATEGORIES TABLE
// ------------------------
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ------------------------
//  TAGS TABLE
// ------------------------
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
});

// ------------------------
//  PRODUCTS TABLE
// ------------------------
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"),
  stock: integer("stock").notNull(),
  availableStock: integer("available_stock").notNull(),
  brand: varchar("brand", { length: 255 }),
  warrantyInfo: varchar("warranty_info", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ------------------------
//  PRODUCT_CATEGORIES (join table)
// ------------------------
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" })
});

// ------------------------
//  PRODUCT_TAGS (join table)
// ------------------------
export const productTags = pgTable("product_tags", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" })
});

// ------------------------------------------------------------
//  PRODUCT_IMAGES TABLE (3 columns: thumbnail, preview, original)
// ------------------------------------------------------------
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),

  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  // Three separate URLs
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  previewUrl: varchar("preview_url", { length: 500 }),
  originalUrl: varchar("original_url", { length: 500 }),

  altText: varchar("alt_text", { length: 255 }),

  position: integer("position").default(0),

  createdAt: timestamp("created_at").defaultNow()
});





// =========================
//  WISHLIST TABLE
// =========================

// import { users } from "./usersSchema"; // for later when you add users

export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  productId: integer("product_id")
    .notNull()
    .references(() => products.id),

  createdAt: timestamp("created_at").defaultNow(),
});


// =========================
// CART TABLE (linked to users)
// =========================
// =========================
// CARTS TABLE (Session/Cart)
// =========================
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("active"), // active, ordered, abandoned
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =========================
// CART ITEMS TABLE
// =========================
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =========================
// ORDERS TABLE (linked to users)
// =========================
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),

  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // card/paypal/upi/cod
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed, cancelled

  shippingInfo: json("shipping_info").notNull(), // name, email, address, city, zip

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =========================
// ORDER ITEMS TABLE
// =========================
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),

  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(), // save product name at order time
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default(0),
});

// =========================
// TOKENS TABLE (for server-side sessions)
// =========================
export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  token: varchar("token", { length: 1000 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at")
});