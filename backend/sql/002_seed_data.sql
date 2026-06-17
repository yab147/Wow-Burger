-- ============================================================
-- Wow Burger - Seed Data
-- Run AFTER 001_schema.sql
-- ============================================================

USE wow_burger;

-- ============================================================
-- 1. Seed Admin User (password: admin123 - bcrypt hashed)
-- In production, generate a real hash with bcrypt
-- ============================================================
INSERT INTO admin_users (username, password_hash, full_name, role) VALUES
('admin', '$2b$10$YourHashHere', 'Wow Burger Admin', 'super_admin');

-- ============================================================
-- 2. Seed Categories
-- ============================================================
INSERT INTO categories (id, name, description, image_url, sort_order, is_active) VALUES
('cat-burgers', 'Burgers', 'Fresh, juicy burgers.', '', 1, TRUE),
('cat-fries', 'Fries', 'Crispy golden fries.', '', 2, TRUE),
('cat-drinks', 'Drinks', 'Refreshing beverages.', '', 3, TRUE),
('cat-chicken', 'Chicken', 'Tender and crispy chicken.', '', 4, TRUE),
('cat-desserts', 'Desserts', 'Sweet treats.', '', 5, TRUE);

-- ============================================================
-- 3. Seed Menu Items
-- ============================================================
INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, badge, rating, is_available, is_featured, ingredients, highlights) VALUES
(
  'classic-cheeseburger', 'cat-burgers', 'Wow Classic Cheeseburger',
  'A flame-grilled beef patty with melted cheddar, fresh lettuce, tomato, pickles, and our signature Wow sauce on a toasted bun.',
  240.00, 'assets/classic_burger.png', 'Bestseller', 4.9, TRUE, TRUE,
  '["Beef patty", "Cheddar", "Lettuce", "Tomato", "Pickle slices", "Wow sauce"]',
  '["Flame-grilled patty", "Fresh toppings", "House-made sauce"]'
),
(
  'smoky-bacon-burger', 'cat-burgers', 'Smoky BBQ Bacon Burger',
  'Double beef layers, smoked bacon, caramelized onions, cheddar, and rich BBQ glaze for a bold bite.',
  290.00, 'assets/classic_burger.png', 'Popular', 4.8, TRUE, TRUE,
  '["Double beef patty", "Smoked bacon", "Cheddar", "Caramelized onions", "BBQ glaze"]',
  '["Bold BBQ flavor", "Crispy bacon", "Cheesy finish"]'
),
(
  'spicy-chicken-burger', 'cat-burgers', 'Spicy Chicken Burger',
  'Crispy fried chicken breast layered with lettuce, pickles, and a spicy mayo kick on a toasted sesame bun.',
  260.00, 'assets/chicken_burger.png', 'Spicy', 4.7, TRUE, FALSE,
  '["Crispy chicken", "Spicy mayo", "Lettuce", "Pickles", "Sesame bun"]',
  '["Crunchy chicken", "Spicy mayo", "Golden bun"]'
),
(
  'garden-veggie-burger', 'cat-burgers', 'Garden Veggie Burger',
  'A grilled mushroom stack with fresh greens, roasted peppers, and herb mayo for a satisfying vegetarian option.',
  210.00, 'assets/classic_burger.png', 'Veggie', 4.6, TRUE, FALSE,
  '["Portobello mushroom", "Roasted peppers", "Arugula", "Herb mayo", "Gluten-free bun"]',
  '["Vegetarian delight", "Fresh greens", "Balanced flavor"]'
),
(
  'loaded-fries', 'cat-fries', 'Wow Loaded Fries',
  'Golden fries topped with cheddar sauce, crispy bits, chives, and a sweet-spicy drizzle.',
  160.00, 'assets/loaded_fries.png', 'Bestseller', 4.9, TRUE, TRUE,
  '["French fries", "Cheddar sauce", "Crispy bits", "Chives", "Chipotle drizzle"]',
  '["Loaded and rich", "Crispy texture", "Shareable size"]'
),
(
  'cajun-fries', 'cat-fries', 'Cajun Crunch Fries',
  'Crisp seasoned fries with a smoky spice blend and a side of tangy ketchup.',
  100.00, 'assets/loaded_fries.png', 'Spicy', 4.5, TRUE, FALSE,
  '["French fries", "Cajun seasoning", "Ketchup"]',
  '["Spicy kick", "Crispy crunch", "Quick snack"]'
),
(
  'citrus-cooler', 'cat-drinks', 'Citrus Cooler',
  'A citrus blend of fresh lemon, orange, and mint served over ice for a bright, energizing sip.',
  90.00, 'assets/chocolate_shake.png', 'Refreshing', 4.7, TRUE, FALSE,
  '["Lemon", "Orange", "Mint", "Sparkling water", "Ice"]',
  '["Fresh citrus", "Light and crisp", "Perfect with burgers"]'
),
(
  'berry-fizz', 'cat-drinks', 'Berry Fizz',
  'A chilled berry soda with a splash of citrus and a soft, fruity finish.',
  85.00, 'assets/chocolate_shake.png', 'Fresh', 4.6, TRUE, FALSE,
  '["Berry syrup", "Citrus", "Sparkling water", "Ice"]',
  '["Sweet and fruity", "Cold and bubbly", "Kid-friendly"]'
),
(
  'spicy-chicken-wrap', 'cat-chicken', 'Spicy Chicken Wrap',
  'Tender chicken strips wrapped in soft flatbread with lettuce, tomato, and a zesty sauce.',
  180.00, 'assets/chicken_burger.png', 'New', 4.8, TRUE, FALSE,
  '["Chicken strips", "Flatbread", "Lettuce", "Tomato", "Creamy sauce"]',
  '["Handheld and filling", "Balanced spice", "Perfect lunch"]'
),
(
  'tender-chicken-box', 'cat-chicken', 'Tender Chicken Box',
  'A satisfying chicken combo with crispy tenders, fries, and a side of signature dip.',
  220.00, 'assets/chicken_burger.png', 'Family Pack', 4.7, TRUE, FALSE,
  '["Chicken tenders", "Fries", "Signature dip", "Lemon wedge"]',
  '["Shareable combo", "Crispy coating", "Comfort food"]'
),
(
  'chocolate-sundae', 'cat-desserts', 'Chocolate Sundae',
  'Vanilla ice cream topped with chocolate sauce, whipped cream, and crunchy nuggets.',
  140.00, 'assets/chocolate_shake.png', 'Sweet', 4.9, TRUE, TRUE,
  '["Vanilla ice cream", "Chocolate sauce", "Whipped cream", "Crunchy nuggets"]',
  '["Rich chocolate", "Cold and creamy", "Dessert favorite"]'
),
(
  'strawberry-cheesecake', 'cat-desserts', 'Strawberry Cheesecake',
  'Creamy cheesecake with a fresh strawberry topping and crumbly biscuit base.',
  155.00, 'assets/chocolate_shake.png', 'Fresh', 4.8, TRUE, FALSE,
  '["Cheesecake base", "Strawberry topping", "Cream", "Crumb topping"]',
  '["Creamy texture", "Fresh fruit", "Smooth finish"]'
);

-- ============================================================
-- 4. Seed Nutrition Info
-- ============================================================
INSERT INTO nutrition_info (menu_item_id, calories, protein, carbs, fat) VALUES
('classic-cheeseburger', '680', '38g', '42g', '35g'),
('smoky-bacon-burger', '760', '46g', '45g', '44g'),
('spicy-chicken-burger', '590', '32g', '48g', '28g'),
('garden-veggie-burger', '430', '18g', '36g', '22g'),
('loaded-fries', '520', '12g', '58g', '28g'),
('cajun-fries', '290', '3g', '42g', '11g'),
('citrus-cooler', '120', '0g', '30g', '0g'),
('berry-fizz', '110', '0g', '28g', '0g'),
('spicy-chicken-wrap', '500', '30g', '46g', '22g'),
('tender-chicken-box', '610', '35g', '52g', '29g'),
('chocolate-sundae', '420', '6g', '58g', '19g'),
('strawberry-cheesecake', '390', '7g', '46g', '20g');

-- ============================================================
-- 5. Seed Allergens
-- ============================================================
INSERT INTO allergens (name, icon_url) VALUES
('Dairy', NULL),
('Gluten', NULL),
('Eggs', NULL),
('Soy', NULL),
('Nuts', NULL),
('Sesame', NULL);
