const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = 3000;

// === SECURITY CONFIG ===
const ADMIN_PASSWORD = "admin"; 

// === DATABASE CONNECTION ===
let db;

async function initDB() {
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });
  console.log('✅ Connected to SQLite database');
}
initDB();

// === MIDDLEWARE ===
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === API ROUTES ===

// 1. PRODUCTS (Public Read, Admin Write)
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products');
    res.json(products);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ message: "Not found" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/products', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });
  
  try {
    const { name, price, img, description } = req.body;
    const result = await db.run(
      'INSERT INTO products (name, price, img, description) VALUES (?, ?, ?, ?)',
      [name, price, img, description]
    );
    res.json({ success: true, id: result.lastID });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });

  try {
    const { name, price, img, description } = req.body;
    await db.run(
      'UPDATE products SET name = ?, price = ?, img = ?, description = ? WHERE id = ?',
      [name, price, img, description, req.params.id]
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });

  try {
    await db.run('DELETE FROM products WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. CONTACT MESSAGES (Public Write, Admin Read)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const date = new Date().toLocaleString();
    await db.run(
      'INSERT INTO messages (name, email, message, date) VALUES (?, ?, ?, ?)',
      [name, email, message, date]
    );
    res.json({ success: true, message: "Message saved!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/messages', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });
  try {
    const messages = await db.all('SELECT * FROM messages ORDER BY id DESC');
    res.json(messages);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. ORDERS (Public Write, Admin Read)
app.post('/api/orders', async (req, res) => {
  try {
    // Extract new fields
    const { customer_name, contact_number, address, city, total, items } = req.body;
    const date = new Date().toLocaleString();
    const itemsString = JSON.stringify(items);
    
    await db.run(
      'INSERT INTO orders (customer_name, contact_number, address, city, total, items, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_name, contact_number, address, city, total, itemsString, date]
    );
    res.json({ success: true, message: "Order placed!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/orders', async (req, res) => {
  if (req.headers['x-api-key'] !== ADMIN_PASSWORD) return res.status(403).json({ error: "⛔ Access Denied" });
  try {
    const orders = await db.all('SELECT * FROM orders ORDER BY id DESC');
    res.json(orders);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. LOGIN
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) res.json({ success: true });
  else res.status(401).json({ success: false, message: "Wrong password" });
});

// === FRONTEND ROUTES ===
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === START SERVER ===
app.listen(PORT, () => {
    console.log(`✅ Server is running locally at http://localhost:${PORT}`);
});