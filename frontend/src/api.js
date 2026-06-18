/**
 * Wow Burger — API Service Layer
 * Connects the React frontend to the Express backend.
 * Falls back to localStorage when the backend is unavailable.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Get the stored auth token
 */
function getToken() {
  try {
    return localStorage.getItem('wow-admin-token') || null;
  } catch {
    return null;
  }
}

/**
 * Set the auth token
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem('wow-admin-token', token);
  } else {
    localStorage.removeItem('wow-admin-token');
  }
}

/**
 * Core fetch wrapper with auth headers and error handling
 */
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return data;
}

// ============================================================
// AUTH API
// ============================================================

export const authAPI = {
  async login(username, password) {
    const result = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (result.data?.token) {
      setToken(result.data.token);
    }
    return result;
  },

  async me() {
    return apiFetch('/auth/me');
  },

  logout() {
    setToken(null);
  },
};

// ============================================================
// CATEGORIES API
// ============================================================

export const categoriesAPI = {
  async getAll() {
    const result = await apiFetch('/categories');
    return result.data;
  },

  async getById(id) {
    const result = await apiFetch(`/categories/${id}`);
    return result.data;
  },

  async create(category) {
    const result = await apiFetch('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return result.data;
  },

  async update(id, category) {
    const result = await apiFetch(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
    return result.data;
  },

  async delete(id) {
    return apiFetch(`/categories/${id}`, { method: 'DELETE' });
  },

  async getStats() {
    const result = await apiFetch('/categories/stats/counts');
    return result.data;
  },
};

// ============================================================
// MENU ITEMS API
// ============================================================

export const menuItemsAPI = {
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/menu-items?${queryString}` : '/menu-items';
    const result = await apiFetch(endpoint);
    return result.data;
  },

  async getById(id) {
    const result = await apiFetch(`/menu-items/${id}`);
    return result.data;
  },

  async getFeatured() {
    return this.getAll({ featured: 'true' });
  },

  async getByCategory(categoryId) {
    return this.getAll({ category: categoryId });
  },

  async search(query) {
    return this.getAll({ search: query });
  },

  async create(item) {
    const result = await apiFetch('/menu-items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return result.data;
  },

  async update(id, item) {
    const result = await apiFetch(`/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return result.data;
  },

  async delete(id) {
    return apiFetch(`/menu-items/${id}`, { method: 'DELETE' });
  },

  async toggleAvailability(id) {
    const result = await apiFetch(`/menu-items/${id}/toggle`, {
      method: 'PATCH',
    });
    return result.data;
  },
};

// ============================================================
// HEALTH CHECK
// ============================================================

export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, { 
      signal: AbortSignal.timeout(3000) 
    });
    return response.ok;
  } catch {
    return false;
  }
}
