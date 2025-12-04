const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setup() {
  // 1. Open (or create) the database file
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  // 2. Create the 'products' table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      img TEXT,
      description TEXT
    )
  `);

  // 3. Check if we already have data (to prevent duplicates)
  const existing = await db.all('SELECT * FROM products');
  if (existing.length === 0) {
    // 4. Insert the initial data (Seeding)
    console.log('🌱 Seeding database with initial products...');
    
    await db.exec(`
      INSERT INTO products (name, price, img, description) VALUES
      ('Feral Pre-Workout', 39.99, 'assets/preworkout.webp', 'Explosive energy and focus. Feral Pre-Workout is designed to help you crush your limits with 300mg of caffeine and beta-alanine for endurance.'),
      ('Whey S''mores', 49.99, 'assets/protein.webp', 'Build lean muscle fast. Beast Protein delivers 25g of pure whey isolate per scoop, with zero fillers and digestive enzymes for quick absorption.'),
      ('Alpha Recovery', 29.99, 'assets/bcaa.webp', 'Recover faster, train harder. Alpha Recovery loads your system with essential BCAAs and electrolytes to reduce soreness and hydration fatigue.')
    `);
    
    console.log('✅ Database populated successfully!');
  } else {
    console.log('ℹ️ Database already has data. Skipping seed.');
  }
}

setup().catch(err => {
  console.error('❌ Error setting up database:', err);
});