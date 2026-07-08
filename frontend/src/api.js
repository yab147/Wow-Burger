/**
 * Wow Burger — Complete API Service Layer v2
 * Supports: Menu Items, Categories, Auth, Employees, Images, Analytics
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getToken() {
  try { return localStorage.getItem('wow-admin-token') || null; } catch { return null; }
}

export function setToken(token) {
  if (token) localStorage.setItem('wow-admin-token', token);
  else localStorage.removeItem('wow-admin-token');
}

export function getStoredAdmin() {
  try {
    const d = localStorage.getItem('wow-admin-user');
    return d ? JSON.parse(d) : null;
  } catch { return null; }
}

export function setStoredAdmin(admin) {
  if (admin) localStorage.setItem('wow-admin-user', JSON.stringify(admin));
  else localStorage.removeItem('wow-admin-user');
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...(!options._formData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
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
      setStoredAdmin(result.data.admin);
    }
    return result;
  },

  async me() { return apiFetch('/auth/me'); },

  logout() {
    setToken(null);
    setStoredAdmin(null);
  },

  async changePassword(current_password, new_password) {
    return apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    });
  },
};

// ============================================================
// EMPLOYEE API (super_admin only)
// ============================================================
export const employeesAPI = {
  async getAll() {
    const result = await apiFetch('/auth/employees');
    return result.data;
  },

  async create(employee) {
    const result = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
    return result.data;
  },

  async update(id, data) {
    const result = await apiFetch(`/auth/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result.data;
  },

  async delete(id) {
    return apiFetch(`/auth/employees/${id}`, { method: 'DELETE' });
  },

  async resetPassword(id, new_password) {
    return apiFetch(`/auth/employees/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password }),
    });
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
    const result = await apiFetch('/categories', { method: 'POST', body: JSON.stringify(category) });
    return result.data;
  },
  async update(id, category) {
    const result = await apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(category) });
    return result.data;
  },
  async delete(id) { return apiFetch(`/categories/${id}`, { method: 'DELETE' }); },
  async getStats() {
    const result = await apiFetch('/categories/stats/counts');
    return result.data;
  },
};

// ============================================================
// MENU ITEMS API
// ============================================================
export const menuItemsAPI = {
  /**
   * Get all items (public, no pagination)
   */
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/menu-items?${queryString}` : '/menu-items';
    const result = await apiFetch(endpoint);
    return result.data;
  },

  /**
   * Admin paginated + filtered list
   */
  async getPaginated({ page = 1, limit = 10, search = '', category = '', available = '', featured = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (available !== '') params.append('available', available);
    if (featured !== '') params.append('featured', featured);
    const result = await apiFetch(`/menu-items?${params.toString()}`);
    // Response has { items, total, page, limit, totalPages } or { data } for non-paginated
    return result;
  },

  async getById(id) {
    const result = await apiFetch(`/menu-items/${id}`);
    return result.data;
  },
  async getFeatured() { return this.getAll({ featured: 'true' }); },
  async getByCategory(categoryId) { return this.getAll({ category: categoryId }); },
  async search(query) { return this.getAll({ search: query }); },

  async create(item) {
    const result = await apiFetch('/menu-items', { method: 'POST', body: JSON.stringify(item) });
    return result.data;
  },
  async update(id, item) {
    const result = await apiFetch(`/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(item) });
    return result.data;
  },
  async delete(id) { return apiFetch(`/menu-items/${id}`, { method: 'DELETE' }); },
  async toggleAvailability(id) {
    const result = await apiFetch(`/menu-items/${id}/toggle`, { method: 'PATCH' });
    return result.data;
  },

  // ——— Image Gallery ———
  async uploadImage(itemId, formData) {
    const token = getToken();
    const response = await fetch(`${API_BASE}/menu-items/${itemId}/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data.data;
  },
  async deleteImage(itemId, imageId) {
    return apiFetch(`/menu-items/${itemId}/images/${imageId}`, { method: 'DELETE' });
  },

  // ——— Analytics ———
  async getTopViewed(limit = 10) {
    const result = await apiFetch(`/menu-items/analytics/top-viewed?limit=${limit}`);
    return result.data;
  },
};

// ============================================================
// HEALTH CHECK
// ============================================================
export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch { return false; }
}
