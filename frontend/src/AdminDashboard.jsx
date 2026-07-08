import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Utensils, Tags, LogOut, Plus, Edit3, Trash2, 
  Search, X, CheckCircle2, Users, Key, Eye, Upload, Shield, 
  Check, AlertCircle, ChevronLeft, ChevronRight, EyeOff, Loader
} from 'lucide-react';
import { menuItemsAPI, categoriesAPI, authAPI, employeesAPI } from './api';

export default function AdminDashboard({ onLogout, useBackend, categories: initialCategories }) {
  // Tabs: dashboard, items, categories, employees, password
  const [activeTab, setActiveTab] = useState('items');
  const [editingItem, setEditingItem] = useState(null);
  
  // Auth Admin State
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // Pagination & Filtering state for items
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filters state
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availableFilter, setAvailableFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');

  // Categories list
  const [categories, setCategories] = useState(initialCategories || []);

  // Employee management state (super_admin only)
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employeePasswordReset, setEmployeePasswordReset] = useState(null);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Analytics top viewed state
  const [topViewedItems, setTopViewedItems] = useState([]);

  // Fetch current admin user
  useEffect(() => {
    if (useBackend) {
      authAPI.me()
        .then(res => {
          if (res.success && res.data) {
            setCurrentAdmin(res.data);
          }
        })
        .catch(err => console.error('Failed to load current admin:', err));
    } else {
      // Offline fallback
      setCurrentAdmin({
        username: 'admin',
        full_name: 'Wow Burger Admin',
        role: 'super_admin'
      });
    }
  }, [useBackend]);

  // Load menu items (paginated & filtered)
  const loadMenuItems = useCallback(async () => {
    setIsLoading(true);
    try {
      if (useBackend) {
        const res = await menuItemsAPI.getPaginated({
          page,
          limit,
          search: searchFilter,
          category: categoryFilter,
          available: availableFilter,
          featured: featuredFilter
        });
        if (res.success) {
          setItems(res.items || []);
          setTotalItems(res.total || 0);
          setTotalPages(res.totalPages || 1);
        }
      } else {
        // Offline client-side mockup pagination and filtering
        let local = JSON.parse(localStorage.getItem('wow-menu')) || [];
        if (searchFilter) {
          local = local.filter(x => 
            x.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
            x.id.toLowerCase().includes(searchFilter.toLowerCase())
          );
        }
        if (categoryFilter) {
          local = local.filter(x => x.category_id === categoryFilter);
        }
        if (availableFilter !== '') {
          const isAvail = availableFilter === 'true';
          local = local.filter(x => x.is_available === isAvail);
        }
        if (featuredFilter !== '') {
          const isFeat = featuredFilter === 'true';
          local = local.filter(x => x.is_featured === isFeat);
        }
        setTotalItems(local.length);
        const pages = Math.ceil(local.length / limit) || 1;
        setTotalPages(pages);
        
        const offset = (page - 1) * limit;
        setItems(local.slice(offset, offset + limit));
      }
    } catch (err) {
      console.error('Error loading items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [useBackend, page, limit, searchFilter, categoryFilter, availableFilter, featuredFilter]);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  // Load dashboard analytics / categories / employees
  useEffect(() => {
    if (activeTab === 'dashboard') {
      if (useBackend) {
        menuItemsAPI.getTopViewed(5)
          .then(res => setTopViewedItems(res || []))
          .catch(err => console.error('Analytics load error:', err));
        categoriesAPI.getAll()
          .then(res => setCategories(res || []))
          .catch(err => console.error('Categories load error:', err));
      } else {
        // Mock top views from localStorage views or random
        const local = JSON.parse(localStorage.getItem('wow-menu')) || [];
        const sorted = [...local].map(x => ({ ...x, view_count: x.view_count || Math.floor(Math.random() * 200) }));
        sorted.sort((a, b) => b.view_count - a.view_count);
        setTopViewedItems(sorted.slice(0, 5));
      }
    } else if (activeTab === 'employees' && currentAdmin?.role === 'super_admin') {
      if (useBackend) {
        employeesAPI.getAll()
          .then(res => setEmployees(res || []))
          .catch(err => console.error('Employees load error:', err));
      } else {
        // Mock employees list
        setEmployees([
          { id: 1, username: 'admin', full_name: 'Wow Burger Admin', role: 'super_admin', email: 'admin@wowburger.com', is_active: true },
          { id: 2, username: 'staff1', full_name: 'Abebe Kebede', role: 'staff', email: 'abebe@wowburger.com', is_active: true }
        ]);
      }
    }
  }, [activeTab, useBackend, currentAdmin]);

  // Handle item delete
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (useBackend) {
        await menuItemsAPI.delete(id);
      } else {
        let local = JSON.parse(localStorage.getItem('wow-menu')) || [];
        local = local.filter(x => x.id !== id);
        localStorage.setItem('wow-menu', JSON.stringify(local));
      }
      loadMenuItems();
    } catch (err) {
      alert(err.message || 'Failed to delete item.');
    }
  };

  // Toggle item availability
  const handleToggleAvailable = async (id) => {
    try {
      if (useBackend) {
        await menuItemsAPI.toggleAvailability(id);
      } else {
        let local = JSON.parse(localStorage.getItem('wow-menu')) || [];
        local = local.map(x => x.id === id ? { ...x, is_available: !x.is_available } : x);
        localStorage.setItem('wow-menu', JSON.stringify(local));
      }
      loadMenuItems();
    } catch (err) {
      alert(err.message || 'Failed to toggle availability.');
    }
  };

  // Add / Edit Save Item
  const handleSaveItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const ingredients = formData.get('ingredients').split(',').map(s => s.trim()).filter(Boolean);
    const highlights = formData.get('highlights').split(',').map(s => s.trim()).filter(Boolean);
    const dietary_tags = formData.get('dietary_tags').split(',').map(s => s.trim()).filter(Boolean);

    const base_price = parseFloat(formData.get('price'));
    const itemData = {
      id: editingItem?.id || `item-${Date.now()}`,
      name: formData.get('name'),
      category_id: formData.get('category_id'),
      base_price,
      price: base_price,
      image_url: formData.get('image_url') || editingItem?.image_url || 'assets/classic_burger.png',
      badge: formData.get('badge') || '',
      rating: parseFloat(formData.get('rating') || '0.0'),
      description: formData.get('description'),
      is_available: formData.get('is_available') === 'true',
      is_featured: formData.get('is_featured') === 'true',
      ingredients,
      highlights,
      dietary_tags,
      sort_order: parseInt(formData.get('sort_order') || '0'),
      nutrition: {
        calories: formData.get('calories') || '0',
        protein: formData.get('protein') || '0g',
        carbs: formData.get('carbs') || '0g',
        fat: formData.get('fat') || '0g'
      }
    };

    try {
      if (useBackend) {
        if (editingItem && editingItem.id) {
          await menuItemsAPI.update(editingItem.id, itemData);
        } else {
          await menuItemsAPI.create(itemData);
        }
      } else {
        let local = JSON.parse(localStorage.getItem('wow-menu')) || [];
        if (editingItem && editingItem.id) {
          local = local.map(x => x.id === editingItem.id ? { ...x, ...itemData } : x);
        } else {
          local.push(itemData);
        }
        localStorage.setItem('wow-menu', JSON.stringify(local));
      }
      setEditingItem(null);
      loadMenuItems();
    } catch (err) {
      alert(err.message || 'Failed to save menu item.');
    }
  };

  // Image Upload handler
  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !editingItem?.id) return;
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('is_primary', 'true');
    formData.append('alt_text', editingItem.name || 'main image');
    
    try {
      if (useBackend) {
        const newImg = await menuItemsAPI.uploadImage(editingItem.id, formData);
        setEditingItem(prev => ({
          ...prev,
          image_url: newImg.image_url,
          images: prev.images ? [...prev.images, newImg] : [newImg]
        }));
        loadMenuItems();
      } else {
        alert('Image upload runs on live backend server.');
      }
    } catch (err) {
      alert(err.message || 'Image upload failed');
    }
  };

  // Gallery Image Upload handler
  const handleGalleryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !editingItem?.id) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('is_primary', 'false');
    formData.append('alt_text', `${editingItem.name} gallery image`);
    
    try {
      if (useBackend) {
        const newImg = await menuItemsAPI.uploadImage(editingItem.id, formData);
        setEditingItem(prev => ({
          ...prev,
          images: prev.images ? [...prev.images, newImg] : [newImg]
        }));
      } else {
        alert('Image upload runs on live backend server.');
      }
    } catch (err) {
      alert(err.message || 'Upload failed');
    }
  };

  // Delete Gallery Image handler
  const handleDeleteGalleryImage = async (imageId) => {
    if (!window.confirm('Delete this gallery image?')) return;
    try {
      if (useBackend) {
        await menuItemsAPI.deleteImage(editingItem.id, imageId);
        setEditingItem(prev => ({
          ...prev,
          images: prev.images.filter(img => img.id !== imageId)
        }));
      } else {
        alert('Action runs on live backend server.');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete image');
    }
  };

  // Password Change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    try {
      if (useBackend) {
        await authAPI.changePassword(passwordForm.current_password, passwordForm.new_password);
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      } else {
        setPasswordMessage({ type: 'success', text: 'Offline mode: Password validation simulated.' });
      }
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    }
  };

  // Employee Add / Register handler
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const employeeData = {
      username: fd.get('username'),
      full_name: fd.get('full_name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      role: fd.get('role'),
      password: fd.get('password')
    };

    try {
      if (useBackend) {
        await employeesAPI.create(employeeData);
        setShowAddEmployee(false);
        // Refresh employees
        const list = await employeesAPI.getAll();
        setEmployees(list);
      } else {
        const mockNew = {
          id: Date.now(),
          ...employeeData,
          is_active: true
        };
        setEmployees(prev => [...prev, mockNew]);
        setShowAddEmployee(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to create employee');
    }
  };

  // Employee Edit Update handler
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const updatedData = {
      full_name: fd.get('full_name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      role: fd.get('role'),
      is_active: fd.get('is_active') === 'true'
    };

    try {
      if (useBackend) {
        await employeesAPI.update(editingEmployee.id, updatedData);
        setEditingEmployee(null);
        const list = await employeesAPI.getAll();
        setEmployees(list);
      } else {
        setEmployees(prev => prev.map(x => x.id === editingEmployee.id ? { ...x, ...updatedData } : x));
        setEditingEmployee(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to update employee');
    }
  };

  // Employee Reset Password handler
  const handleResetEmployeePassword = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const new_password = fd.get('new_password');

    try {
      if (useBackend) {
        await employeesAPI.resetPassword(employeePasswordReset.id, new_password);
        alert('Password reset completed successfully!');
        setEmployeePasswordReset(null);
      } else {
        alert(`Offline: simulated reset to ${new_password}`);
        setEmployeePasswordReset(null);
      }
    } catch (err) {
      alert(err.message || 'Password reset failed');
    }
  };

  // Employee Delete handler
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      if (useBackend) {
        await employeesAPI.delete(id);
        const list = await employeesAPI.getAll();
        setEmployees(list);
      } else {
        setEmployees(prev => prev.filter(x => x.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-strong)', letterSpacing: '0.5px' }}>Wow Burger</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Workspace {useBackend && '(Live DB)'}</p>
        </div>

        <nav className="admin-sidebar__nav">
          <button 
            onClick={() => { setActiveTab('dashboard'); setEditingItem(null); }}
            className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> <span className="admin-nav-label">Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('items'); setEditingItem(null); }}
            className={`admin-nav-btn ${activeTab === 'items' ? 'active' : ''}`}>
            <Utensils size={20} /> <span className="admin-nav-label">Menu Items</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('categories'); setEditingItem(null); }}
            className={`admin-nav-btn ${activeTab === 'categories' ? 'active' : ''}`}>
            <Tags size={20} /> <span className="admin-nav-label">Categories</span>
          </button>

          {currentAdmin?.role === 'super_admin' && (
            <button 
              onClick={() => { setActiveTab('employees'); setEditingItem(null); }}
              className={`admin-nav-btn ${activeTab === 'employees' ? 'active' : ''}`}>
              <Users size={20} /> <span className="admin-nav-label">Employees</span>
            </button>
          )}

          <button 
            onClick={() => { setActiveTab('password'); setEditingItem(null); }}
            className={`admin-nav-btn ${activeTab === 'password' ? 'active' : ''}`}>
            <Key size={20} /> <span className="admin-nav-label">Change Password</span>
          </button>

          <button onClick={onLogout} className="admin-logout-btn">
            <LogOut size={20} /> <span className="admin-nav-label">Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem' }}>Welcome Back, {currentAdmin?.full_name}!</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--orange-tint)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Utensils size={28} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Items</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: '800' }}>{totalItems}</h3>
                </div>
              </div>
              
              <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--yellow-tint)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tags size={28} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase' }}>Categories</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: '800' }}>{categories.length}</h3>
                </div>
              </div>
            </div>

            {/* Popular Viewed items Analytics Section */}
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={20} color="var(--orange)" /> Popular Items Analytics (Most Viewed)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topViewedItems.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No views tracked yet. Try viewing items on the main menu page!</p>
                ) : (
                  topViewedItems.map((item, idx) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--orange)', width: '24px' }}>#{idx + 1}</span>
                        <img src={item.image_url} alt={item.name} style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                        <div>
                          <p style={{ fontWeight: '700', color: 'var(--text-strong)' }}>{item.name}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.base_price || item.price} ETB</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--orange-tint)', color: 'var(--orange)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '0.9rem' }}>
                          <Eye size={16} /> {item.view_count || 0} views
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
               <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>System Status</h3>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)' }}>
                 <CheckCircle2 size={24} color="#10B981" />
                 <div>
                   <p style={{ fontWeight: '600' }}>All systems operational</p>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                     {useBackend ? 'Fully connected to live MySQL dynamic database API.' : 'Local storage data layer is synced and active.'}
                   </p>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Menu Items Tab */}
        {activeTab === 'items' && !editingItem && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="admin-header">
              <div>
                <h2 className="admin-title">Menu Items</h2>
                <p style={{ color: 'var(--text-muted)' }}>Manage menu listings, upload photos, and view metrics.</p>
              </div>
              <button className="btn btn--primary" onClick={() => setEditingItem({})}>
                <Plus size={18} /> Add New Item
              </button>
            </div>

            {/* Filter Options Panel */}
            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Search Items</label>
                <div style={{ position: 'relative' }}>
                  <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search name or ID..." 
                    value={searchFilter}
                    onChange={(e) => { setSearchFilter(e.target.value); setPage(1); }}
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Category</label>
                <select 
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-soft)', color: 'var(--text)' }}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Availability</label>
                <select 
                  value={availableFilter}
                  onChange={(e) => { setAvailableFilter(e.target.value); setPage(1); }}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-soft)', color: 'var(--text)' }}>
                  <option value="">All</option>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Featured Status</label>
                <select 
                  value={featuredFilter}
                  onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-soft)', color: 'var(--text)' }}>
                  <option value="">All</option>
                  <option value="true">Featured</option>
                </select>
              </div>
            </div>

            {/* Items Table Container */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                    <Loader size={40} className="animate-spin" color="var(--orange)" />
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Loading items...</span>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items found.</td>
                        </tr>
                      ) : items.map(item => (
                        <tr key={item.id}>
                          <td data-label="Item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={item.image_url} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', background: 'var(--hero-bg)' }} />
                            <div>
                              <p style={{ fontWeight: '600', color: 'var(--text-strong)' }}>{item.name}</p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.id}</p>
                            </div>
                          </td>
                          <td data-label="Category">
                            <span style={{ padding: '0.25rem 0.75rem', background: 'var(--orange-tint)', color: 'var(--orange)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '600' }}>
                              {categories.find(c => c.id === item.category_id)?.name || 'Unknown'}
                            </span>
                          </td>
                          <td data-label="Price" style={{ fontWeight: '600' }}>{item.base_price || item.price} ETB</td>
                          <td data-label="Status">
                            <button 
                              onClick={() => handleToggleAvailable(item.id)}
                              style={{ 
                                padding: '0.25rem 0.75rem', 
                                border: 'none',
                                borderRadius: 'var(--radius-full)', 
                                fontSize: '0.75rem', 
                                fontWeight: '700',
                                cursor: 'pointer',
                                background: item.is_available ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: item.is_available ? '#10B981' : '#EF4444'
                              }}>
                              {item.is_available ? 'Available' : 'Unavailable'}
                            </button>
                            {item.is_featured && (
                              <span style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', background: 'var(--yellow-tint)', color: '#D97706', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700' }}>
                                Featured
                              </span>
                            )}
                          </td>
                          <td data-label="Views">
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Eye size={14} /> {item.view_count || 0}
                            </span>
                          </td>
                          <td data-label="Actions" style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button onClick={() => setEditingItem(item)} style={{ padding: '0.5rem', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', transition: '0.2s', background: 'var(--surface-soft)' }}>
                                <Edit3 size={18} />
                              </button>
                              <button onClick={() => handleDeleteItem(item.id)} style={{ padding: '0.5rem', color: '#EF4444', borderRadius: 'var(--radius-sm)', transition: '0.2s', background: 'rgba(239, 68, 68, 0.1)' }}>
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Server-Side Pagination Bar */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>Show</span>
                  <select 
                    value={limit} 
                    onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>items per page (Total: {totalItems})</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', background: page === 1 ? 'var(--surface-soft)' : 'var(--surface)', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? 'var(--text-soft)' : 'var(--text)' }}>
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Page {page} of {totalPages}</span>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', background: page === totalPages ? 'var(--surface-soft)' : 'var(--surface)', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? 'var(--text-soft)' : 'var(--text)' }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Form */}
        {activeTab === 'items' && editingItem && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{editingItem.id ? 'Edit Menu Item' : 'Create New Item'}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{editingItem.id ? `Editing ${editingItem.name}` : 'Fill in the details below to add a new item.'}</p>
              </div>
              <button onClick={() => setEditingItem(null)} style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Split page layout for image upload + details form */}
            <div style={{ display: 'grid', gridTemplateColumns: editingItem.id ? '1fr 280px' : '1fr', gap: '2rem', alignItems: 'start' }}>
              
              <form onSubmit={handleSaveItem} style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Item ID (Unique shortname)</label>
                    <input name="id" defaultValue={editingItem.id} disabled={!!editingItem.id} placeholder="e.g. classic-burger" required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: editingItem.id ? 'var(--surface-soft)' : 'var(--surface)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Item Name</label>
                    <input name="name" defaultValue={editingItem.name} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Category</label>
                    <select name="category_id" defaultValue={editingItem.category_id} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                      <option value="">Select a category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Price (ETB)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingItem.base_price || editingItem.price} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Image URL</label>
                    <input name="image_url" value={editingItem.image_url || ''} readOnly placeholder="Upload a photo or enter URL..." style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Badge</label>
                    <input name="badge" defaultValue={editingItem.badge} placeholder="e.g. Bestseller, Spicy" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                </div>

                {/* Upload Main Photo Widget */}
                {editingItem.id && (
                  <div style={{ padding: '1rem', background: 'var(--orange-tint)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--orange)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--orange)', marginBottom: '0.5rem' }}>Upload Main Photo</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--orange)', color: 'var(--white)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                        <Upload size={16} /> Choose File
                        <input type="file" accept="image/*" onChange={handleMainImageUpload} style={{ display: 'none' }} />
                      </label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overwrites primary URL</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rating</label>
                    <input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={editingItem.rating} placeholder="4.5" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Sort Order</label>
                    <input name="sort_order" type="number" defaultValue={editingItem.sort_order} placeholder="0" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Availability</label>
                    <select name="is_available" defaultValue={editingItem.is_available !== false ? 'true' : 'false'} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Featured</label>
                    <select name="is_featured" defaultValue={editingItem.is_featured ? 'true' : 'false'} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                      <option value="false">Normal</option>
                      <option value="true">Featured On Homepage</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Description</label>
                  <textarea name="description" defaultValue={editingItem.description} required rows="3" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', resize: 'vertical' }}></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Ingredients (comma separated)</label>
                    <input name="ingredients" defaultValue={editingItem.ingredients?.join(', ')} placeholder="Beef Pattie, Cheese, Tomato" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Highlights (comma separated)</label>
                    <input name="highlights" defaultValue={editingItem.highlights?.join(', ')} placeholder="Juicy, Fresh Baked Buns" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Dietary Tags (comma separated)</label>
                  <input name="dietary_tags" defaultValue={editingItem.dietary_tags?.join(', ')} placeholder="Halal, Gluten-Free" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                </div>

                <div style={{ padding: '1.5rem', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>Nutritional Information</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Calories</label>
                      <input name="calories" defaultValue={editingItem.nutrition?.calories} placeholder="e.g. 500" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Protein</label>
                      <input name="protein" defaultValue={editingItem.nutrition?.protein} placeholder="e.g. 20g" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Carbs</label>
                      <input name="carbs" defaultValue={editingItem.nutrition?.carbs} placeholder="e.g. 40g" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Fat</label>
                      <input name="fat" defaultValue={editingItem.nutrition?.fat} placeholder="e.g. 15g" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <button type="button" className="btn btn--outline" onClick={() => setEditingItem(null)}>Cancel</button>
                  <button type="submit" className="btn btn--primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>Save Item</button>
                </div>
              </form>

              {/* Side panel for Item Image Gallery (only shown for existing items) */}
              {editingItem.id && (
                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Item Gallery</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Add multiple images for the detail page slider.</p>
                  
                  {/* Gallery Upload Button */}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem 1rem', cursor: 'pointer', color: 'var(--text-muted)', transition: 'var(--transition)', hover: { borderColor: 'var(--orange)' } }}>
                    <Plus size={20} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleGalleryImageUpload} style={{ display: 'none' }} />
                  </label>

                  {/* Gallery Photos list */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {editingItem.images && editingItem.images.map((img) => (
                      <div key={img.id} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '1', border: '1px solid var(--border)' }}>
                        <img src={img.image_url} alt={img.alt_text} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button"
                          onClick={() => handleDeleteGalleryImage(img.id)}
                          style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(239, 68, 68, 0.9)', color: 'var(--white)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8rem' }}>
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Menu Categories</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Categories define how items are grouped on the main menu. (Read-only view)</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{cat.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{cat.id}</p>
                    </div>
                    <span style={{ background: 'var(--surface-soft)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Order: {cat.sort_order}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', flex: 1 }}>{cat.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employees Tab (super_admin only) */}
        {activeTab === 'employees' && currentAdmin?.role === 'super_admin' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="admin-header">
              <div>
                <h2 className="admin-title">Employee Management</h2>
                <p style={{ color: 'var(--text-muted)' }}>Add staff members, manage roles, and reset access passwords.</p>
              </div>
              <button className="btn btn--primary" onClick={() => { setShowAddEmployee(true); setEditingEmployee(null); setEmployeePasswordReset(null); }}>
                <Plus size={18} /> Add Employee
              </button>
            </div>

            {/* List Employees */}
            {!showAddEmployee && !editingEmployee && !employeePasswordReset && (
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Username</th>
                      <th>Email / Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id}>
                        <td style={{ fontWeight: '600', color: 'var(--text-strong)' }}>{emp.full_name}</td>
                        <td>{emp.username}</td>
                        <td>
                          <div>{emp.email || '—'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.phone || '—'}</div>
                        </td>
                        <td>
                          <span style={{ padding: '0.25rem 0.75rem', background: emp.role === 'super_admin' ? 'rgba(99, 102, 241, 0.15)' : emp.role === 'manager' ? 'rgba(217, 119, 6, 0.15)' : 'rgba(107, 114, 128, 0.15)', color: emp.role === 'super_admin' ? '#6366F1' : emp.role === 'manager' ? '#D97706' : '#6B7280', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '700' }}>
                            {emp.role}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: emp.is_active ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                            {emp.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => setEmployeePasswordReset(emp)} 
                              title="Reset Password"
                              style={{ padding: '0.5rem', color: 'var(--orange)', borderRadius: 'var(--radius-sm)', background: 'var(--orange-tint)', border: 'none', cursor: 'pointer' }}>
                              <Key size={16} />
                            </button>
                            <button 
                              onClick={() => setEditingEmployee(emp)} 
                              style={{ padding: '0.5rem', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-soft)', border: 'none', cursor: 'pointer' }}>
                              <Edit3 size={16} />
                            </button>
                            <button 
                              disabled={emp.id === currentAdmin?.id}
                              onClick={() => handleDeleteEmployee(emp.id)} 
                              style={{ padding: '0.5rem', color: '#EF4444', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: emp.id === currentAdmin?.id ? 'not-allowed' : 'pointer', opacity: emp.id === currentAdmin?.id ? 0.5 : 1 }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add Employee Form */}
            {showAddEmployee && (
              <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Create Staff Account</h3>
                  <button onClick={() => setShowAddEmployee(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
                    <input name="full_name" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Username</label>
                    <input name="username" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Password</label>
                    <input name="password" type="password" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email</label>
                    <input name="email" type="email" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Phone</label>
                    <input name="phone" placeholder="+251..." style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Role</label>
                    <select name="role" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                      <option value="staff">Staff / Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" className="btn btn--outline" onClick={() => setShowAddEmployee(false)}>Cancel</button>
                    <button type="submit" className="btn btn--primary">Save Account</button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Employee Form */}
            {editingEmployee && (
              <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Edit Employee Profile</h3>
                  <button onClick={() => setEditingEmployee(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <form onSubmit={handleUpdateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
                    <input name="full_name" defaultValue={editingEmployee.full_name} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email</label>
                    <input name="email" type="email" defaultValue={editingEmployee.email} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Phone</label>
                    <input name="phone" defaultValue={editingEmployee.phone} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Role</label>
                    <select name="role" defaultValue={editingEmployee.role} disabled={editingEmployee.id === currentAdmin?.id} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                      <option value="staff">Staff / Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Status</label>
                    <select name="is_active" defaultValue={editingEmployee.is_active ? 'true' : 'false'} disabled={editingEmployee.id === currentAdmin?.id} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                      <option value="true">Active</option>
                      <option value="false">Suspended / Deactivated</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" className="btn btn--outline" onClick={() => setEditingEmployee(null)}>Cancel</button>
                    <button type="submit" className="btn btn--primary">Update Profile</button>
                  </div>
                </form>
              </div>
            )}

            {/* Reset Password Form */}
            {employeePasswordReset && (
              <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Reset Employee Password</h3>
                  <button onClick={() => setEmployeePasswordReset(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Set a new password for account: <strong>{employeePasswordReset.username}</strong>
                </p>
                <form onSubmit={handleResetEmployeePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>New Password</label>
                    <input name="new_password" type="password" required placeholder="Minimum 6 characters" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" className="btn btn--outline" onClick={() => setEmployeePasswordReset(null)}>Cancel</button>
                    <button type="submit" className="btn btn--primary">Reset Password</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Security Settings</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Update your account dashboard access password below.</p>

            <form onSubmit={handlePasswordChange} style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {passwordMessage.text && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', background: passwordMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: passwordMessage.type === 'error' ? '#EF4444' : '#10B981' }}>
                  {passwordMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  <span>{passwordMessage.text}</span>
                </div>
              )}
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.current_password} 
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.new_password} 
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.confirm_password} 
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} 
                />
              </div>

              <button type="submit" className="btn btn--primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.9rem' }}>
                Update Password
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
