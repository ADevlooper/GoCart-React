import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/api';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL + '/',
    credentials: 'include',
  }),
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    getCart: builder.query({
      query: (userId) => `cart/${userId}`,
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (body) => ({
        url: 'cart/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCart: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `cart/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: ({ id }) => ({
        url: `cart/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartMutation,
  useRemoveFromCartMutation,
} = cartApi;