// src/api.js
// Yksi paikka kaikille API-kutsuille (JSON + multipart/FormData)

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const TOKEN_KEY = "auth_token";

// --- Token helpers ---
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// --- Low-level request helpers ---

/**
 * JSON request helper:
 * - Asettaa Content-Type: application/json
 * - Lisää Authorization: Bearer <token> jos token löytyy
 * - Parsii vastauksen (JSON tai text)
 * - Heittää Error jos res.ok === false
 */
async function requestJson(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(res);
}

/**
 * FormData request helper:
 * - ÄLÄ aseta Content-Type headeria (browser lisää boundaryn itse)
 * - Lisää Authorization: Bearer <token> jos token löytyy
 */
async function requestForm(path, formData, options = {}) {
  const headers = { ...(options.headers || {}) };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "POST",
    headers,
    body: formData,
  });

  return parseResponse(res);
}

/**
 * Yhteinen response-parseri:
 * - lukee textinä
 * - yrittää JSON.parse
 * - jos ei ok -> throw Error järkevällä viestillä
 */
async function parseResponse(res) {
  const text = await res.text();

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// --- Public API ---

export const api = {
  // Auth (JSON)
  register(email, password) {
    return requestJson("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  login(email, password) {
    return requestJson("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  me() {
    return requestJson("/auth/me");
  },

  // Products
  getProducts() {
    return requestJson("/products");
  },

  /**
   * createProduct (multipart)
   * Backendissa: upload.single("image")
   * -> fieldname "image" pitää matchata
   */
  createProduct({ name, description, imageFile }) {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description || "");
    if (imageFile) fd.append("image", imageFile);

    // Huom: ei Content-Type headeria täällä
    return requestForm("/products", fd);
  },

  updateProduct({ productId, name, description, imageFile }) {
  const fd = new FormData();
  if (name != null) fd.append("name", name);
  if (description != null) fd.append("description", description);
  if (imageFile) fd.append("image", imageFile);

  return requestForm(`/products/${productId}`, fd, { method: "PUT" });
  },

  deleteProduct(productId) {
    return requestJson(`/products/${productId}`, { method: "DELETE" });
  },

  // Reviews (JSON)
  addReview(productId, payload) {
    return requestJson(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateReview(productId, reviewId, payload) {
    return requestJson(`/products/${productId}/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteReview(productId, reviewId) {
    return requestJson(`/products/${productId}/reviews/${reviewId}`, {
      method: "DELETE",
    });
  },
};
