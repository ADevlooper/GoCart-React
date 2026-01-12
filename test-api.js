#!/usr/bin/env node

/**
 * Simple API test script
 * Tests: auth, products, cart, wishlist, orders
 */

import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
let authToken = "";
let userId = 1;
let productId = 1;
let cartId = 1;

async function log(title, response) {
  const data = await response.json();
  console.log(`\n[${title}] Status: ${response.status}`);
  console.log(JSON.stringify(data, null, 2));
  return data;
}

async function testAuth() {
  console.log("\n========== AUTH TESTS ==========");

  // Register
  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
      phone: "1234567890",
      address: "123 Main St",
      city: "Springfield",
      zipCode: "12345",
    }),
  });

  // capture Set-Cookie header (server sets httpOnly cookie) and still read JSON body
  const setCookie = registerRes.headers.get('set-cookie') || registerRes.headers.get('Set-Cookie');
  const registerData = await log("REGISTER", registerRes);

  if (setCookie) {
    const match = setCookie.match(/auth_token=([^;]+)/);
    if (match) {
      authToken = match[1];
      try {
        console.log(`✅ Token (from Set-Cookie): ${authToken.substring(0, 20)}...`);
      } catch (e) {}
    }
  }

  if (registerData.success) {
    userId = registerData.data.user.id;
    console.log(`✅ UserId: ${userId}`);
  }
}

async function testProducts() {
  console.log("\n========== PRODUCTS TESTS ==========");

  // Get all products
  const productsRes = await fetch(`${BASE_URL}/products`);
  const productsData = await log("GET ALL PRODUCTS", productsRes);

  if (productsData.success && productsData.data && productsData.data.length > 0) {
    productId = productsData.data[0].id;
    console.log(`✅ Sample Product ID: ${productId}`);
  } else {
    console.warn("⚠️  No products found. Create some first.");
  }
}

async function testCart() {
  console.log("\n========== CART TESTS ==========");

  if (!authToken) {
    console.warn("⚠️  No auth token. Skipping cart tests.");
    return;
  }

  // Get cart (empty) - use userId in URL
  const getCartRes = await fetch(`${BASE_URL}/cart/${userId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const getCartData = await log("GET CART", getCartRes);

  if (getCartData.success && productId) {
    // Add to cart (POST /api/cart/)
    const addRes = await fetch(`${BASE_URL}/cart/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ productId: productId, quantity: 2 }),
    });
    const addData = await log("ADD TO CART", addRes);

    if (addData.success) {
      // Get cart again
      const getRes2 = await fetch(`${BASE_URL}/cart/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const cartData = await log("GET CART (AFTER ADD)", getRes2);
      if (cartData.success && cartData.items.length > 0) {
        cartId = cartData.items[0].cartId;
        console.log(`✅ Cart Item ID: ${cartId}`);
      }
    }
  }
}

async function testWishlist() {
  console.log("\n========== WISHLIST TESTS ==========");

  if (!authToken) {
    console.warn("⚠️  No auth token. Skipping wishlist tests.");
    return;
  }

  // Get wishlist (empty) - use userId in URL
  const getRes = await fetch(`${BASE_URL}/wishlist/user/${userId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const getData = await log("GET WISHLIST", getRes);

  if (getData.success && productId) {
    // Add to wishlist (toggle)
    const addRes = await fetch(`${BASE_URL}/wishlist/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ productId: productId }),
    });
    const addData = await log("ADD TO WISHLIST", addRes);

    if (addData.success) {
      // Get wishlist again
      const getRes2 = await fetch(`${BASE_URL}/wishlist/user/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      await log("GET WISHLIST (AFTER ADD)", getRes2);
    }
  }
}

async function testOrders() {
  console.log("\n========== ORDERS TESTS ==========");

  if (!authToken) {
    console.warn("⚠️  No auth token. Skipping orders tests.");
    return;
  }

  // Get orders (should be empty)
  const getRes = await fetch(`${BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const getData = await log("GET ORDERS", getRes);

  // Try to create an order (will fail if cart is empty)
  if (cartId) {
    const createRes = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        subtotal: 100,
        tax: 10,
        shipping: 5,
        totalAmount: 115,
        paymentMethod: "card",
        shippingInfo: {
          name: "Test User",
          email: "test@example.com",
          address: "123 Main St",
          city: "Springfield",
          zip: "12345",
        },
      }),
    });
    const createData = await log("CREATE ORDER", createRes);
  }
}

async function runTests() {
  console.log("🚀 Starting API tests...");
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  try {
    await testAuth();
    await testProducts();
    await testCart();
    await testWishlist();
    await testOrders();

    console.log("\n✅ Tests completed!");
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }

  process.exit(0);
}

runTests();
