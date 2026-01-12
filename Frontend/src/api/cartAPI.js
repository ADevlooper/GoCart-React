import { API_BASE_URL } from '../config/api';

const base = `${API_BASE_URL}/cart`;

export const addToCartAPI = (payload) =>
  fetch(`${base}/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

export const updateCartItemAPI = (id, payload) =>
  fetch(`${base}/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

export const removeFromCartAPI = (id) =>
  fetch(`${base}/${id}`, { method: 'DELETE', credentials: 'include' }).then((r) => r.json());

export const fetchCartAPI = (userId) =>
  fetch(`${base}/${userId}`, { credentials: 'include' }).then((r) => r.json());
