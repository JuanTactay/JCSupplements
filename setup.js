const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setup() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  // Create Products Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      img TEXT,
      description TEXT
    )
  `);

  // Create Messages Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      message TEXT,
      date TEXT
    )
  `);

  // Create Orders Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      contact_number TEXT,
      address TEXT,
      city TEXT,
      total REAL,
      items TEXT,
      status TEXT DEFAULT 'Pending',
      payment_status TEXT DEFAULT 'Unpaid',
      payment_method TEXT,
      last_updated TEXT,
      date TEXT
    )
  `);

  const existing = await db.all('SELECT * FROM products');
  
  if (existing.length === 0) {
    console.log('🌱 Seeding database...');
    // Note: 'Whey S''mores' uses two single quotes to escape the apostrophe. This is correct SQL.
    await db.exec(`
      INSERT INTO products (name, price, img, description) VALUES
      ('Feral Pre-Workout', 2299, 'assets/preworkout.webp', 'Explosive energy and focus. Feral Pre-Workout is designed to help you crush your limits with 300mg of caffeine and beta-alanine for endurance.'),
      ('Whey S''mores', 3499, 'assets/protein.webp', 'Build lean muscle fast. Beast Protein delivers 25g of pure whey isolate per scoop, with zero fillers and digestive enzymes for quick absorption.'),
      ('Alpha Recovery', 1999, 'assets/bcaa.webp', 'Recover faster, train harder. Alpha Recovery loads your system with essential BCAAs and electrolytes to reduce soreness and hydration fatigue.')
    `);
    console.log('✅ Database populated!');
  } else {
    console.log('ℹ️ Database ready.');
  }
}

setup().catch(err => console.error(err));