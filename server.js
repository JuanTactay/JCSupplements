const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const multer = require('multer');
const cookieParser = require('cookie-parser'); // MUST BE REQUIRED

const app = express();
const PORT = process.env.PORT || 3001; // Use the hosting port, or 3001 locally

// === SECURITY CONFIG ===
const ADMIN_PASSWORD = "admin"; 

// === FILE UPLOAD CONFIG (Multer) ===
const storage = multer.diskStorage({
  destination: './public/assets/',
  filename: (req, file, cb) => {
    // Create unique name: timestamp + original name
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

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

// ===============================================
// 1. CRITICAL MIDDLEWARE (MUST BE AT THE TOP)
// ===============================================
// Enables cookie reading BEFORE any route attempts to access them
app.use(cookieParser()); 
// Enables body parsing (reading JSON from requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ===============================================
// 2. PROTECTED ROUTE (MUST BE DEFINED AFTER COOKIEPARSER)
// ===============================================
app.get('/admin.html', (req, res) => {
  // This check now works because cookieParser has initialized req.cookies
  if (req.cookies.admin_token === ADMIN_PASSWORD) {
    res.sendFile(path.join(__dirname, 'private', 'admin.html'));
  } else {
    res.redirect('/login.html');
  }
});

// ===============================================
// 3. STATIC FILE SERVING (MUST BE DEFINED AFTER PROTECTED ROUTE)
// ===============================================
// If Express didn't hit /admin.html, it checks the public folder.
app.use(express.static(path.join(__dirname, 'public')));


// ===============================================
// 4. API ROUTES
// ===============================================

// LOGIN / LOGOUT
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    // Set a secure cookie for server-side page protection
    res.cookie('admin_token', password, { httpOnly: true }); 
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Wrong password" });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

// IMAGE UPLOAD ROUTE
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ success: true, filePath: 'assets/' + req.file.filename });
});

// PRODUCTS CRUD
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

// CONTACT MESSAGES
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

// ORDERS
app.post('/api/orders', async (req, res) => {
  try {
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


// ===============================================
// 5. START SERVER
// ===============================================
app.listen(PORT, () => {
    console.log(`✅ Server is running locally at http://localhost:${PORT}`);
});