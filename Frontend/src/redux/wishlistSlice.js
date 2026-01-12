import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toggleWishlistAPI, fetchWishlistAPI } from '../api/wishlistAPI';

// Async thunks for backend API calls
export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async ({ userId, token }) => {
  const res = await fetchWishlistAPI(userId, token);
  return res;
});

export const toggleWishlistAsync = createAsyncThunk('wishlist/toggleWishlistAsync', async ({ payload, token }) => {
  const res = await toggleWishlistAPI(payload, token);
  return res;
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], status: 'idle' },
  reducers: {
    // Sync reducers for local UI updates
    toggleWishlist(state, action) {
      const { productId } = action.payload;
      const existingIndex = state.items.findIndex(item => (item.productId || item.product_id || item.id) === productId);
      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push({ productId: productId });
      }
    },
    removeWishlistItem(state, action) {
      const { productId } = action.payload;
      state.items = state.items.filter(item => (item.productId || item.product_id || item.id) !== productId);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.fulfilled, (state, action) => {
      // Backend returns { success: true, data: [...] } or just [...]
      const data = action.payload.data || action.payload || [];
      state.items = Array.isArray(data) ? data : [];
    });
    builder.addCase(toggleWishlistAsync.fulfilled, (state, action) => {
      // Backend returns { success: true, action: "added"|"removed", ... }
      const { action: toggleAction } = action.payload;
      const originalArg = action.meta.arg.payload; // { productId: ... }
      const productId = originalArg?.productId;

      if (toggleAction === 'removed' && productId) {
        state.items = state.items.filter(item => (item.productId || item.product_id || item.id) !== productId);
      } else if (toggleAction === 'added' && productId) {
        // Check if already exists to avoid duplicates
        const exists = state.items.some(item => (item.productId || item.product_id || item.id) === productId);
        if (!exists) {
          state.items.push({ productId: productId });
        }
      }
    });
  }
});

export const { toggleWishlist, removeWishlistItem } = wishlistSlice.actions;

// Selectors
// Return array of product IDs for easy checking (e.g. wishlist.includes(id))
export const selectWishlist = (state) => state.wishlist.items.map(item => item.productId || item.product_id || item.id);
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsInWishlist = (state, productId) =>
  state.wishlist.items.some(item => (item.productId || item.product_id || item.id) === productId);

export default wishlistSlice.reducer;
