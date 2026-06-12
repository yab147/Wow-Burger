
# Wow Burger - Digital Menu Database Schema (MVP)

This document outlines the comprehensive Minimum Viable Product (MVP) database schema for the Wow Burger dynamic digital menu. It is designed to be scalable and performant while supporting essential requirements such as menu categorization, complex item pricing, dynamic availability, and item customizations.

---

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    CATEGORIES ||--o{ MENU_ITEMS : contains
    MENU_ITEMS ||--o{ MODIFIERS : has
    MODIFIERS ||--o{ MODIFIER_OPTIONS : includes
    MENU_ITEMS ||--o{ MENU_ITEM_ALLERGENS : has
    ALLERGENS ||--o{ MENU_ITEM_ALLERGENS : linked_to

    CATEGORIES {
        varchar id PK
        string name
        string description
        string image_url
        int sort_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    MENU_ITEMS {
        varchar id PK
        varchar category_id FK
        string name
        string description
        decimal base_price
        string image_url
        boolean is_available
        boolean is_featured
        json dietary_tags
        int sort_order
        timestamp created_at
        timestamp updated_at
    }

    MODIFIERS {
        varchar id PK
        varchar menu_item_id FK
        string name
        boolean is_required
        int min_selections
        int max_selections
    }

    MODIFIER_OPTIONS {
        varchar id PK
        varchar modifier_id FK
        string name
        decimal additional_price
        boolean is_available
    }
    
    ALLERGENS {
        int id PK
        string name
        string icon_url
    }
    
    MENU_ITEM_ALLERGENS {
        varchar menu_item_id FK
        int allergen_id FK
    }
2. Table DefinitionsA. categoriesStores the top-level menu groupings (e.g., "Beef Burgers", "Chicken Sandwiches", "Sides", "Beverages").Column NameData TypeConstraintsDescriptionidVARCHAR(36)PRIMARY KEYUnique UUID identifier for the category.nameVARCHAR(100)NOT NULL, UNIQUEDisplay name of the category.descriptionTEXTNULLBrief description of the category.image_urlVARCHAR(512)NULLURL to a representative image for the category header.sort_orderINTDEFAULT 0Determines the display order on the main menu.is_activeBOOLEANDEFAULT TRUEAllows hiding a category without deleting it.created_atTIMESTAMPDEFAULT CURRENT_TIMESTAMPTimestamp of creation.updated_atTIMESTAMPDEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMPAuto-updating timestamp of last modification.B. menu_itemsStores the individual food and drink offerings.Column NameData TypeConstraintsDescriptionidVARCHAR(36)PRIMARY KEYUnique UUID identifier for the menu item.category_idVARCHAR(36)FOREIGN KEY, REFERENCES categories(id)Relates item to its core parent category.nameVARCHAR(150)NOT NULLDisplay name of the item.descriptionTEXTNULLDetailed description of the ingredients/taste.base_priceDECIMAL(10,2)NOT NULLThe starting price of the item (Must be >= 0).image_urlVARCHAR(512)NULLURL to the item's photo.is_availableBOOLEANDEFAULT TRUEToggle for item availability (e.g., temporarily out of stock).is_featuredBOOLEANDEFAULT FALSEUsed to highlight items in a "Popular" section.dietary_tagsJSONNULLJSON array of tags (e.g., ["vegan", "spicy"]).sort_orderINTDEFAULT 0Display order within its category.created_atTIMESTAMPDEFAULT CURRENT_TIMESTAMPTimestamp of creation.updated_atTIMESTAMPDEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMPAuto-updating timestamp of last modification.C. modifiers (Item Customization Groups)Handles grouping for item customizations, such as "Choose Size", "Meat Temperature", or "Extra Toppings".Column NameData TypeConstraintsDescriptionidVARCHAR(36)PRIMARY KEYUnique UUID identifier for the modifier group.menu_item_idVARCHAR(36)FOREIGN KEY, REFERENCES menu_items(id)Links customization layer to a specific food asset.nameVARCHAR(100)NOT NULLDisplay name (e.g., "Add-ons", "Select Size").is_requiredBOOLEANDEFAULT FALSEIf true, the customer must make a selection.min_selectionsINTDEFAULT 0Minimum number of options the user must choose.max_selectionsINTDEFAULT 1Maximum allowed selections (e.g., 5 for Toppings).D. modifier_optionsThe specific choices available within a modifier group.Column NameData TypeConstraintsDescriptionidVARCHAR(36)PRIMARY KEYUnique UUID identifier for the specific option.modifier_idVARCHAR(36)FOREIGN KEY, REFERENCES modifiers(id)Links alternative option to its modifier container table.nameVARCHAR(100)NOT NULLDisplay name (e.g., "Large", "Extra Bacon").additional_priceDECIMAL(10,2)DEFAULT 0.00Extra cost added to the base price if selected.is_availableBOOLEANDEFAULT TRUEToggle for option availability.E. allergens (Reference Table)Master list of common food allergens.Column NameData TypeConstraintsDescriptionidINTPRIMARY KEY, AUTO_INCREMENTAuto-incrementing standard lookup ID.nameVARCHAR(50)NOT NULL, UNIQUEAllergen name (e.g., "Peanuts", "Dairy").icon_urlVARCHAR(512)NULLOptional icon to display next to items on the menu.F. menu_item_allergens (Join Table)Many-to-many mapping of menu items to allergens.Column NameData TypeConstraintsDescriptionmenu_item_idVARCHAR(36)FOREIGN KEY, REFERENCES menu_items(id)Composite Primary Key part 1.allergen_idINTFOREIGN KEY, REFERENCES allergens(id)Composite Primary Key part 2.3. SQL Data Definition Language (DDL)SQL-- Target Database: MySQL (v8.0+)

-- 1. Create Categories Table
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(512),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create Menu Items Table
CREATE TABLE menu_items (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(512),
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    dietary_tags JSON,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT chk_positive_base_price CHECK (base_price >= 0)
);

-- 3. Create Modifiers Table
CREATE TABLE modifiers (
    id VARCHAR(36) PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    min_selections INT DEFAULT 0,
    max_selections INT DEFAULT 1,
    CONSTRAINT fk_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- 4. Create Modifier Options Table
CREATE TABLE modifier_options (
    id VARCHAR(36) PRIMARY KEY,
    modifier_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    additional_price DECIMAL(10, 2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_modifier FOREIGN KEY (modifier_id) REFERENCES modifiers(id) ON DELETE CASCADE,
    CONSTRAINT chk_positive_addition CHECK (additional_price >= 0)
);

-- 5. Create Allergens Reference Table
CREATE TABLE allergens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon_url VARCHAR(512)
);

-- 6. Create Menu Item Allergens Join Table (Many-to-Many)
CREATE TABLE menu_item_allergens (
    menu_item_id VARCHAR(36) NOT NULL,
    allergen_id INT NOT NULL,
    PRIMARY KEY (menu_item_id, allergen_id),
    CONSTRAINT fk_joint_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_joint_allergen FOREIGN KEY (allergen_id) REFERENCES allergens(id) ON DELETE CASCADE
);

-- Indexes for Read Optimization
CREATE INDEX idx_categories_order ON categories(sort_order);
CREATE INDEX idx_menu_items_category_lookup ON menu_items(category_id, is_available);
-- Multi-valued index for JSON filtering (MySQL 8.0+)
CREATE INDEX idx_menu_items_dietary ON menu_items((CAST(dietary_tags AS UNSIGNED ARRAY)));
CREATE INDEX idx_modifier_options_lookup ON modifier_options(modifier_id);
4. Key Design Decisions & Rationale (MySQL Specifics)Modifiers & Options: Instead of creating separate database rows for variations like a "Small Burger" and "Large Burger", the schema uses localized structural groupings via modifiers and modifier_options. This cleanly separates standard menu layouts from item configurations.Dynamic Availability: Both menu_items and modifier_options have an explicit is_available flag. This allows store managers to instantly trigger out-of-stock options via an administrative API without dropping active relations.Dietary Tags Architecture: Storing unstructured fields like dietary_tags as a native MySQL JSON data type removes the computational overhead of complex table joins for simple filtering tasks, optimized using MySQL 8.0's multi-valued array indexing.Data Integrity Types: Standard float variables are omitted in favor of the strict DECIMAL(10, 2) format for currency representation. This protects the data layer from precision loss and rounding errors.UUID Management in MySQL: Since MySQL lacks a native UUID data type, standard industry-compliant UUIDs are safely allocated as VARCHAR(36) fields. This guarantees uniform compatibility when parsing unique keys back and forth with client applications.Native Timing Automation: Rather than requiring manual PL/SQL procedural triggers, the TIMESTAMP fields utilize native MySQL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP definitions to manage audit logging seamlessly.