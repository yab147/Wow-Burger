const MENU_ITEMS = [
  {
    id: 'classic-cheeseburger',
    name: 'Wow Classic Cheeseburger',
    category: 'burgers',
    price: '240 ETB',
    image: 'assets/classic_burger.png',
    badge: 'Bestseller',
    rating: '4.9',
    desc: 'A flame-grilled beef patty with melted cheddar, fresh lettuce, tomato, pickles, and our signature Wow sauce on a toasted bun.',
    ingredients: ['Beef patty', 'Cheddar', 'Lettuce', 'Tomato', 'Pickle slices', 'Wow sauce'],
    highlights: ['Flame-grilled patty', 'Fresh toppings', 'House-made sauce'],
    nutrition: { calories: '680', protein: '38g', carbs: '42g', fat: '35g' }
  },
  {
    id: 'smoky-bacon-burger',
    name: 'Smoky BBQ Bacon Burger',
    category: 'burgers',
    price: '290 ETB',
    image: 'assets/classic_burger.png',
    badge: 'Popular',
    rating: '4.8',
    desc: 'Double beef layers, smoked bacon, caramelized onions, cheddar, and rich BBQ glaze for a bold bite.',
    ingredients: ['Double beef patty', 'Smoked bacon', 'Cheddar', 'Caramelized onions', 'BBQ glaze'],
    highlights: ['Bold BBQ flavor', 'Crispy bacon', 'Cheesy finish'],
    nutrition: { calories: '760', protein: '46g', carbs: '45g', fat: '44g' }
  },
  {
    id: 'spicy-chicken-burger',
    name: 'Spicy Chicken Burger',
    category: 'burgers',
    price: '260 ETB',
    image: 'assets/chicken_burger.png',
    badge: 'Spicy',
    rating: '4.7',
    desc: 'Crispy fried chicken breast layered with lettuce, pickles, and a spicy mayo kick on a toasted sesame bun.',
    ingredients: ['Crispy chicken', 'Spicy mayo', 'Lettuce', 'Pickles', 'Sesame bun'],
    highlights: ['Crunchy chicken', 'Spicy mayo', 'Golden bun'],
    nutrition: { calories: '590', protein: '32g', carbs: '48g', fat: '28g' }
  },
  {
    id: 'garden-veggie-burger',
    name: 'Garden Veggie Burger',
    category: 'burgers',
    price: '210 ETB',
    image: 'assets/classic_burger.png',
    badge: 'Veggie',
    rating: '4.6',
    desc: 'A grilled mushroom stack with fresh greens, roasted peppers, and herb mayo for a satisfying vegetarian option.',
    ingredients: ['Portobello mushroom', 'Roasted peppers', 'Arugula', 'Herb mayo', 'Gluten-free bun'],
    highlights: ['Vegetarian delight', 'Fresh greens', 'Balanced flavor'],
    nutrition: { calories: '430', protein: '18g', carbs: '36g', fat: '22g' }
  },
  {
    id: 'loaded-fries',
    name: 'Wow Loaded Fries',
    category: 'fries',
    price: '160 ETB',
    image: 'assets/loaded_fries.png',
    badge: 'Bestseller',
    rating: '4.9',
    desc: 'Golden fries topped with cheddar sauce, crispy bits, chives, and a sweet-spicy drizzle.',
    ingredients: ['French fries', 'Cheddar sauce', 'Crispy bits', 'Chives', 'Chipotle drizzle'],
    highlights: ['Loaded and rich', 'Crispy texture', 'Shareable size'],
    nutrition: { calories: '520', protein: '12g', carbs: '58g', fat: '28g' }
  },
  {
    id: 'cajun-fries',
    name: 'Cajun Crunch Fries',
    category: 'fries',
    price: '100 ETB',
    image: 'assets/loaded_fries.png',
    badge: 'Spicy',
    rating: '4.5',
    desc: 'Crisp seasoned fries with a smoky spice blend and a side of tangy ketchup.',
    ingredients: ['French fries', 'Cajun seasoning', 'Ketchup'],
    highlights: ['Spicy kick', 'Crispy crunch', 'Quick snack'],
    nutrition: { calories: '290', protein: '3g', carbs: '42g', fat: '11g' }
  },
  {
    id: 'citrus-cooler',
    name: 'Citrus Cooler',
    category: 'drinks',
    price: '90 ETB',
    image: 'assets/chocolate_shake.png',
    badge: 'Refreshing',
    rating: '4.7',
    desc: 'A citrus blend of fresh lemon, orange, and mint served over ice for a bright, energizing sip.',
    ingredients: ['Lemon', 'Orange', 'Mint', 'Sparkling water', 'Ice'],
    highlights: ['Fresh citrus', 'Light and crisp', 'Perfect with burgers'],
    nutrition: { calories: '120', protein: '0g', carbs: '30g', fat: '0g' }
  },
  {
    id: 'berry-fizz',
    name: 'Berry Fizz',
    category: 'drinks',
    price: '85 ETB',
    image: 'assets/chocolate_shake.png',
    badge: 'Fresh',
    rating: '4.6',
    desc: 'A chilled berry soda with a splash of citrus and a soft, fruity finish.',
    ingredients: ['Berry syrup', 'Citrus', 'Sparkling water', 'Ice'],
    highlights: ['Sweet and fruity', 'Cold and bubbly', 'Kid-friendly'],
    nutrition: { calories: '110', protein: '0g', carbs: '28g', fat: '0g' }
  },
  {
    id: 'spicy-chicken-wrap',
    name: 'Spicy Chicken Wrap',
    category: 'chicken',
    price: '180 ETB',
    image: 'assets/chicken_burger.png',
    badge: 'New',
    rating: '4.8',
    desc: 'Tender chicken strips wrapped in soft flatbread with lettuce, tomato, and a zesty sauce.',
    ingredients: ['Chicken strips', 'Flatbread', 'Lettuce', 'Tomato', 'Creamy sauce'],
    highlights: ['Handheld and filling', 'Balanced spice', 'Perfect lunch'],
    nutrition: { calories: '500', protein: '30g', carbs: '46g', fat: '22g' }
  },
  {
    id: 'tender-chicken-box',
    name: 'Tender Chicken Box',
    category: 'chicken',
    price: '220 ETB',
    image: 'assets/chicken_burger.png',
    badge: 'Family Pack',
    rating: '4.7',
    desc: 'A satisfying chicken combo with crispy tenders, fries, and a side of signature dip.',
    ingredients: ['Chicken tenders', 'Fries', 'Signature dip', 'Lemon wedge'],
    highlights: ['Shareable combo', 'Crispy coating', 'Comfort food'],
    nutrition: { calories: '610', protein: '35g', carbs: '52g', fat: '29g' }
  },
  {
    id: 'chocolate-sundae',
    name: 'Chocolate Sundae',
    category: 'desserts',
    price: '140 ETB',
    image: 'assets/chocolate_shake.png',
    badge: 'Sweet',
    rating: '4.9',
    desc: 'Vanilla ice cream topped with chocolate sauce, whipped cream, and crunchy nuggets.',
    ingredients: ['Vanilla ice cream', 'Chocolate sauce', 'Whipped cream', 'Crunchy nuggets'],
    highlights: ['Rich chocolate', 'Cold and creamy', 'Dessert favorite'],
    nutrition: { calories: '420', protein: '6g', carbs: '58g', fat: '19g' }
  },
  {
    id: 'strawberry-cheesecake',
    name: 'Strawberry Cheesecake',
    category: 'desserts',
    price: '155 ETB',
    image: 'assets/chocolate_shake.png',
    badge: 'Fresh',
    rating: '4.8',
    desc: 'Creamy cheesecake with a fresh strawberry topping and crumbly biscuit base.',
    ingredients: ['Cheesecake base', 'Strawberry topping', 'Cream', 'Crumb topping'],
    highlights: ['Creamy texture', 'Fresh fruit', 'Smooth finish'],
    nutrition: { calories: '390', protein: '7g', carbs: '46g', fat: '20g' }
  }
];

const state = {
  page: 'home',
  category: 'all',
  query: '',
  theme: 'light'
};

const elements = {
  menuGrid: document.getElementById('menu-grid'),
  popularGrid: document.getElementById('popular-grid'),
  detailContent: document.getElementById('detail-content'),
  menuSearch: document.getElementById('menu-search'),
  clearSearch: document.getElementById('clear-search'),
  resultsCount: document.getElementById('results-count'),
  emptyState: document.getElementById('menu-empty'),
  resetFilters: document.getElementById('reset-filters'),
  contactForm: document.getElementById('contact-form'),
  contactStatus: document.getElementById('contact-status'),
  menuTabs: document.querySelectorAll('.menu-tabs__btn'),
  menuToggle: document.getElementById('menu-toggle'),
  mobileMenu: document.getElementById('mobile-menu'),
  backToTop: document.getElementById('back-to-top'),
  tabsWrapper: document.getElementById('menu-tabs'),
  themeToggles: document.querySelectorAll('[data-theme-toggle]'),
  themeColorMeta: document.querySelector('meta[name="theme-color"]')
};

function init() {
  initTheme();
  renderPopular();
  renderMenu();
  bindNavigation();
  bindCategoryCards();
  bindMenuTabs();
  bindSearch();
  bindContactForm();
  bindBackToTop();
  bindMobileMenu();
  bindThemeToggle();
  window.addEventListener('scroll', handleScroll);
  handleScroll();
}

function initTheme() {
  const savedTheme = getSavedTheme();
  const systemThemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
  const systemTheme = systemThemeQuery?.matches ? 'dark' : 'light';
  applyTheme(savedTheme || systemTheme);

  systemThemeQuery?.addEventListener?.('change', (event) => {
    if (!getSavedTheme()) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });
}

function getSavedTheme() {
  try {
    const saved = localStorage.getItem('wow-burger-theme');
    return saved === 'dark' || saved === 'light' ? saved : null;
  } catch (error) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem('wow-burger-theme', theme);
  } catch (error) {
    // Storage can be unavailable in private or embedded browser contexts.
  }
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);

  if (elements.themeColorMeta) {
    elements.themeColorMeta.setAttribute('content', theme === 'dark' ? '#121316' : '#FF6B00');
  }

  elements.themeToggles.forEach((toggle) => {
    const isDark = theme === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    const text = toggle.querySelector('.theme-toggle__text');
    if (text) text.textContent = isDark ? 'Dark' : 'Light';
  });
}

function bindThemeToggle() {
  elements.themeToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      saveTheme(nextTheme);
    });
  });
}

function bindNavigation() {
  document.addEventListener('click', (event) => {
    const pageTrigger = event.target.closest('[data-page]');
    if (pageTrigger) {
      event.preventDefault();
      const page = pageTrigger.getAttribute('data-page');
      if (page) {
        showPage(page);
      }
    }
  });
}

function bindCategoryCards() {
  document.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.category = card.getAttribute('data-category') || 'all';
      state.query = '';
      if (elements.menuSearch) elements.menuSearch.value = '';
      updateTabState();
      renderMenu();
      showPage('menu');
    });
  });
}

function bindMenuTabs() {
  elements.menuTabs.forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.getAttribute('data-filter') || 'all';
      updateTabState();
      renderMenu();
    });
  });
}

function bindSearch() {
  if (elements.menuSearch) {
    elements.menuSearch.addEventListener('input', (event) => {
      state.query = event.target.value.trim();
      if (elements.clearSearch) {
        elements.clearSearch.hidden = state.query.length === 0;
      }
      renderMenu();
    });
  }

  if (elements.clearSearch) {
    elements.clearSearch.addEventListener('click', () => {
      if (elements.menuSearch) elements.menuSearch.value = '';
      state.query = '';
      elements.clearSearch.hidden = true;
      renderMenu();
      elements.menuSearch?.focus();
    });
  }

  if (elements.resetFilters) {
    elements.resetFilters.addEventListener('click', () => {
      state.category = 'all';
      state.query = '';
      if (elements.menuSearch) elements.menuSearch.value = '';
      if (elements.clearSearch) elements.clearSearch.hidden = true;
      updateTabState();
      renderMenu();
    });
  }
}

function bindContactForm() {
  if (!elements.contactForm) return;

  elements.contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('contact-name')?.value.trim() || 'friend';
    if (elements.contactStatus) {
      elements.contactStatus.textContent = `Thanks, ${name}! We received your message and will reply soon.`;
      elements.contactStatus.classList.add('show');
    }
    elements.contactForm.reset();
  });
}

function bindBackToTop() {
  if (!elements.backToTop) return;

  elements.backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function bindMobileMenu() {
  if (!elements.menuToggle || !elements.mobileMenu) return;

  elements.menuToggle.addEventListener('click', () => {
    const isOpen = elements.mobileMenu.classList.contains('open');
    elements.mobileMenu.classList.toggle('open', !isOpen);
    elements.menuToggle.classList.toggle('active', !isOpen);
    elements.menuToggle.setAttribute('aria-expanded', String(!isOpen));
    elements.mobileMenu.setAttribute('aria-hidden', String(isOpen));
  });

  elements.mobileMenu.querySelectorAll('.mobile-menu__link').forEach((link) => {
    link.addEventListener('click', () => {
      elements.mobileMenu.classList.remove('open');
      elements.menuToggle.classList.remove('active');
      elements.menuToggle.setAttribute('aria-expanded', 'false');
      elements.mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

function handleScroll() {
  const shouldStick = window.scrollY > 120;
  elements.tabsWrapper?.classList.toggle('stuck', shouldStick);
  if (elements.backToTop) {
    elements.backToTop.classList.toggle('visible', window.scrollY > 500);
  }
}

function showPage(page) {
  state.page = page;
  document.querySelectorAll('.page').forEach((section) => {
    section.classList.toggle('active', section.id === `page-${page}`);
  });

  document.querySelectorAll('[data-page]').forEach((trigger) => {
    const isActive = trigger.getAttribute('data-page') === page;
    trigger.classList.toggle('active', isActive);
  });

  if (page === 'menu') {
    renderMenu();
  }

  if (page === 'detail') {
    document.querySelectorAll('.page').forEach((section) => {
      section.classList.remove('active');
    });
    document.getElementById('page-detail')?.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateTabState() {
  elements.menuTabs.forEach((button) => {
    const isActive = button.getAttribute('data-filter') === state.category;
    button.classList.toggle('active', isActive);
  });
}

function getFilteredItems() {
  const query = state.query.toLowerCase();

  return MENU_ITEMS.filter((item) => {
    const matchesCategory = state.category === 'all' || item.category === state.category;
    const matchesQuery = !query || [item.name, item.desc, ...item.ingredients].join(' ').toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
}

function renderPopular() {
  if (!elements.popularGrid) return;

  const items = MENU_ITEMS.slice(0, 4);
  elements.popularGrid.innerHTML = items.map(buildCardMarkup).join('');
  attachCardListeners();
}

function renderMenu() {
  if (!elements.menuGrid) return;

  const filteredItems = getFilteredItems();
  elements.menuGrid.innerHTML = filteredItems.map(buildCardMarkup).join('');

  if (elements.resultsCount) {
    elements.resultsCount.textContent = `${filteredItems.length} ${filteredItems.length === 1 ? 'item' : 'items'} available`;
  }

  if (elements.emptyState) {
    elements.emptyState.hidden = filteredItems.length !== 0;
  }

  attachCardListeners();
  updateTabState();
}

function buildCardMarkup(item) {
  return `
    <article class="food-card" data-item-id="${item.id}">
      <div class="food-card__image-wrap">
        <span class="food-card__badge">${item.badge}</span>
        <img class="food-card__image" src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="food-card__body">
        <p class="food-card__category">${mapCategory(item.category)}</p>
        <h3 class="food-card__name">${item.name}</h3>
        <p class="food-card__desc">${item.desc}</p>
        <div class="food-card__footer">
          <p class="food-card__price">${item.price}<span> / serving</span></p>
          <button class="food-card__btn" type="button">View details</button>
        </div>
      </div>
    </article>
  `;
}

function attachCardListeners() {
  document.querySelectorAll('.food-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.food-card__btn')) {
        event.stopPropagation();
      }
      openDetail(card.getAttribute('data-item-id'));
    });
  });
}

function openDetail(itemId) {
  const item = MENU_ITEMS.find((entry) => entry.id === itemId);
  if (!item) return;

  const related = MENU_ITEMS.filter((entry) => entry.category === item.category && entry.id !== item.id).slice(0, 2);

  if (elements.detailContent) {
    elements.detailContent.innerHTML = `
      <button class="detail__back" type="button" id="detail-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to menu
      </button>
      <section class="detail__hero">
        <div class="detail__image-wrap">
          <img class="detail__image" src="${item.image}" alt="${item.name}">
          <span class="detail__chef-badge">${item.badge}</span>
        </div>
        <div class="detail__info">
          <p class="detail__category">${mapCategory(item.category)}</p>
          <h2 class="detail__name">${item.name}</h2>
          <div class="detail__rating">
            <span class="detail__stars">★★★★★</span>
            <span class="detail__rating-text">${item.rating} • 120 reviews</span>
          </div>
          <div class="detail__price">${item.price}<span>VAT included</span></div>
          <p class="detail__desc">${item.desc}</p>
          <div class="detail__highlights">
            ${item.highlights.map((highlight) => `<span class="detail__highlight"><span class="detail__highlight-icon">✓</span>${highlight}</span>`).join('')}
          </div>
        </div>
      </section>
      <section class="detail__section">
        <h3 class="detail__section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Ingredients
        </h3>
        <div class="detail__ingredients">
          ${item.ingredients.map((ingredient) => `<span class="detail__ingredient">${ingredient}</span>`).join('')}
        </div>
      </section>
      <section class="detail__section">
        <h3 class="detail__section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3v18M3 12h18" />
          </svg>
          Nutrition
        </h3>
        <div class="detail__nutrition">
          <div class="detail__nutrition-item"><span class="detail__nutrition-value">${item.nutrition.calories}</span><span class="detail__nutrition-label">Calories</span></div>
          <div class="detail__nutrition-item"><span class="detail__nutrition-value">${item.nutrition.protein}</span><span class="detail__nutrition-label">Protein</span></div>
          <div class="detail__nutrition-item"><span class="detail__nutrition-value">${item.nutrition.carbs}</span><span class="detail__nutrition-label">Carbs</span></div>
          <div class="detail__nutrition-item"><span class="detail__nutrition-value">${item.nutrition.fat}</span><span class="detail__nutrition-label">Fat</span></div>
        </div>
      </section>
      <section class="detail__related">
        <h3 class="detail__related-title">You may also like</h3>
        <div class="detail__related-grid">
          ${related.map((entry) => `
            <article class="food-card" data-item-id="${entry.id}">
              <div class="food-card__image-wrap">
                <span class="food-card__badge">${entry.badge}</span>
                <img class="food-card__image" src="${entry.image}" alt="${entry.name}" loading="lazy">
              </div>
              <div class="food-card__body">
                <h3 class="food-card__name">${entry.name}</h3>
                <div class="food-card__footer">
                  <p class="food-card__price">${entry.price}</p>
                  <button class="food-card__btn" type="button">Open</button>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;

    document.getElementById('detail-back')?.addEventListener('click', () => showPage('menu'));
    attachCardListeners();
  }

  showPage('detail');
}

function mapCategory(category) {
  const map = {
    burgers: 'Burgers',
    fries: 'Fries',
    drinks: 'Drinks',
    chicken: 'Chicken',
    desserts: 'Desserts'
  };
  return map[category] || 'Menu';
}

document.addEventListener('DOMContentLoaded', init);
