-- ============================================================
-- Wow Burger - MySQL Database Schema
-- Target: MySQL 8.0+
-- Run this file to create all tables and seed initial data
-- ============================================================

-- Create the database
CREATE DATABASE IF NOT EXISTS wow_burger
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE wow_burger;

-- ============================================================
-- 1. ADMIN USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'manager', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(512),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 3. MENU ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(512),
    badge VARCHAR(50),
    rating DECIMAL(2, 1) DEFAULT 0.0,
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    ingredients JSON,
    highlights JSON,
    dietary_tags JSON,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_category FOREIGN KEY (category_id) 
        REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_positive_price CHECK (base_price >= 0)
) ENGINE=InnoDB;

-- ============================================================
-- 4. NUTRITION INFO TABLE (1:1 with menu_items)
-- ============================================================
CREATE TABLE IF NOT EXISTS nutrition_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL UNIQUE,
    calories VARCHAR(20),
    protein VARCHAR(20),
    carbs VARCHAR(20),
    fat VARCHAR(20),
    CONSTRAINT fk_nutrition_item FOREIGN KEY (menu_item_id) 
        REFERENCES menu_items(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. MODIFIERS TABLE (Item Customization Groups)
-- ============================================================
CREATE TABLE IF NOT EXISTS modifiers (
    id VARCHAR(36) PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    min_selections INT DEFAULT 0,
    max_selections INT DEFAULT 1,
    CONSTRAINT fk_modifier_item FOREIGN KEY (menu_item_id) 
        REFERENCES menu_items(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. MODIFIER OPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS modifier_options (
    id VARCHAR(36) PRIMARY KEY,
    modifier_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    additional_price DECIMAL(10, 2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_option_modifier FOREIGN KEY (modifier_id) 
        REFERENCES modifiers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_positive_addition CHECK (additional_price >= 0)
) ENGINE=InnoDB;

-- ============================================================
-- 7. ALLERGENS TABLE (Reference/Lookup)
-- ============================================================
CREATE TABLE IF NOT EXISTS allergens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon_url VARCHAR(512)
) ENGINE=InnoDB;

-- ============================================================
-- 8. MENU ITEM ALLERGENS (Many-to-Many Join)
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_item_allergens (
    menu_item_id VARCHAR(36) NOT NULL,
    allergen_id INT NOT NULL,
    PRIMARY KEY (menu_item_id, allergen_id),
    CONSTRAINT fk_mia_item FOREIGN KEY (menu_item_id) 
        REFERENCES menu_items(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_mia_allergen FOREIGN KEY (allergen_id) 
        REFERENCES allergens(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- INDEXES FOR READ OPTIMIZATION
-- ============================================================
CREATE INDEX idx_categories_sort ON categories(sort_order);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_menu_items_category ON menu_items(category_id, is_available);
CREATE INDEX idx_menu_items_featured ON menu_items(is_featured, is_available);
CREATE INDEX idx_menu_items_sort ON menu_items(sort_order);
CREATE INDEX idx_modifiers_item ON modifiers(menu_item_id);
CREATE INDEX idx_modifier_options_mod ON modifier_options(modifier_id);
CREATE INDEX idx_nutrition_item ON nutrition_info(menu_item_id);
