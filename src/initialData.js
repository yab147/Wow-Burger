export const initialMenuItems = [
  {
    id: 'classic-cheeseburger',
    name: 'Wow Classic Cheeseburger',
    category_id: 'cat-burgers',
    price: 240,
    image_url: 'assets/classic_burger.png',
    badge: 'Bestseller',
    rating: '4.9',
    description: 'A flame-grilled beef patty with melted cheddar, fresh lettuce, tomato, pickles, and our signature Wow sauce on a toasted bun.',
    ingredients: ['Beef patty', 'Cheddar', 'Lettuce', 'Tomato', 'Pickle slices', 'Wow sauce'],
    highlights: ['Flame-grilled patty', 'Fresh toppings', 'House-made sauce'],
    nutrition: { calories: '680', protein: '38g', carbs: '42g', fat: '35g' }
  },
  {
    id: 'smoky-bacon-burger',
    name: 'Smoky BBQ Bacon Burger',
    category_id: 'cat-burgers',
    price: 290,
    image_url: 'assets/classic_burger.png',
    badge: 'Popular',
    rating: '4.8',
    description: 'Double beef layers, smoked bacon, caramelized onions, cheddar, and rich BBQ glaze for a bold bite.',
    ingredients: ['Double beef patty', 'Smoked bacon', 'Cheddar', 'Caramelized onions', 'BBQ glaze'],
    highlights: ['Bold BBQ flavor', 'Crispy bacon', 'Cheesy finish'],
    nutrition: { calories: '760', protein: '46g', carbs: '45g', fat: '44g' }
  },
  {
    id: 'spicy-chicken-burger',
    name: 'Spicy Chicken Burger',
    category_id: 'cat-burgers',
    price: 260,
    image_url: 'assets/chicken_burger.png',
    badge: 'Spicy',
    rating: '4.7',
    description: 'Crispy fried chicken breast layered with lettuce, pickles, and a spicy mayo kick on a toasted sesame bun.',
    ingredients: ['Crispy chicken', 'Spicy mayo', 'Lettuce', 'Pickles', 'Sesame bun'],
    highlights: ['Crunchy chicken', 'Spicy mayo', 'Golden bun'],
    nutrition: { calories: '590', protein: '32g', carbs: '48g', fat: '28g' }
  },
  {
    id: 'garden-veggie-burger',
    name: 'Garden Veggie Burger',
    category_id: 'cat-burgers',
    price: 210,
    image_url: 'assets/classic_burger.png',
    badge: 'Veggie',
    rating: '4.6',
    description: 'A grilled mushroom stack with fresh greens, roasted peppers, and herb mayo for a satisfying vegetarian option.',
    ingredients: ['Portobello mushroom', 'Roasted peppers', 'Arugula', 'Herb mayo', 'Gluten-free bun'],
    highlights: ['Vegetarian delight', 'Fresh greens', 'Balanced flavor'],
    nutrition: { calories: '430', protein: '18g', carbs: '36g', fat: '22g' }
  },
  {
    id: 'loaded-fries',
    name: 'Wow Loaded Fries',
    category_id: 'cat-fries',
    price: 160,
    image_url: 'assets/loaded_fries.png',
    badge: 'Bestseller',
    rating: '4.9',
    description: 'Golden fries topped with cheddar sauce, crispy bits, chives, and a sweet-spicy drizzle.',
    ingredients: ['French fries', 'Cheddar sauce', 'Crispy bits', 'Chives', 'Chipotle drizzle'],
    highlights: ['Loaded and rich', 'Crispy texture', 'Shareable size'],
    nutrition: { calories: '520', protein: '12g', carbs: '58g', fat: '28g' }
  },
  {
    id: 'cajun-fries',
    name: 'Cajun Crunch Fries',
    category_id: 'cat-fries',
    price: 100,
    image_url: 'assets/loaded_fries.png',
    badge: 'Spicy',
    rating: '4.5',
    description: 'Crisp seasoned fries with a smoky spice blend and a side of tangy ketchup.',
    ingredients: ['French fries', 'Cajun seasoning', 'Ketchup'],
    highlights: ['Spicy kick', 'Crispy crunch', 'Quick snack'],
    nutrition: { calories: '290', protein: '3g', carbs: '42g', fat: '11g' }
  },
  {
    id: 'citrus-cooler',
    name: 'Citrus Cooler',
    category_id: 'cat-drinks',
    price: 90,
    image_url: 'assets/chocolate_shake.png',
    badge: 'Refreshing',
    rating: '4.7',
    description: 'A citrus blend of fresh lemon, orange, and mint served over ice for a bright, energizing sip.',
    ingredients: ['Lemon', 'Orange', 'Mint', 'Sparkling water', 'Ice'],
    highlights: ['Fresh citrus', 'Light and crisp', 'Perfect with burgers'],
    nutrition: { calories: '120', protein: '0g', carbs: '30g', fat: '0g' }
  },
  {
    id: 'berry-fizz',
    name: 'Berry Fizz',
    category_id: 'cat-drinks',
    price: 85,
    image_url: 'assets/chocolate_shake.png',
    badge: 'Fresh',
    rating: '4.6',
    description: 'A chilled berry soda with a splash of citrus and a soft, fruity finish.',
    ingredients: ['Berry syrup', 'Citrus', 'Sparkling water', 'Ice'],
    highlights: ['Sweet and fruity', 'Cold and bubbly', 'Kid-friendly'],
    nutrition: { calories: '110', protein: '0g', carbs: '28g', fat: '0g' }
  },
  {
    id: 'spicy-chicken-wrap',
    name: 'Spicy Chicken Wrap',
    category_id: 'cat-chicken',
    price: 180,
    image_url: 'assets/chicken_burger.png',
    badge: 'New',
    rating: '4.8',
    description: 'Tender chicken strips wrapped in soft flatbread with lettuce, tomato, and a zesty sauce.',
    ingredients: ['Chicken strips', 'Flatbread', 'Lettuce', 'Tomato', 'Creamy sauce'],
    highlights: ['Handheld and filling', 'Balanced spice', 'Perfect lunch'],
    nutrition: { calories: '500', protein: '30g', carbs: '46g', fat: '22g' }
  },
  {
    id: 'tender-chicken-box',
    name: 'Tender Chicken Box',
    category_id: 'cat-chicken',
    price: 220,
    image_url: 'assets/chicken_burger.png',
    badge: 'Family Pack',
    rating: '4.7',
    description: 'A satisfying chicken combo with crispy tenders, fries, and a side of signature dip.',
    ingredients: ['Chicken tenders', 'Fries', 'Signature dip', 'Lemon wedge'],
    highlights: ['Shareable combo', 'Crispy coating', 'Comfort food'],
    nutrition: { calories: '610', protein: '35g', carbs: '52g', fat: '29g' }
  },
  {
    id: 'chocolate-sundae',
    name: 'Chocolate Sundae',
    category_id: 'cat-desserts',
    price: 140,
    image_url: 'assets/chocolate_shake.png',
    badge: 'Sweet',
    rating: '4.9',
    description: 'Vanilla ice cream topped with chocolate sauce, whipped cream, and crunchy nuggets.',
    ingredients: ['Vanilla ice cream', 'Chocolate sauce', 'Whipped cream', 'Crunchy nuggets'],
    highlights: ['Rich chocolate', 'Cold and creamy', 'Dessert favorite'],
    nutrition: { calories: '420', protein: '6g', carbs: '58g', fat: '19g' }
  },
  {
    id: 'strawberry-cheesecake',
    name: 'Strawberry Cheesecake',
    category_id: 'cat-desserts',
    price: 155,
    image_url: 'assets/chocolate_shake.png',
    badge: 'Fresh',
    rating: '4.8',
    description: 'Creamy cheesecake with a fresh strawberry topping and crumbly biscuit base.',
    ingredients: ['Cheesecake base', 'Strawberry topping', 'Cream', 'Crumb topping'],
    highlights: ['Creamy texture', 'Fresh fruit', 'Smooth finish'],
    nutrition: { calories: '390', protein: '7g', carbs: '46g', fat: '20g' }
  }
];

export const initialCategories = [
  {
    id: 'cat-burgers',
    name: 'Burgers',
    description: 'Fresh, juicy burgers.',
    image_url: '',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'cat-fries',
    name: 'Fries',
    description: 'Crispy golden fries.',
    image_url: '',
    sort_order: 2,
    is_active: true
  },
  {
    id: 'cat-drinks',
    name: 'Drinks',
    description: 'Refreshing beverages.',
    image_url: '',
    sort_order: 3,
    is_active: true
  },
  {
    id: 'cat-chicken',
    name: 'Chicken',
    description: 'Tender and crispy chicken.',
    image_url: '',
    sort_order: 4,
    is_active: true
  },
  {
    id: 'cat-desserts',
    name: 'Desserts',
    description: 'Sweet treats.',
    image_url: '',
    sort_order: 5,
    is_active: true
  }
];
