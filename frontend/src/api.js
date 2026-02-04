// src/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  // yritetään lukea body aina
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // Products
  getProducts: () => request("/products"),

  // Reviews
  addReview: (productId, payload) =>
    request(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateReview: (productId, reviewId, payload) =>
    request(`/products/${productId}/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteReview: (productId, reviewId) =>
    request(`/products/${productId}/reviews/${reviewId}`, {
      method: "DELETE",
    }),
};
