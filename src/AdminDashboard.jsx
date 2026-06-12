import React, { useState } from 'react';
import { LayoutDashboard, Utensils, Tags, LogOut, Plus, Edit3, Trash2, Search, X, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard({ menuItems, setMenuItems, categories, setCategories, onLogout }) {
  const [activeTab, setActiveTab] = useState('items');
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
      id: editingItem?.id || `item-${Date.now()}`,
      name: formData.get('name'),
      category_id: formData.get('category_id'),
      price: parseFloat(formData.get('price')),
      image_url: formData.get('image_url') || 'assets/classic_burger.png',
      badge: formData.get('badge') || '',
      rating: formData.get('rating') || '0.0',
      description: formData.get('description'),
      ingredients: formData.get('ingredients').split(',').map(s => s.trim()),
      highlights: formData.get('highlights').split(',').map(s => s.trim()),
      nutrition: {
        calories: formData.get('calories') || '0',
        protein: formData.get('protein') || '0g',
        carbs: formData.get('carbs') || '0g',
        fat: formData.get('fat') || '0g'
      }
    };

    if (editingItem && editingItem.id) {
      setMenuItems(menuItems.map(item => item.id === newItem.id ? newItem : item));
    } else {
      setMenuItems([...menuItems, newItem]);
    }
    setEditingItem(null);
  };

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--header-height))', background: 'var(--surface-soft)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '3rem', paddingLeft: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-strong)', letterSpacing: '0.5px' }}>Admin Workspace</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage your digital menu</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            onClick={() => { setActiveTab('dashboard'); setEditingItem(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: activeTab === 'dashboard' ? 'var(--orange-tint)' : 'transparent', color: activeTab === 'dashboard' ? 'var(--orange)' : 'var(--text-muted)', fontWeight: '600', transition: 'var(--transition)', textAlign: 'left' }}>
            <LayoutDashboard size={20} /> Dashboard Overview
          </button>
          <button 
            onClick={() => { setActiveTab('items'); setEditingItem(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: activeTab === 'items' ? 'var(--orange-tint)' : 'transparent', color: activeTab === 'items' ? 'var(--orange)' : 'var(--text-muted)', fontWeight: '600', transition: 'var(--transition)', textAlign: 'left' }}>
            <Utensils size={20} /> Menu Items
          </button>
          <button 
            onClick={() => { setActiveTab('categories'); setEditingItem(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', background: activeTab === 'categories' ? 'var(--orange-tint)' : 'transparent', color: activeTab === 'categories' ? 'var(--orange)' : 'var(--text-muted)', fontWeight: '600', transition: 'var(--transition)', textAlign: 'left' }}>
            <Tags size={20} /> Categories
          </button>
        </nav>

        <button 
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', color: '#EF4444', fontWeight: '600', transition: 'var(--transition)', textAlign: 'left', marginTop: 'auto' }}>
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem' }}>Welcome Back, Admin!</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--orange-tint)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Utensils size={28} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Items</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: '800' }}>{menuItems.length}</h3>
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
            
            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
               <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>System Status</h3>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)' }}>
                 <CheckCircle2 size={24} color="#10B981" />
                 <div>
                   <p style={{ fontWeight: '600' }}>All systems operational</p>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Local storage data layer is synced and active.</p>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Menu Items Tab */}
        {activeTab === 'items' && !editingItem && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Menu Items</h2>
              <button className="btn btn--primary" onClick={() => setEditingItem({})} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Add New Item
              </button>
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                  <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search menu items..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }}
                  />
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--surface-soft)', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Item</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Price</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items found.</td>
                      </tr>
                    ) : filteredItems.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-soft)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={item.image_url} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', background: 'var(--hero-bg)' }} />
                          <div>
                            <p style={{ fontWeight: '600' }}>{item.name}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.id}</p>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ padding: '0.25rem 0.75rem', background: 'var(--orange-tint)', color: 'var(--orange)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '600' }}>
                            {categories.find(c => c.id === item.category_id)?.name || 'Unknown'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{item.price} ETB</td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditingItem(item)} style={{ padding: '0.5rem', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', transition: '0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-muted)'; e.currentTarget.style.color = 'var(--orange)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                              <Edit3 size={18} />
                            </button>
                            <button onClick={() => handleDeleteItem(item.id)} style={{ padding: '0.5rem', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', transition: '0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#EF4444'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                <p style={{ color: 'var(--text-muted)' }}>{editingItem.id ? `Editing ${editingItem.id}` : 'Fill in the details below to add a new item.'}</p>
              </div>
              <button onClick={() => setEditingItem(null)} style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Item Name</label>
                  <input name="name" defaultValue={editingItem.name} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Category</label>
                  <select name="category_id" defaultValue={editingItem.category_id} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }}>
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Price (ETB)</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingItem.price} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Image URL</label>
                  <input name="image_url" defaultValue={editingItem.image_url} placeholder="assets/..." style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Badge</label>
                  <input name="badge" defaultValue={editingItem.badge} placeholder="e.g. Spicy" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Description</label>
                <textarea name="description" defaultValue={editingItem.description} required rows="3" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-soft)', resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Ingredients (comma separated)</label>
                  <input name="ingredients" defaultValue={editingItem.ingredients?.join(', ')} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Highlights (comma separated)</label>
                  <input name="highlights" defaultValue={editingItem.highlights?.join(', ')} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }} />
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Nutritional Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
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
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Menu Categories</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Categories define how items are grouped on the main menu. (Read-only MVP view)</p>
            
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
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-soft)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-strong)' }}>{menuItems.filter(m => m.category_id === cat.id).length} Items linked</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
