import React, { useState, useEffect } from 'react';
import { Home, Utensils, Phone, Lock, MapPin, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { initialMenuItems, initialCategories } from './initialData';
import AdminDashboard from './AdminDashboard';
import { checkServerHealth, menuItemsAPI, categoriesAPI, authAPI } from './api';

const getStorage = (key, defaultVal) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setStorage = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

export default function App() {
  const [page, setPage] = useState('menu'); // home, menu, contact, detail, admin
  const [theme, setTheme] = useState(() => getStorage('wow-burger-theme', 'light'));
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  
  const [menuItems, setMenuItems] = useState(() => getStorage('wow-menu', initialMenuItems));
  const [categories, setCategories] = useState(() => getStorage('wow-categories', initialCategories));
  const [isAdminAuth, setIsAdminAuth] = useState(() => getStorage('wow-admin-auth', false));
  const [detailItem, setDetailItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [useBackend, setUseBackend] = useState(false);

  // Sync with MySQL database on mount if server is running
  useEffect(() => {
    async function loadData() {
      try {
        const isHealthy = await checkServerHealth();
        if (isHealthy) {
          setUseBackend(true);
          const [dbItems, dbCategories] = await Promise.all([
            menuItemsAPI.getAll(),
            categoriesAPI.getAll()
          ]);
          if (dbItems && dbItems.length > 0) setMenuItems(dbItems);
          if (dbCategories && dbCategories.length > 0) setCategories(dbCategories);
        }
      } catch (err) {
        console.warn('Backend unavailable, falling back to local data:', err.message);
      }
    }
    loadData();
  }, []);

  useEffect(() => { if (!useBackend) setStorage('wow-menu', menuItems); }, [menuItems, useBackend]);
  useEffect(() => { if (!useBackend) setStorage('wow-categories', categories); }, [categories, useBackend]);
  useEffect(() => { setStorage('wow-admin-auth', isAdminAuth); }, [isAdminAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#121316' : '#FF6B00');
    setStorage('wow-burger-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const showPage = (p) => {
    setPage(p);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const username = fd.get('username');
    const password = fd.get('password');

    if (useBackend) {
      try {
        const result = await authAPI.login(username, password);
        if (result.success) {
          setIsAdminAuth(true);
        }
      } catch (err) {
        alert(err.message || 'Invalid admin credentials');
      }
    } else {
      if (username === 'admin' && password === 'admin') {
        setIsAdminAuth(true);
      } else {
        alert('Invalid credentials. Try admin / admin');
      }
    }
  };

  const handleLogout = () => {
    if (useBackend) {
      authAPI.logout();
    }
    setIsAdminAuth(false);
  };

  const mapCategoryName = (catId) => {
    return categories.find(c => c.id === catId)?.name || 'Menu';
  };

  const filteredItems = menuItems.filter(item => {
    const matchCat = category === 'all' || item.category_id === category;
    const matchQuery = !query || [item.name, item.description, ...item.ingredients].join(' ').toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  const popularItems = menuItems.slice(0, 4);

  return (
    <>
      <header className={`header ${window.scrollY > 0 ? 'scrolled' : ''}`} id="header">
        <div className="header__container">
          <a href="#" className="header__logo" onClick={(e) => { e.preventDefault(); showPage('home'); }}>
            <span className="header__logo-icon">🍔</span>
            <span className="header__logo-text">Wow<span className="header__logo-accent">Burger</span></span>
          </a>
          <nav className="header__nav">
            <button type="button" className={`header__nav-link ${page === 'home' ? 'active' : ''}`} onClick={() => showPage('home')}>Home</button>
            <button type="button" className={`header__nav-link ${page === 'menu' ? 'active' : ''}`} onClick={() => showPage('menu')}>Menu</button>
            <button type="button" className={`header__nav-link ${page === 'contact' ? 'active' : ''}`} onClick={() => showPage('contact')}>Contact</button>
            <button type="button" className={`header__nav-link ${page === 'admin' ? 'active' : ''}`} onClick={() => showPage('admin')}>Admin</button>
          </nav>
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Switch theme">
            <span className="theme-toggle__icon theme-toggle__icon--sun">☀</span>
            <span className="theme-toggle__icon theme-toggle__icon--moon">☾</span>
          </button>
          <button className={`header__menu-btn ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className="header__menu-icon"></span>
          </button>
        </div>
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu__content">
            <button type="button" className={`mobile-menu__link ${page === 'home' ? 'active' : ''}`} onClick={() => showPage('home')}>
              <div className="mobile-menu__icon-wrap"><Home size={18} /></div>
              <span>Home</span>
            </button>
            <button type="button" className={`mobile-menu__link ${page === 'menu' ? 'active' : ''}`} onClick={() => showPage('menu')}>
              <div className="mobile-menu__icon-wrap"><Utensils size={18} /></div>
              <span>Menu</span>
            </button>
            <button type="button" className={`mobile-menu__link ${page === 'contact' ? 'active' : ''}`} onClick={() => showPage('contact')}>
              <div className="mobile-menu__icon-wrap"><Phone size={18} /></div>
              <span>Contact</span>
            </button>
            <div className="mobile-menu__divider"></div>
            <button type="button" className={`mobile-menu__link ${page === 'admin' ? 'active' : ''}`} onClick={() => showPage('admin')}>
              <div className="mobile-menu__icon-wrap"><Lock size={18} /></div>
              <span>Admin</span>
            </button>
            <button type="button" className="theme-toggle theme-toggle--mobile" onClick={toggleTheme}>
              <span className="theme-toggle__icon theme-toggle__icon--sun">☀</span>
              <span className="theme-toggle__text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              <span className="theme-toggle__icon theme-toggle__icon--moon">☾</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" style={{ marginTop: 'var(--header-height)' }}>
        {page === 'home' && (
          <div className="page page--home active">
            <section className="hero">
              <div className="hero__bg-shapes">
                <div className="hero__circle hero__circle--1"></div>
                <div className="hero__circle hero__circle--2"></div>
                <div className="hero__circle hero__circle--3"></div>
              </div>
              <div className="hero__container">
                <div className="hero__content">
                  <span className="hero__badge">
                    <span className="hero__badge-dot"></span>
                    Now Open in Addis Ababa {useBackend && <span style={{ marginLeft: '6px', opacity: 0.8 }}>(Live DB)</span>}
                  </span>
                  <h1 className="hero__title">
                    Fresh Burgers<br />Made for Every<br />
                    <span className="hero__title-accent">Craving</span>
                  </h1>
                  <p className="hero__subtitle">Explore our delicious burgers, fries, drinks, and special meals — crafted with love and the freshest ingredients.</p>
                  <div className="hero__actions">
                    <button className="btn btn--primary btn--lg" onClick={() => showPage('menu')}>
                      <span>View Menu</span>
                      <svg className="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                    <a href="#popular-section" className="btn btn--outline btn--lg"><span>Popular Items</span></a>
                  </div>
                  <div className="hero__stats">
                    <div className="hero__stat"><span className="hero__stat-number">50+</span><span className="hero__stat-label">Menu Items</span></div>
                    <div className="hero__stat-divider"></div>
                    <div className="hero__stat"><span className="hero__stat-number">4.9</span><span className="hero__stat-label">⭐ Rating</span></div>
                    <div className="hero__stat-divider"></div>
                    <div className="hero__stat"><span className="hero__stat-number">10K+</span><span className="hero__stat-label">Happy Customers</span></div>
                  </div>
                </div>
                <div className="hero__image-wrap">
                  <div className="hero__image-glow"></div>
                  <img src="assets/hero_burger.png" alt="Delicious burger" className="hero__image" />
                  <div className="hero__image-badge hero__image-badge--top"><span className="hero__image-badge-icon">🔥</span><span>Bestseller</span></div>
                  <div className="hero__image-badge hero__image-badge--bottom"><span className="hero__image-badge-price">250 ETB</span><span>Starting from</span></div>
                </div>
              </div>
            </section>

            <section className="categories">
              <div className="section__container">
                <div className="section__header">
                  <span className="section__label">Explore</span>
                  <h2 className="section__title">Our Menu Categories</h2>
                  <p className="section__subtitle">From juicy burgers to refreshing drinks — discover what makes Wow Burger special.</p>
                </div>
                <div className="categories__grid">
                  {categories.map(cat => (
                    <button key={cat.id} className="category-card" onClick={() => { setCategory(cat.id); setQuery(''); showPage('menu'); }}>
                      <h3 className="category-card__title">{cat.name}</h3>
                      <p className="category-card__count">{menuItems.filter(m => m.category_id === cat.id).length} items</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="popular" id="popular-section">
              <div className="section__container">
                <div className="section__header">
                  <span className="section__label">🔥 Trending Now</span>
                  <h2 className="section__title">Most Popular Items</h2>
                </div>
                <div className="popular__grid">
                  {popularItems.map(item => (
                    <article key={item.id} className="food-card" onClick={() => { setDetailItem(item); showPage('detail'); }}>
                      <div className="food-card__image-wrap">
                        {item.badge && <span className="food-card__badge">{item.badge}</span>}
                        <img className="food-card__image" src={item.image_url} alt={item.name} />
                      </div>
                      <div className="food-card__body">
                        <p className="food-card__category">{mapCategoryName(item.category_id)}</p>
                        <h3 className="food-card__name">{item.name}</h3>
                        <p className="food-card__desc">{item.description}</p>
                        <div className="food-card__footer">
                          <p className="food-card__price">{item.price} ETB</p>
                          <button className="food-card__btn">View details</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {page === 'menu' && (
          <div className="page page--menu active">
            <div className="menu-page">
              <div className="menu-page__header">
                <div className="section__container">
                  <span className="section__label">Our Menu</span>
                  <h2 className="section__title">Explore & Enjoy</h2>
                </div>
              </div>
              <div className="menu-tabs">
                <div className="menu-tabs__container">
                  <button className={`menu-tabs__btn ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>All</button>
                  {categories.map(cat => (
                    <button key={cat.id} className={`menu-tabs__btn ${category === cat.id ? 'active' : ''}`} onClick={() => setCategory(cat.id)}>{cat.name}</button>
                  ))}
                </div>
              </div>
              <div className="section__container">
                <div className="menu-toolbar">
                  <div className="menu-toolbar__search">
                    <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." />
                    {query && <button className="menu-toolbar__clear" onClick={() => setQuery('')}>×</button>}
                  </div>
                  <div className="menu-toolbar__meta">
                    <p className="menu-results">Showing {filteredItems.length} items</p>
                    <button className="menu-reset" onClick={() => { setCategory('all'); setQuery(''); }}>Reset</button>
                  </div>
                </div>
                <div className="menu-grid">
                  {filteredItems.map(item => (
                    <article key={item.id} className="food-card" onClick={() => { setDetailItem(item); showPage('detail'); }}>
                      <div className="food-card__image-wrap">
                        {item.badge && <span className="food-card__badge">{item.badge}</span>}
                        <img className="food-card__image" src={item.image_url} alt={item.name} />
                      </div>
                      <div className="food-card__body">
                        <p className="food-card__category">{mapCategoryName(item.category_id)}</p>
                        <h3 className="food-card__name">{item.name}</h3>
                        <p className="food-card__desc">{item.description}</p>
                        <div className="food-card__footer">
                          <p className="food-card__price">{item.price} ETB</p>
                          <button className="food-card__btn">View details</button>
                        </div>
                      </div>
                    </article>
                  ))}
                  {filteredItems.length === 0 && (
                    <div className="menu-empty">No items match this filter yet. Try another search.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {page === 'contact' && (
          <div className="page page--contact active">
             <div className="contact-page">
                <div className="section__container">
                    <div className="section__header">
                        <span className="section__label">Get In Touch</span>
                        <h2 className="section__title">We'd Love to Hear From You</h2>
                        <p className="section__subtitle">Whether you have a question about our menu, reservations, or anything else, our team is ready to answer all your questions.</p>
                    </div>
                    
                    <div className="contact__wrapper">
                        <div className="contact__info">
                            <h3 className="contact__info-title">Contact Information</h3>
                            <p className="contact__info-desc">Fill up the form and our team will get back to you within 24 hours.</p>
                            
                            <ul className="contact__info-list">
                                <li className="contact__info-item">
                                    <div className="contact__info-icon"><Phone size={18} /></div>
                                    <span>+251 911 234 567</span>
                                </li>
                                <li className="contact__info-item">
                                    <div className="contact__info-icon"><Mail size={18} /></div>
                                    <span>hello@wowburger.et</span>
                                </li>
                                <li className="contact__info-item">
                                    <div className="contact__info-icon"><MapPin size={18} /></div>
                                    <span>Bole Road, Addis Ababa</span>
                                </li>
                                <li className="contact__info-item">
                                    <div className="contact__info-icon"><Clock size={18} /></div>
                                    <span>Mon - Sun: 10:00 AM - 10:00 PM</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="contact__form-container">
                            {contactSuccess ? (
                                <div className="contact__success">
                                    <div className="contact__success-icon"><CheckCircle2 size={48} /></div>
                                    <h3>Message Sent!</h3>
                                    <p>Thank you for reaching out. We will get back to you shortly.</p>
                                    <button className="btn btn--outline" onClick={() => setContactSuccess(false)}>Send another message</button>
                                </div>
                            ) : (
                                <form className="contact__form" onSubmit={e => { e.preventDefault(); setContactSuccess(true); e.target.reset(); }}>
                                    <div className="form__group">
                                        <label className="form__label">Full Name</label>
                                        <input type="text" className="form__input" placeholder="e.g. John Doe" required />
                                    </div>
                                    <div className="form__group">
                                        <label className="form__label">Email Address</label>
                                        <input type="email" className="form__input" placeholder="e.g. john@example.com" required />
                                    </div>
                                    <div className="form__group">
                                        <label className="form__label">Message</label>
                                        <textarea className="form__input form__textarea" rows="5" placeholder="Write your message here..." required></textarea>
                                    </div>
                                    <button type="submit" className="btn btn--primary btn--lg contact__submit-btn">
                                        <Send size={18} /> Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}

        {page === 'detail' && detailItem && (
          <div className="page page--detail active">
            <div className="detail" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.25rem' }}>
              <button className="detail__back" onClick={() => showPage('menu')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20"><path d="M15 18l-6-6 6-6" /></svg>
                Back to menu
              </button>
              <section className="detail__hero">
                <div className="detail__image-wrap">
                  <img className="detail__image" src={detailItem.image_url} alt={detailItem.name} />
                </div>
                <div className="detail__info">
                  <p className="detail__category">{mapCategoryName(detailItem.category_id)}</p>
                  <h2 className="detail__name">{detailItem.name}</h2>
                  <div className="detail__price">{detailItem.price} ETB</div>
                  <p className="detail__desc">{detailItem.description}</p>
                  
                  {detailItem.ingredients && detailItem.ingredients.length > 0 && (
                    <div className="detail__section">
                      <h3 className="detail__section-title">Ingredients</h3>
                      <div className="detail__ingredients">
                        {detailItem.ingredients.map((ing, i) => (
                          <span key={i} className="detail__ingredient">{ing}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailItem.nutrition && Object.keys(detailItem.nutrition).length > 0 && (
                    <div className="detail__section">
                      <h3 className="detail__section-title">Nutritional Information</h3>
                      <div className="detail__nutrition">
                        {detailItem.nutrition.calories && (
                            <div className="detail__nutrition-item">
                                <span className="detail__nutrition-value">{detailItem.nutrition.calories}</span>
                                <span className="detail__nutrition-label">Calories</span>
                            </div>
                        )}
                        {detailItem.nutrition.protein && (
                            <div className="detail__nutrition-item">
                                <span className="detail__nutrition-value">{detailItem.nutrition.protein}</span>
                                <span className="detail__nutrition-label">Protein</span>
                            </div>
                        )}
                        {detailItem.nutrition.carbs && (
                            <div className="detail__nutrition-item">
                                <span className="detail__nutrition-value">{detailItem.nutrition.carbs}</span>
                                <span className="detail__nutrition-label">Carbs</span>
                            </div>
                        )}
                        {detailItem.nutrition.fat && (
                            <div className="detail__nutrition-item">
                                <span className="detail__nutrition-value">{detailItem.nutrition.fat}</span>
                                <span className="detail__nutrition-label">Fat</span>
                            </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {page === 'admin' && !isAdminAuth && (
          <div className="page active" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - var(--header-height))', background: 'var(--hero-bg)' }}>
            <div style={{ maxWidth: '420px', width: '100%', padding: '3rem 2.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--orange-tint)', color: 'var(--orange)', fontSize: '2rem', marginBottom: '1rem' }}>
                  🔒
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-strong)', marginBottom: '0.5rem' }}>Admin Portal</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Secure access to menu management {useBackend && '(Live DB)'}</p>
              </div>
              <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
                  <input type="text" name="username" required defaultValue="admin" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-soft)', background: 'var(--surface-soft)', color: 'var(--text)', fontSize: '1rem', transition: 'var(--transition)' }} onFocus={e => e.target.style.borderColor = 'var(--orange)'} onBlur={e => e.target.style.borderColor = 'var(--border-soft)'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                  <input type="password" name="password" required defaultValue={useBackend ? "admin123" : "admin"} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-soft)', background: 'var(--surface-soft)', color: 'var(--text)', fontSize: '1rem', transition: 'var(--transition)' }} onFocus={e => e.target.style.borderColor = 'var(--orange)'} onBlur={e => e.target.style.borderColor = 'var(--border-soft)'} />
                </div>
                <button type="submit" className="btn btn--primary btn--lg" style={{ width: '100%', marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '1.05rem' }}>
                  Sign In
                </button>
              </form>
            </div>
          </div>
        )}

        {page === 'admin' && isAdminAuth && (
          <div className="page active" style={{ padding: '0' }}>
            <AdminDashboard 
              menuItems={menuItems} setMenuItems={setMenuItems} 
              categories={categories} setCategories={setCategories} 
              onLogout={handleLogout} 
              useBackend={useBackend}
            />
          </div>
        )}

        {page === 'favorites' && (
          <div className="page page--favorites active">
            <div className="section__container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
              <h2 className="section__title">Your Favorites</h2>
              <p className="menu-empty">You haven't added any favorites yet.</p>
              <button className="btn btn--primary" onClick={() => showPage('menu')}>Browse Menu</button>
            </div>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={`bottom-nav__item ${page === 'home' ? 'active' : ''}`} onClick={() => showPage('home')}>
          <span className="bottom-nav__icon">🏠</span>
          <span className="bottom-nav__label">Home</span>
        </button>
        <button className={`bottom-nav__item ${page === 'menu' && category === 'all' ? 'active' : ''}`} onClick={() => { showPage('menu'); setCategory('all'); }}>
          <span className="bottom-nav__icon">🍔</span>
          <span className="bottom-nav__label">Food</span>
        </button>
        <button className={`bottom-nav__item ${page === 'menu' && category === 'cat-drinks' ? 'active' : ''}`} onClick={() => { showPage('menu'); setCategory('cat-drinks'); }}>
          <span className="bottom-nav__icon">🥤</span>
          <span className="bottom-nav__label">Drinks</span>
        </button>
        <button className={`bottom-nav__item ${page === 'favorites' ? 'active' : ''}`} onClick={() => showPage('favorites')}>
          <span className="bottom-nav__icon">❤️</span>
          <span className="bottom-nav__label">Favorites</span>
        </button>
      </nav>

      <footer className="footer" id="footer">
        <div className="footer__container">
          <div className="footer__bottom" style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
            <p>&copy; 2026 Wow Burger. All Rights Reserved.</p>
            <p className="footer__made">Made with ❤️ in Ethiopia</p>
          </div>
        </div>
      </footer>
    </>
  );
}
