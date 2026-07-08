-- ============================================================
-- Wow Burger - Production Features Migration
-- Migration 003: Image Gallery, View Counts, Employee Management
-- ============================================================

USE wow_burger;

-- ============================================================
-- 1. ITEM IMAGE GALLERY TABLE (Multiple images per item)
-- ============================================================
CREATE TABLE IF NOT EXISTS item_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_image_item FOREIGN KEY (menu_item_id)
        REFERENCES menu_items(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_item_images_item ON item_images(menu_item_id, sort_order);

-- ============================================================
-- 2. VIEW COUNTS / ANALYTICS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS item_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL,
    view_count INT DEFAULT 0,
    last_viewed_at TIMESTAMP NULL,
    CONSTRAINT fk_views_item FOREIGN KEY (menu_item_id)
        REFERENCES menu_items(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_item_views (menu_item_id)
) ENGINE=InnoDB;

-- ============================================================
-- 3. ADD email AND phone TO admin_users (Employee Management)
-- ============================================================
ALTER TABLE admin_users
    ADD COLUMN IF NOT EXISTS email VARCHAR(150) UNIQUE AFTER full_name,
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER email;

-- ============================================================
-- 4. UPLOADED FILES TABLE (track uploaded images)
-- ============================================================
CREATE TABLE IF NOT EXISTS uploaded_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes INT,
    url VARCHAR(512),
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_file_admin FOREIGN KEY (uploaded_by)
        REFERENCES admin_users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
