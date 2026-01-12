import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { addToCartAPI, removeFromCartAPI, fetchCartAPI, updateCartItemAPI } from '../api/cartAPI';

// Async thunks for backend API calls
export const fetchCart = createAsyncThunk('cart/fetchCart', async ({ userId, token }) => {
  const res = await fetchCartAPI(userId, token);
  return res;
});

export const addToCartAsync = createAsyncThunk('cart/addToCartAsync', async ({ payload, token }) => {
  const res = await addToCartAPI(payload, token);
  return res;
});

export const updateCartItemAsync = createAsyncThunk('cart/updateCartItemAsync', async ({ id, payload, token }) => {
  const res = await updateCartItemAPI(id, payload, token);
  return res;
});

export const removeFromCartAsync = createAsyncThunk('cart/removeFromCartAsync', async ({ id, token }) => {
  const res = await removeFromCartAPI(id, token);
  return res;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], status: 'idle' },
  reducers: {
    // Sync reducers for local UI updates
    addToCart(state, action) {
      // Accept either { product } or direct product payload
      const productPayload = action.payload?.product ?? action.payload;
      if (!productPayload || !productPayload.id) return;
      const existingItem = state.items.find(item => item.id === productPayload.id);
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + (productPayload.quantity || 1);
      } else {
        state.items.push({ ...productPayload, quantity: productPayload.quantity || 1 });
      }
    },
    removeFromCart(state, action) {
      const { id } = action.payload;
      state.items = state.items.filter(item => item.id !== id);
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        if (quantity > 0) {
          item.quantity = quantity;
        } else {
          state.items = state.items.filter(i => i.id !== id);
        }
      }
    },
    clearLocalCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    const normalizeItems = (items) => {
      if (!Array.isArray(items)) return [];
      return items.map(item => ({
        ...item,
        id: item.productId || item.id, // Use productId as the main identifiers for frontend consistency
        name: item.title || item.name,   // Ensure name is populated
        cartId: item.cartId              // Preserve database ID
      }));
    };

    // Handle async thunk responses
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.items = normalizeItems(action.payload?.items);
      state.status = 'idle';
    });
    builder.addCase(addToCartAsync.fulfilled, (state, action) => {
      state.items = normalizeItems(action.payload?.items || state.items);
    });
    builder.addCase(updateCartItemAsync.fulfilled, (state, action) => {
      state.items = normalizeItems(action.payload?.items || state.items);
    });
    builder.addCase(removeFromCartAsync.fulfilled, (state, action) => {
      state.items = normalizeItems(action.payload?.items || state.items);
    });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearLocalCart } = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;

// Memoized selector to prevent unnecessary rerenders
export const selectOrderSummary = createSelector(
  (state) => state.cart.items,
  (items) => {
    const cartItems = items || [];
    const subtotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    const shipping = subtotal > 100 ? 0 : 5.00;
    const tax = 0;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;
    return {
      subtotal,
      shipping,
      tax,
      discount,
      total,
    };
  }
);

export default cartSlice.reducer;
