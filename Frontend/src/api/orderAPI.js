import { API_BASE_URL } from '../config/api';

const base = `${API_BASE_URL}/orders`;

export const createOrderAPI = async (payload) => {
  const response = await fetch(`${base}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Order creation failed with status ${response.status}`);
  }
  return response.json();
};

// Fetch orders for authenticated user (uses server-side session)
export const fetchOrdersAPI = () =>
  fetch(`${base}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  }).then((r) => r.json());

export const fetchOrderByIdAPI = (id) =>
  fetch(`${base}/${id}`, { credentials: 'include' }).then((r) => r.json());
