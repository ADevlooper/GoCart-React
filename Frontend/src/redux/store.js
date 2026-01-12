import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { cartApi } from './cartApi';
import { wishlistApi } from './wishlistApi';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';
import orderReducer from './orderSlice';
import addressReducer from './addressSlice';

import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    addresses: addressReducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartApi.middleware, wishlistApi.middleware),
});

setupListeners(store.dispatch);
