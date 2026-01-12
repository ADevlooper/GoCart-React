import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/api';

export const wishlistApi = createApi({
  reducerPath: 'wishlistApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL + '/',
    credentials: 'include',
  }),
  tagTypes: ['Wishlist'],
  endpoints: (builder) => ({
    getWishlist: builder.query({
      query: (userId) => `wishlist/user/${userId}`,
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation({
      query: (body) => {
        // Normalize body keys so frontend can send either camelCase or snake_case
        const normalized = {
          user_id: body.user_id ?? body.userId ?? body.user ?? null,
          product_id: body.product_id ?? body.productId ?? body.product ?? null,
        };
        return {
          url: 'wishlist/toggle',
          method: 'POST',
          body: normalized,
        };
      },
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation({
      query: (body) => {
        const normalized = {
          user_id: body.user_id ?? body.userId ?? body.user ?? null,
          product_id: body.product_id ?? body.productId ?? body.product ?? null,
        };
        return {
          url: 'wishlist/toggle',
          method: 'POST',
          body: normalized,
        };
      },
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
