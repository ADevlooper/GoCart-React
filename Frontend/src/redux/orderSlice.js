import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrderAPI, fetchOrdersAPI } from '../api/orderAPI';

export const createOrder = createAsyncThunk('order/createOrder', async ({ payload }) => {
  const res = await createOrderAPI(payload);
  return res;
});

// Fetch orders for authenticated user (no userId param needed - uses server session)
export const fetchOrders = createAsyncThunk('order/fetchOrders', async () => {
  const res = await fetchOrdersAPI();
  return res;
});

const orderSlice = createSlice({
  name: 'order',
  initialState: { orders: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createOrder.fulfilled, (state, action) => {
      // Do nothing, let fetchOrders populate the list 
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => { state.orders = action.payload?.data || []; });
  }
});

export default orderSlice.reducer;
