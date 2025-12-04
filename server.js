const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = 3000;

// === SECURITY CONFIG ===
const ADMIN_PASSWORD = "admin"; // <--- CHANGE THIS IF YOU WANT

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

// GET: Fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Fetch Single Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await db.get('SELECT * FROM products WHERE id = ?', id);
    if (product) res.json(product);
    else res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Add a NEW product (SECURED)
app.post('/api/products', async (req, res) => {
  try {
    // 1. SECURITY CHECK
    const providedPassword = req.headers['x-api-key'];
    if (providedPassword !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: "⛔ Access Denied: Wrong Password" });
    }

    // 2. Data Logic
    const { name, price, img, description } = req.body;
    if (!name || !price || !img || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await db.run(
      'INSERT INTO products (name, price, img, description) VALUES (?, ?, ?, ?)',
      [name, price, img, description]
    );

    res.json({ 
      success: true, 
      id: result.lastID, 
      message: "Product added successfully!" 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Remove a product (SECURED)
app.delete('/api/products/:id', async (req, res) => {
  try {
    // 1. Security Check
    const providedPassword = req.headers['x-api-key'];
    if (providedPassword !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: "⛔ Access Denied" });
    }

    const id = req.params.id;
    
    // 2. Execute Delete
    const result = await db.run('DELETE FROM products WHERE id = ?', id);

    if (result.changes > 0) {
      res.json({ success: true, message: "Product deleted" });
    } else {
      res.status(404).json({ error: "Product not found" });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Handle Contact Form
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`📩 Contact: ${name} (${email}) says: ${message}`);
  res.json({ success: true, message: "Message received!" });
});

// === FRONTEND ROUTES ===
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === START SERVER ===
app.listen(PORT, () => {
    console.log(`✅ Server is running locally at http://localhost:${PORT}`);
});

// POST: Login Verification
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Wrong password" });
  }
});