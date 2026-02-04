// src/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const TOKEN_KEY = "auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // Auth
  register: (email, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),

  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  me: () => request("/auth/me"),

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
    request(`/products/${productId}/reviews/${reviewId}`, { method: "DELETE" }),
};
