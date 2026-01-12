import { API_BASE_URL } from '../config/api';

const base = `${API_BASE_URL}/wishlist`;

export const toggleWishlistAPI = (payload) =>
  fetch(`${base}/toggle`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

export const fetchWishlistAPI = (userId) =>
  fetch(`${base}/user/${userId}`, { credentials: 'include' }).then((r) => r.json());
