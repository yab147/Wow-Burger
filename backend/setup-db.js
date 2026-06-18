import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Setup Script
 * Run this once to create tables and seed initial data.
 * 
 * Usage: node server/setup-db.js
 */
async function setup() {
  console.log('');
  console.log('🍔 Wow Burger - Database Setup');
  console.log('═══════════════════════════════════════');
  console.log('');

  // Connect without specifying database (to create it)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    // Step 1: Run schema SQL
    console.log('📦 Step 1: Creating database and tables...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'sql', '001_schema.sql'),
      'utf8'
    );
    await connection.query(schemaSQL);
    console.log('   ✅ Schema created successfully.');

    // Step 2: Hash the admin password properly
    console.log('🔐 Step 2: Creating admin user...');
    const adminPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Check if admin user already exists
    await connection.query('USE wow_burger');
    const [existingAdmin] = await connection.query(
      "SELECT id FROM admin_users WHERE username = 'admin'"
    );

    if (existingAdmin.length === 0) {
      await connection.query(
        `INSERT INTO admin_users (username, password_hash, full_name, role) 
         VALUES (?, ?, ?, ?)`,
        ['admin', hashedPassword, 'Wow Burger Admin', 'super_admin']
      );
      console.log('   ✅ Admin user created (username: admin, password: admin123)');
    } else {
      // Update existing admin password hash
      await connection.query(
        `UPDATE admin_users SET password_hash = ? WHERE username = 'admin'`,
        [hashedPassword]
      );
      console.log('   ✅ Admin user already exists — password updated.');
    }

    // Step 3: Seed categories and menu items
    console.log('🌱 Step 3: Seeding categories and menu items...');
    
    // Check if data already exists
    const [existingCategories] = await connection.query(
      'SELECT COUNT(*) as count FROM categories'
    );

    if (existingCategories[0].count === 0) {
      // Read seed SQL but skip the admin_users insert (we handled it above)
      const seedSQL = fs.readFileSync(
        path.join(__dirname, 'sql', '002_seed_data.sql'),
        'utf8'
      );
      
      // Remove the admin_users INSERT and USE statement (we already handled them)
      const filteredSQL = seedSQL
        .split(';')
        .filter(statement => !statement.includes('INSERT INTO admin_users') && !statement.includes('USE wow_burger'))
        .join(';');

      await connection.query(filteredSQL);
      console.log('   ✅ Seed data inserted successfully.');
    } else {
      console.log('   ⚠️  Data already exists — skipping seed.');
    }

    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🎉 Database setup complete!');
    console.log('');
    console.log('   Admin Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('');
    console.log('   Start the server: npm run server');
    console.log('═══════════════════════════════════════');
    console.log('');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Check your DB_USER and DB_PASSWORD in .env');
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure MySQL is running on the configured host/port.');
    }
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setup();
