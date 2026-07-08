import React, { useState, useEffect } from 'react';
import { Home, Utensils, Phone, Lock, MapPin, Mail, Clock, Send, CheckCircle2, Flame, Search, Heart, Shield } from 'lucide-react';
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

function ImageCarousel({ images, mainImage, name }) {
  const [index, setIndex] = React.useState(0);
  const allImages = images && images.length > 0 
    ? images.map(img => img.image_url) 
    : [mainImage];

  const uniqueImages = Array.from(new Set(allImages.filter(Boolean)));

  if (uniqueImages.length <= 1) {
    return (
      <div className="detail__image-wrap">
        <img className="detail__image" src={uniqueImages[0] || 'assets/classic_burger.png'} alt={name} />
      </div>
    );
  }

  return (
    <div className="detail__image-carousel">
      <div className="carousel__track-container">
        <img 
          className="detail__image carousel__image" 
          src={uniqueImages[index]} 
          alt={`${name} - view ${index + 1}`} 
        />
        <button 
          type="button" 
          className="carousel__btn carousel__btn--prev" 
          onClick={(e) => { 
            e.stopPropagation(); 
            setIndex(prev => (prev === 0 ? uniqueImages.length - 1 : prev - 1)); 
          }}
        >
          &lsaquo;
        </button>
        <button 
          type="button" 
          className="carousel__btn carousel__btn--next" 
          onClick={(e) => { 
            e.stopPropagation(); 
            setIndex(prev => (prev === uniqueImages.length - 1 ? 0 : prev + 1)); 
          }}
        >
          &rsaquo;
        </button>
      </div>
      <div className="carousel__indicators">
        {uniqueImages.map((_, i) => (
          <button 
            key={i} 
            type="button" 
            className={`carousel__indicator ${i === index ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setIndex(i); }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('menu'); // home, menu, contact, detail, admin
  const [theme, setTheme] = useState(() => getStorage('wow-burger-theme', 'light'));
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [recipeFocus, setRecipeFocus] = useState(null);
  const [favorites, setFavorites] = useState(() => getStorage('wow-favorites', []));
  
  useEffect(() => { setStorage('wow-favorites', favorites); }, [favorites]);
  
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

  const showItemDetail = async (item) => {
    setDetailItem(item);
    showPage('detail');
    if (useBackend) {
      try {
        const fullItem = await menuItemsAPI.getById(item.id);
        if (fullItem) {
          setDetailItem(fullItem);
        }
      } catch (err) {
        console.error('Error fetching item details:', err);
      }
    }
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

  const countRecipeFocus = (focusType) => {
    const itemsToCount = menuItems.filter(item => category === 'all' || item.category_id === category);
    return itemsToCount.filter(item => {
      const text = [item.name, item.description, ...(item.ingredients || []), item.badge || ''].join(' ').toLowerCase();
      if (focusType === 'Vegetarian') return text.includes('vegetarian') || text.includes('veg');
      if (focusType === 'Vegan') return text.includes('vegan');
      if (focusType === 'Gluten-Free') return text.includes('gluten-free') || text.includes('gluten free');
      if (focusType === 'Spicy') return text.includes('spicy') || text.includes('hot');
      if (focusType === 'Signature') return text.includes('signature') || item.is_featured;
      return false;
    }).length;
  };

  const toggleFavorite = (itemId, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  const filteredItems = menuItems.filter(item => {
    const matchCat = category === 'all' || item.category_id === category;
    const matchQuery = !query || [item.name, item.description, ...(item.ingredients || [])].join(' ').toLowerCase().includes(query.toLowerCase());
    
    let matchFocus = true;
    if (recipeFocus) {
      const text = [item.name, item.description, ...(item.ingredients || []), item.badge || ''].join(' ').toLowerCase();
      if (recipeFocus === 'Vegetarian') matchFocus = text.includes('vegetarian') || text.includes('veg');
      else if (recipeFocus === 'Vegan') matchFocus = text.includes('vegan');
      else if (recipeFocus === 'Gluten-Free') matchFocus = text.includes('gluten-free') || text.includes('gluten free');
      else if (recipeFocus === 'Spicy') matchFocus = text.includes('spicy') || text.includes('hot');
      else if (recipeFocus === 'Signature') matchFocus = text.includes('signature') || item.is_featured;
    }
    
    return matchCat && matchQuery && matchFocus;
  });

  const popularItems = menuItems.slice(0, 4);

  return (
    <>
      <div className="top-bar">
        <div className="top-bar__container">
          <div className="top-bar__left">
            <span className="top-bar__item">
              <MapPin size={12} className="top-bar__icon text-orange" />
              Bole Road, Walkway Plaza, Addis Ababa, Ethiopia
            </span>
            <span className="top-bar__item">
              <Phone size={12} className="top-bar__icon text-yellow" />
              +251 11 661 2345 / +251 911 412 345
            </span>
            <span className="top-bar__item">
              <Clock size={12} className="top-bar__icon text-yellow" />
              10:00 AM - 11:00 PM (LT)
            </span>
          </div>
          <div className="top-bar__right">
            <span className="top-bar__status">
              <span className="top-bar__status-dot"></span>
              WE REOPEN AT 10:00 AM
            </span>
          </div>
        </div>
      </div>

      <header className={`header ${window.scrollY > 0 ? 'scrolled' : ''}`} id="header">
        <div className="header__container">
          <a href="#" className="header__logo" onClick={(e) => { e.preventDefault(); showPage('home'); }}>
            <div className="header__logo-badge">
              <Flame size={16} color="white" fill="white" />
            </div>
            <div className="header__logo-text-wrapper">
              <span className="header__logo-text">WOW<span className="header__logo-accent">BURGER</span></span>
              <span className="header__logo-sub">ETHIOPIA'S PREMIER CRAFT BURGERS</span>
            </div>
          </a>

          <div className="header__search-wrap">
            <Search size={16} className="header__search-icon" />
            <input 
              type="text" 
              placeholder="Search dishes or ingredients..." 
              value={query}
              onChange={(e) => { setQuery(e.target.value); showPage('menu'); }}
            />
          </div>

          <div className="header__actions">
            <button type="button" className={`header__fav-btn ${page === 'favorites' ? 'active' : ''}`} onClick={() => showPage('favorites')}>
              <Heart size={14} fill="currentColor" className="header__fav-icon" /> <span>Favs ({favorites.length})</span>
            </button>

            <button type="button" className="header__admin-btn" onClick={() => showPage('admin')} aria-label="Staff Portal">
              <Shield size={18} fill="currentColor" />
            </button>

            <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Switch theme">
              <span className="theme-toggle__icon theme-toggle__icon--sun">☀</span>
              <span className="theme-toggle__icon theme-toggle__icon--moon">☾</span>
            </button>
          </div>

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
                    <article key={item.id} className="food-card" onClick={() => showItemDetail(item)}>
                      <div className="food-card__image-wrap">
                        {item.badge && <span className="food-card__badge">{item.badge}</span>}
                        <button 
                          className={`food-card__fav-btn ${favorites.includes(item.id) ? 'active' : ''}`} 
                          onClick={(e) => toggleFavorite(item.id, e)}
                        >
                          <Heart size={16} fill={favorites.includes(item.id) ? "currentColor" : "none"} />
                        </button>
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
                <div className="recipe-focus">
                  <span className="recipe-focus__title">ADJUST RECIPE FOCUS</span>
                  <div className="recipe-focus__tags">
                    {[
                      { name: 'Vegetarian', icon: '🌱' },
                      { name: 'Vegan', icon: '🌿' },
                      { name: 'Gluten-Free', icon: '🛡️' },
                      { name: 'Spicy', icon: '🔥' },
                      { name: 'Signature', icon: '🏅' }
                    ].map(tag => {
                      const count = countRecipeFocus(tag.name);
                      const isActive = recipeFocus === tag.name;
                      return (
                        <button 
                          key={tag.name} 
                          className={`recipe-focus__tag-btn ${isActive ? 'active' : ''}`}
                          onClick={() => setRecipeFocus(isActive ? null : tag.name)}
                        >
                          <span className="recipe-focus__tag-icon">{tag.icon}</span>
                          <span className="recipe-focus__tag-name">{tag.name}</span>
                          <span className="recipe-focus__tag-count">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="menu-heading-bar">
                  <h2 className="menu-heading-bar__title">Menu</h2>
                  <p className="menu-heading-bar__subtitle">{filteredItems.length} options matching</p>
                </div>

                <div className="menu-grid">
                  {filteredItems.map(item => (
                    <article key={item.id} className="food-card" onClick={() => showItemDetail(item)}>
                      <div className="food-card__image-wrap">
                        {item.badge && <span className="food-card__badge">{item.badge}</span>}
                        <button 
                          className={`food-card__fav-btn ${favorites.includes(item.id) ? 'active' : ''}`} 
                          onClick={(e) => toggleFavorite(item.id, e)}
                        >
                          <Heart size={16} fill={favorites.includes(item.id) ? "currentColor" : "none"} />
                        </button>
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

                {filteredItems.length === 0 && (
                  <div className="menu-no-matches-container">
                    <div className="menu-no-matches-box">
                      <span className="menu-no-matches-cross">❌</span>
                      <h3>No Matches Found</h3>
                      <button className="btn btn--primary menu-no-matches-reset" onClick={() => { setCategory('all'); setQuery(''); setRecipeFocus(null); }}>
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
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
                <ImageCarousel images={detailItem.images} mainImage={detailItem.image_url} name={detailItem.name} />
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
            <div className="section__container" style={{ paddingTop: '2rem' }}>
              <h2 className="section__title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Your Favorites</h2>
              {favorites.length === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <p className="menu-empty">You haven't added any favorites yet.</p>
                  <button className="btn btn--primary" onClick={() => showPage('menu')}>Browse Menu</button>
                </div>
              ) : (
                <div className="menu-grid">
                  {menuItems.filter(item => favorites.includes(item.id)).map(item => (
                    <article key={item.id} className="food-card" onClick={() => showItemDetail(item)}>
                      <div className="food-card__image-wrap">
                        {item.badge && <span className="food-card__badge">{item.badge}</span>}
                        <button 
                          className={`food-card__fav-btn active`} 
                          onClick={(e) => toggleFavorite(item.id, e)}
                        >
                          <Heart size={16} fill="currentColor" />
                        </button>
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
              )}
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
